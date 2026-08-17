import { Circle, PencilBrush, Rect, Triangle, type Canvas, type FabricObject } from 'fabric'
import { createDefaultShapeProps } from '../editor/defaults'
import { EDITOR_DEFAULTS } from '../editor/constants'
import { tagObject, type EditorFabricObject } from './objects'
import { getDocumentDimensions } from './canvas'
import { fillValueToFabricFill, fabricFillToFillValue } from './fill'
import type { ShapeObjectProps, ShapeType } from '../../types/objects'

const DEFAULT_SIZE = 160

function placeAtCenter(canvas: Canvas, object: FabricObject): void {
  // Document space, not `canvas.getCenterPoint()` — see getDocumentDimensions.
  const { width, height } = getDocumentDimensions(canvas)
  object.set({ left: width / 2, top: height / 2, originX: 'center', originY: 'center' })
}

function addShape(canvas: Canvas, object: FabricObject, name: string, type: ShapeType): EditorFabricObject {
  placeAtCenter(canvas, object)
  const editorObject = tagObject(object, { name, type })
  canvas.add(editorObject)
  canvas.setActiveObject(editorObject)
  canvas.requestRenderAll()
  return editorObject
}

export function addSquare(canvas: Canvas): EditorFabricObject {
  const props = createDefaultShapeProps()
  const rect = new Rect({
    width: DEFAULT_SIZE,
    height: DEFAULT_SIZE,
    fill: fillValueToFabricFill(props.fill, { width: DEFAULT_SIZE, height: DEFAULT_SIZE }),
    stroke: props.stroke,
    strokeWidth: props.strokeWidth,
    rx: props.cornerRadius,
    ry: props.cornerRadius,
  })
  return addShape(canvas, rect, 'Square', 'rect')
}

export function addRectangle(canvas: Canvas): EditorFabricObject {
  const props = createDefaultShapeProps()
  const rect = new Rect({
    width: DEFAULT_SIZE * 1.5,
    height: DEFAULT_SIZE,
    fill: fillValueToFabricFill(props.fill, { width: DEFAULT_SIZE * 1.5, height: DEFAULT_SIZE }),
    stroke: props.stroke,
    strokeWidth: props.strokeWidth,
    rx: props.cornerRadius,
    ry: props.cornerRadius,
  })
  return addShape(canvas, rect, 'Rectangle', 'rect')
}

export function addTriangle(canvas: Canvas): EditorFabricObject {
  const props = createDefaultShapeProps()
  const triangle = new Triangle({
    width: DEFAULT_SIZE,
    height: DEFAULT_SIZE,
    fill: fillValueToFabricFill(props.fill, { width: DEFAULT_SIZE, height: DEFAULT_SIZE }),
    stroke: props.stroke,
    strokeWidth: props.strokeWidth,
  })
  return addShape(canvas, triangle, 'Triangle', 'triangle')
}

export function addCircle(canvas: Canvas): EditorFabricObject {
  const props = createDefaultShapeProps()
  const diameter = DEFAULT_SIZE
  const circle = new Circle({
    radius: DEFAULT_SIZE / 2,
    fill: fillValueToFabricFill(props.fill, { width: diameter, height: diameter }),
    stroke: props.stroke,
    strokeWidth: props.strokeWidth,
  })
  return addShape(canvas, circle, 'Circle', 'circle')
}

function isRect(object: FabricObject): object is Rect {
  return object instanceof Rect
}

export function getShapeProps(object: FabricObject): ShapeObjectProps {
  return {
    fill: fabricFillToFillValue(object.fill),
    stroke: typeof object.stroke === 'string' ? object.stroke : '#000000',
    strokeWidth: object.strokeWidth ?? 0,
    cornerRadius: isRect(object) ? (object.rx ?? 0) : 0,
  }
}

export function updateShapeProps(canvas: Canvas, object: FabricObject, patch: Partial<ShapeObjectProps>): void {
  const update: Record<string, unknown> = {}
  if (patch.fill !== undefined) {
    update.fill = fillValueToFabricFill(patch.fill, { width: object.width ?? 0, height: object.height ?? 0 })
  }
  if (patch.stroke !== undefined) update.stroke = patch.stroke
  if (patch.strokeWidth !== undefined) update.strokeWidth = patch.strokeWidth
  if (patch.cornerRadius !== undefined && isRect(object)) {
    update.rx = patch.cornerRadius
    update.ry = patch.cornerRadius
  }
  object.set(update)
  object.setCoords()
  canvas.requestRenderAll()
}

export interface FreeDrawOptions {
  color: string
  width: number
}

export function startFreeDraw(canvas: Canvas, options: FreeDrawOptions = { color: EDITOR_DEFAULTS.DEFAULT_DRAW_STROKE, width: EDITOR_DEFAULTS.DEFAULT_DRAW_STROKE_WIDTH }): void {
  canvas.discardActiveObject()
  const brush = new PencilBrush(canvas)
  brush.color = options.color
  brush.width = options.width
  canvas.freeDrawingBrush = brush
  canvas.isDrawingMode = true
  canvas.requestRenderAll()
}

export function stopFreeDraw(canvas: Canvas): void {
  canvas.isDrawingMode = false
  canvas.requestRenderAll()
}

/** Tags a freehand path created by the drawing brush so it behaves like any other editor object. */
export function tagFreeDrawnPath(object: FabricObject): EditorFabricObject {
  return tagObject(object, { name: 'Drawing', type: 'path' })
}
