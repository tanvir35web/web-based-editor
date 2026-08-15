import { describe, it, expect } from 'vitest'
import { Canvas, Rect, Triangle, Circle, type FabricObject } from 'fabric'
import { addSquare, addRectangle, addTriangle, addCircle, getShapeProps, updateShapeProps } from './shapes'

function makeCanvas() {
  return new Canvas(document.createElement('canvas'), { width: 800, height: 600 })
}

describe('addSquare / addRectangle / addTriangle / addCircle', () => {
  it('adds a Rect with equal width/height for a square, tagged and selected', () => {
    const canvas = makeCanvas()
    const square = addSquare(canvas)
    expect(square).toBeInstanceOf(Rect)
    expect(square.width).toBe(square.height)
    expect(square.editorType).toBe('rect')
    expect(square.name).toBe('Square')
    expect(canvas.getActiveObject()).toBe(square)
  })

  it('adds a Rect wider than it is tall for a rectangle', () => {
    const canvas = makeCanvas()
    const rect = addRectangle(canvas)
    expect(rect).toBeInstanceOf(Rect)
    expect(rect.width).toBeGreaterThan(rect.height!)
    expect(rect.editorType).toBe('rect')
  })

  it('adds a Triangle tagged with type triangle', () => {
    const canvas = makeCanvas()
    const triangle = addTriangle(canvas)
    expect(triangle).toBeInstanceOf(Triangle)
    expect(triangle.editorType).toBe('triangle')
  })

  it('adds a Circle tagged with type circle', () => {
    const canvas = makeCanvas()
    const circle = addCircle(canvas)
    expect(circle).toBeInstanceOf(Circle)
    expect(circle.editorType).toBe('circle')
  })

  it('centers every shape on the canvas', () => {
    const canvas = makeCanvas()
    const square = addSquare(canvas)
    const center = canvas.getCenterPoint()
    expect(square.left).toBeCloseTo(center.x)
    expect(square.top).toBeCloseTo(center.y)
  })
})

describe('getShapeProps / updateShapeProps', () => {
  it('reads fill/stroke/strokeWidth/cornerRadius off a rect', () => {
    const canvas = makeCanvas()
    const rect = addSquare(canvas)
    const props = getShapeProps(rect)
    expect(props.fill).toMatch(/^#/)
    expect(props.strokeWidth).toBeGreaterThanOrEqual(0)
    expect(props.cornerRadius).toBe(0)
  })

  it('reports cornerRadius as 0 for non-rect shapes (no rx/ry concept)', () => {
    const canvas = makeCanvas()
    const triangle = addTriangle(canvas)
    expect(getShapeProps(triangle).cornerRadius).toBe(0)
  })

  it('updates fill/stroke/strokeWidth and re-renders', () => {
    const canvas = makeCanvas()
    const rect = addSquare(canvas)
    updateShapeProps(canvas, rect, { fill: '#ff0000', stroke: '#00ff00', strokeWidth: 5 })
    expect(rect.fill).toBe('#ff0000')
    expect(rect.stroke).toBe('#00ff00')
    expect(rect.strokeWidth).toBe(5)
  })

  it('sets rx/ry on a rect when cornerRadius is updated', () => {
    const canvas = makeCanvas()
    const rect = addSquare(canvas)
    updateShapeProps(canvas, rect, { cornerRadius: 24 })
    expect((rect as FabricObject as Rect).rx).toBe(24)
    expect((rect as FabricObject as Rect).ry).toBe(24)
    expect(getShapeProps(rect).cornerRadius).toBe(24)
  })

  it('ignores cornerRadius updates on non-rect shapes', () => {
    const canvas = makeCanvas()
    const circle = addCircle(canvas)
    updateShapeProps(canvas, circle, { cornerRadius: 24 })
    expect(getShapeProps(circle).cornerRadius).toBe(0)
  })
})
