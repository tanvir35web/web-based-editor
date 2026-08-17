import { Circle, Path, type Canvas } from 'fabric'
import { tagObject, type EditorFabricObject } from './objects'

const CLOSE_THRESHOLD = 10 // document-space px — same style as snapping.ts's threshold
const MIN_DRAG_DISTANCE = 2 // document-space px — below this, a click is treated as a plain (handle-less) point
const ANCHOR_MARKER_RADIUS = 3
const ANCHOR_MARKER_COLOR = '#6366f1'

export interface PenPoint {
  x: number
  y: number
  handleIn: { x: number; y: number } | null
  handleOut: { x: number; y: number } | null
}

export interface PenToolStateRef {
  points: PenPoint[]
  previewPath: Path | null
  anchorMarkers: Circle[]
  rubberBandPoint: { x: number; y: number } | null
  isDraggingHandle: boolean
  strokeColor: string
  strokeWidth: number
}

/**
 * Pure — no Fabric import. Builds an SVG path `d` string from anchor points.
 * A cubic bezier whose control points coincide with its own endpoints is
 * mathematically a straight line, so a segment only needs one branch: `C`
 * whenever either endpoint has a handle, `L` otherwise — no separate
 * "was this a drag or a plain click" distinction needed here.
 */
export function buildPathData(
  points: PenPoint[],
  rubberBand: { x: number; y: number } | null,
  close: boolean,
): string {
  if (points.length === 0) return ''

  const segments = [`M ${points[0].x} ${points[0].y}`]
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    if (prev.handleOut || curr.handleIn) {
      const c1 = prev.handleOut ?? prev
      const c2 = curr.handleIn ?? curr
      segments.push(`C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${curr.x} ${curr.y}`)
    } else {
      segments.push(`L ${curr.x} ${curr.y}`)
    }
  }

  if (rubberBand) {
    const last = points[points.length - 1]
    if (last.handleOut) {
      segments.push(`C ${last.handleOut.x} ${last.handleOut.y} ${rubberBand.x} ${rubberBand.y} ${rubberBand.x} ${rubberBand.y}`)
    } else {
      segments.push(`L ${rubberBand.x} ${rubberBand.y}`)
    }
  }

  if (close) segments.push('Z')
  return segments.join(' ')
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function isNearFirstPoint(state: PenToolStateRef, point: { x: number; y: number }): boolean {
  const first = state.points[0]
  return first !== undefined && distance(first, point) <= CLOSE_THRESHOLD
}

export function startPenTool(
  canvas: Canvas,
  state: PenToolStateRef,
  options: { color: string; width: number },
): void {
  canvas.discardActiveObject()
  canvas.selection = false
  canvas.skipTargetFind = true
  state.points = []
  state.previewPath = null
  state.anchorMarkers = []
  state.rubberBandPoint = null
  state.isDraggingHandle = false
  state.strokeColor = options.color
  state.strokeWidth = options.width
  canvas.requestRenderAll()
}

function refreshPreview(canvas: Canvas, state: PenToolStateRef, close = false): void {
  if (state.previewPath) canvas.remove(state.previewPath)
  const data = buildPathData(state.points, state.rubberBandPoint, close)
  if (!data) {
    state.previewPath = null
    canvas.requestRenderAll()
    return
  }
  const preview = new Path(data, {
    fill: '',
    stroke: state.strokeColor,
    strokeWidth: state.strokeWidth,
    strokeDashArray: [4, 4],
    selectable: false,
    evented: false,
  })
  state.previewPath = preview
  canvas.add(preview)
  canvas.requestRenderAll()
}

export function addPoint(canvas: Canvas, state: PenToolStateRef, point: { x: number; y: number }): void {
  state.points.push({ x: point.x, y: point.y, handleIn: null, handleOut: null })
  const marker = new Circle({
    left: point.x,
    top: point.y,
    radius: ANCHOR_MARKER_RADIUS,
    originX: 'center',
    originY: 'center',
    fill: ANCHOR_MARKER_COLOR,
    stroke: '#ffffff',
    strokeWidth: 1,
    selectable: false,
    evented: false,
  })
  state.anchorMarkers.push(marker)
  canvas.add(marker)
  state.isDraggingHandle = true
  refreshPreview(canvas, state)
}

/** Called on `mouse:move` while the mouse button is held after `addPoint` placed the current anchor. */
export function updateHandleDrag(canvas: Canvas, state: PenToolStateRef, cursor: { x: number; y: number }): void {
  if (!state.isDraggingHandle || state.points.length === 0) return
  const anchor = state.points[state.points.length - 1]
  const dx = cursor.x - anchor.x
  const dy = cursor.y - anchor.y
  if (Math.hypot(dx, dy) < MIN_DRAG_DISTANCE) {
    anchor.handleOut = null
    anchor.handleIn = null
  } else {
    anchor.handleOut = { x: anchor.x + dx, y: anchor.y + dy }
    anchor.handleIn = { x: anchor.x - dx, y: anchor.y - dy }
  }
  refreshPreview(canvas, state)
}

export function commitHandleDrag(state: PenToolStateRef): void {
  state.isDraggingHandle = false
}

export function updateRubberBand(canvas: Canvas, state: PenToolStateRef, cursor: { x: number; y: number }): void {
  if (state.isDraggingHandle) return
  state.rubberBandPoint = cursor
  refreshPreview(canvas, state)
}

export function updateStrokeStyle(canvas: Canvas, state: PenToolStateRef, options: { color?: string; width?: number }): void {
  if (options.color !== undefined) state.strokeColor = options.color
  if (options.width !== undefined) state.strokeWidth = options.width
  refreshPreview(canvas, state)
}

export function removeLastPoint(canvas: Canvas, state: PenToolStateRef): void {
  if (state.points.length === 0) return
  state.points.pop()
  const marker = state.anchorMarkers.pop()
  if (marker) canvas.remove(marker)
  refreshPreview(canvas, state)
}

function cleanupSession(canvas: Canvas, state: PenToolStateRef): void {
  if (state.previewPath) canvas.remove(state.previewPath)
  state.anchorMarkers.forEach((marker) => canvas.remove(marker))
  state.points = []
  state.previewPath = null
  state.anchorMarkers = []
  state.rubberBandPoint = null
  state.isDraggingHandle = false
  canvas.selection = true
  canvas.skipTargetFind = false
}

export function finishPenTool(
  canvas: Canvas,
  state: PenToolStateRef,
  options: { close: boolean },
): EditorFabricObject | null {
  if (state.points.length < 2) {
    cleanupSession(canvas, state)
    canvas.requestRenderAll()
    return null
  }

  const data = buildPathData(state.points, null, options.close)
  const { strokeColor, strokeWidth } = state
  cleanupSession(canvas, state)

  const path = new Path(data, { fill: 'transparent', stroke: strokeColor, strokeWidth })
  const editorObject = tagObject(path, { name: 'Path', type: 'path' })
  canvas.add(editorObject)
  canvas.requestRenderAll()
  return editorObject
}

export function cancelPenTool(canvas: Canvas, state: PenToolStateRef): void {
  cleanupSession(canvas, state)
  canvas.requestRenderAll()
}
