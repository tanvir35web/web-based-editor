import { describe, it, expect } from 'vitest'
import { Canvas, Path } from 'fabric'
import {
  buildPathData,
  startPenTool,
  addPoint,
  updateHandleDrag,
  commitHandleDrag,
  updateRubberBand,
  removeLastPoint,
  isNearFirstPoint,
  finishPenTool,
  cancelPenTool,
  type PenToolStateRef,
  type PenPoint,
} from './penTool'

function makeCanvas() {
  return new Canvas(document.createElement('canvas'), { width: 800, height: 600 })
}

function makeState(): PenToolStateRef {
  return {
    points: [],
    previewPath: null,
    anchorMarkers: [],
    rubberBandPoint: null,
    isDraggingHandle: false,
    strokeColor: '#111111',
    strokeWidth: 4,
  }
}

const point = (x: number, y: number, handleIn: PenPoint['handleIn'] = null, handleOut: PenPoint['handleOut'] = null): PenPoint => ({
  x,
  y,
  handleIn,
  handleOut,
})

describe('buildPathData (pure)', () => {
  it('returns an empty string for no points', () => {
    expect(buildPathData([], null, false)).toBe('')
  })

  it('builds straight-line (L) segments between handle-less points', () => {
    const data = buildPathData([point(0, 0), point(10, 0), point(10, 10)], null, false)
    expect(data).toBe('M 0 0 L 10 0 L 10 10')
  })

  it('builds a cubic (C) segment when a point has a handle', () => {
    const data = buildPathData([point(0, 0, null, { x: 5, y: -5 }), point(10, 0, { x: 5, y: 5 })], null, false)
    expect(data).toBe('M 0 0 C 5 -5 5 5 10 0')
  })

  it('appends a rubber-band segment to the current cursor position', () => {
    const data = buildPathData([point(0, 0)], { x: 20, y: 20 }, false)
    expect(data).toBe('M 0 0 L 20 20')
  })

  it('appends Z when closing', () => {
    const data = buildPathData([point(0, 0), point(10, 0), point(10, 10)], null, true)
    expect(data.endsWith('Z')).toBe(true)
  })
})

describe('isNearFirstPoint', () => {
  it('is true within the close threshold of the first point', () => {
    const state = makeState()
    state.points = [point(100, 100)]
    expect(isNearFirstPoint(state, { x: 105, y: 100 })).toBe(true)
  })

  it('is false outside the close threshold', () => {
    const state = makeState()
    state.points = [point(100, 100)]
    expect(isNearFirstPoint(state, { x: 200, y: 100 })).toBe(false)
  })
})

describe('startPenTool / addPoint / removeLastPoint', () => {
  it('disables selection and target-finding for the session', () => {
    const canvas = makeCanvas()
    const state = makeState()
    startPenTool(canvas, state, { color: '#ff0000', width: 2 })
    expect(canvas.selection).toBe(false)
    expect(canvas.skipTargetFind).toBe(true)
  })

  it('adds a point and an anchor marker, and builds a (degenerate, moveto-only) preview path', () => {
    const canvas = makeCanvas()
    const state = makeState()
    startPenTool(canvas, state, { color: '#111111', width: 4 })
    addPoint(canvas, state, { x: 10, y: 10 })
    expect(state.points).toHaveLength(1)
    expect(state.anchorMarkers).toHaveLength(1)
    expect(canvas.getObjects().filter((o) => o instanceof Path)).toHaveLength(1)
  })

  it('rebuilds (rather than mutates) the preview path object on every added point', () => {
    const canvas = makeCanvas()
    const state = makeState()
    startPenTool(canvas, state, { color: '#111111', width: 4 })
    addPoint(canvas, state, { x: 0, y: 0 })
    commitHandleDrag(state)
    const firstPreview = state.previewPath
    addPoint(canvas, state, { x: 10, y: 10 })
    expect(state.previewPath).not.toBe(firstPreview)
    expect(canvas.getObjects().filter((o) => o instanceof Path)).toHaveLength(1) // old preview was removed, not left behind
  })

  it('removeLastPoint pops the point and its marker, refreshing the preview', () => {
    const canvas = makeCanvas()
    const state = makeState()
    startPenTool(canvas, state, { color: '#111111', width: 4 })
    addPoint(canvas, state, { x: 0, y: 0 })
    addPoint(canvas, state, { x: 10, y: 0 })
    expect(state.points).toHaveLength(2)
    removeLastPoint(canvas, state)
    expect(state.points).toHaveLength(1)
    expect(state.anchorMarkers).toHaveLength(1)
  })
})

describe('handle dragging', () => {
  it('sets a symmetric handleOut/handleIn pair when the drag exceeds the min distance', () => {
    const canvas = makeCanvas()
    const state = makeState()
    startPenTool(canvas, state, { color: '#111111', width: 4 })
    addPoint(canvas, state, { x: 50, y: 50 })
    updateHandleDrag(canvas, state, { x: 60, y: 50 })
    const anchor = state.points[0]
    expect(anchor.handleOut).toEqual({ x: 60, y: 50 })
    expect(anchor.handleIn).toEqual({ x: 40, y: 50 })
  })

  it('leaves handles null for a drag below the min distance (a plain click)', () => {
    const canvas = makeCanvas()
    const state = makeState()
    startPenTool(canvas, state, { color: '#111111', width: 4 })
    addPoint(canvas, state, { x: 50, y: 50 })
    updateHandleDrag(canvas, state, { x: 51, y: 50 })
    const anchor = state.points[0]
    expect(anchor.handleOut).toBeNull()
    expect(anchor.handleIn).toBeNull()
  })

  it('commitHandleDrag stops further drag updates from affecting the last point', () => {
    const canvas = makeCanvas()
    const state = makeState()
    startPenTool(canvas, state, { color: '#111111', width: 4 })
    addPoint(canvas, state, { x: 0, y: 0 })
    commitHandleDrag(state)
    updateHandleDrag(canvas, state, { x: 100, y: 100 })
    expect(state.points[0].handleOut).toBeNull()
  })
})

describe('updateRubberBand', () => {
  it('sets the rubber-band point only when not mid-drag', () => {
    const canvas = makeCanvas()
    const state = makeState()
    startPenTool(canvas, state, { color: '#111111', width: 4 })
    addPoint(canvas, state, { x: 0, y: 0 })
    commitHandleDrag(state)
    updateRubberBand(canvas, state, { x: 30, y: 30 })
    expect(state.rubberBandPoint).toEqual({ x: 30, y: 30 })
  })

  it('is a no-op while a handle is being dragged', () => {
    const canvas = makeCanvas()
    const state = makeState()
    startPenTool(canvas, state, { color: '#111111', width: 4 })
    addPoint(canvas, state, { x: 0, y: 0 }) // isDraggingHandle is now true
    updateRubberBand(canvas, state, { x: 30, y: 30 })
    expect(state.rubberBandPoint).toBeNull()
  })
})

describe('finishPenTool', () => {
  it('returns null and cleans up when fewer than 2 points were placed', () => {
    const canvas = makeCanvas()
    const state = makeState()
    startPenTool(canvas, state, { color: '#111111', width: 4 })
    addPoint(canvas, state, { x: 0, y: 0 })
    const result = finishPenTool(canvas, state, { close: false })
    expect(result).toBeNull()
    expect(canvas.getObjects()).toHaveLength(0)
    expect(canvas.selection).toBe(true)
    expect(canvas.skipTargetFind).toBe(false)
  })

  it('creates a tagged, selectable Path object from >= 2 points and cleans up scaffolding', () => {
    const canvas = makeCanvas()
    const state = makeState()
    startPenTool(canvas, state, { color: '#ff00ff', width: 6 })
    addPoint(canvas, state, { x: 0, y: 0 })
    commitHandleDrag(state)
    addPoint(canvas, state, { x: 50, y: 0 })
    commitHandleDrag(state)
    addPoint(canvas, state, { x: 50, y: 50 })
    commitHandleDrag(state)

    const result = finishPenTool(canvas, state, { close: true })

    expect(result).not.toBeNull()
    expect(result).toBeInstanceOf(Path)
    expect(result!.editorType).toBe('path')
    expect(result!.name).toBe('Path')
    expect(result!.stroke).toBe('#ff00ff')
    expect(result!.strokeWidth).toBe(6)
    expect(result!.fill).toBe('transparent')
    // Only the finished path remains — preview + anchor markers were removed.
    expect(canvas.getObjects()).toEqual([result])
    expect(canvas.selection).toBe(true)
    expect(canvas.skipTargetFind).toBe(false)
  })
})

describe('cancelPenTool', () => {
  it('removes all scaffolding and leaves nothing on the canvas', () => {
    const canvas = makeCanvas()
    const state = makeState()
    startPenTool(canvas, state, { color: '#111111', width: 4 })
    addPoint(canvas, state, { x: 0, y: 0 })
    addPoint(canvas, state, { x: 10, y: 10 })

    cancelPenTool(canvas, state)

    expect(canvas.getObjects()).toHaveLength(0)
    expect(state.points).toHaveLength(0)
    expect(canvas.selection).toBe(true)
    expect(canvas.skipTargetFind).toBe(false)
  })
})
