import { Point, type Canvas, type FabricObject } from 'fabric'
import { getDocumentDimensions } from './canvas'
import type { EditorObjectMeta, EditorObjectType } from '../../types/objects'

/**
 * Fabric objects are extended at runtime with a handful of editor-owned
 * properties. This is the one place we assert that shape onto Fabric's type —
 * the documented "unavoidable" boundary between our domain and the library's.
 */
export interface EditorFabricObject extends FabricObject {
  id: string
  name: string
  locked: boolean
  editorType: EditorObjectType
}

export function asEditorObject(object: FabricObject): EditorFabricObject {
  return object as EditorFabricObject
}

export function createObjectId(): string {
  return crypto.randomUUID()
}

export function tagObject(
  object: FabricObject,
  { id, name, type }: { id?: string; name: string; type: EditorObjectType },
): EditorFabricObject {
  const editorObject = asEditorObject(object)
  editorObject.set({
    id: id ?? createObjectId(),
    name,
    locked: editorObject.locked ?? false,
    editorType: type,
  } as Partial<EditorFabricObject>)
  return editorObject
}

export function getObjectMeta(object: FabricObject): EditorObjectMeta {
  const editorObject = asEditorObject(object)
  return {
    id: editorObject.id,
    type: editorObject.editorType,
    name: editorObject.name,
    visible: editorObject.visible ?? true,
    locked: editorObject.locked ?? false,
  }
}

export function findObjectById(canvas: Canvas, id: string): EditorFabricObject | undefined {
  return canvas.getObjects().find((obj) => asEditorObject(obj).id === id) as EditorFabricObject | undefined
}

export function applyLockState(object: FabricObject, locked: boolean): void {
  const editorObject = asEditorObject(object)
  editorObject.set({
    locked,
    lockMovementX: locked,
    lockMovementY: locked,
    lockScalingX: locked,
    lockScalingY: locked,
    lockRotation: locked,
    hasControls: !locked,
    selectable: !locked,
  } as Partial<EditorFabricObject>)
}

export function setObjectVisibility(object: FabricObject, visible: boolean): void {
  object.set('visible', visible)
}

export async function duplicateObject(canvas: Canvas, object: FabricObject): Promise<EditorFabricObject> {
  const clone = await object.clone()
  const meta = getObjectMeta(object)
  clone.set({
    left: (object.left ?? 0) + 20,
    top: (object.top ?? 0) + 20,
  })
  tagObject(clone, { name: `${meta.name} copy`, type: meta.type })
  canvas.add(clone)
  canvas.setActiveObject(clone)
  canvas.requestRenderAll()
  return asEditorObject(clone)
}

export function deleteObjects(canvas: Canvas, objects: FabricObject[]): void {
  canvas.discardActiveObject()
  objects.forEach((obj) => canvas.remove(obj))
  canvas.requestRenderAll()
}

export function bringForward(canvas: Canvas, object: FabricObject): void {
  canvas.bringObjectForward(object)
  canvas.requestRenderAll()
}

export function sendBackward(canvas: Canvas, object: FabricObject): void {
  canvas.sendObjectBackwards(object)
  canvas.requestRenderAll()
}

export function bringToFront(canvas: Canvas, object: FabricObject): void {
  canvas.bringObjectToFront(object)
  canvas.requestRenderAll()
}

export function sendToBack(canvas: Canvas, object: FabricObject): void {
  canvas.sendObjectToBack(object)
  canvas.requestRenderAll()
}

export function moveObjectToIndex(canvas: Canvas, object: FabricObject, index: number): void {
  canvas.moveObjectTo(object, index)
  canvas.requestRenderAll()
}

export type HorizontalAlign = 'left' | 'center' | 'right'
export type VerticalAlign = 'top' | 'middle' | 'bottom'

export function alignObjects(
  canvas: Canvas,
  objects: FabricObject[],
  axis: HorizontalAlign | VerticalAlign,
): void {
  if (objects.length === 0) return
  const bounds = objects.map((obj) => obj.getBoundingRect())
  // Document space, not `canvas.getWidth()`/`getHeight()` — see getDocumentDimensions.
  const canvasBounds = getDocumentDimensions(canvas)
  const useSelectionBounds = objects.length > 1
  const minLeft = useSelectionBounds ? Math.min(...bounds.map((b) => b.left)) : 0
  const maxRight = useSelectionBounds
    ? Math.max(...bounds.map((b) => b.left + b.width))
    : canvasBounds.width
  const minTop = useSelectionBounds ? Math.min(...bounds.map((b) => b.top)) : 0
  const maxBottom = useSelectionBounds
    ? Math.max(...bounds.map((b) => b.top + b.height))
    : canvasBounds.height

  objects.forEach((obj, i) => {
    const rect = bounds[i]
    const center = obj.getCenterPoint()
    switch (axis) {
      case 'left':
        obj.setXY(new Point(minLeft + rect.width / 2, center.y), 'center', 'center')
        break
      case 'center':
        obj.setXY(new Point((minLeft + maxRight) / 2, center.y), 'center', 'center')
        break
      case 'right':
        obj.setXY(new Point(maxRight - rect.width / 2, center.y), 'center', 'center')
        break
      case 'top':
        obj.setXY(new Point(center.x, minTop + rect.height / 2), 'center', 'center')
        break
      case 'middle':
        obj.setXY(new Point(center.x, (minTop + maxBottom) / 2), 'center', 'center')
        break
      case 'bottom':
        obj.setXY(new Point(center.x, maxBottom - rect.height / 2), 'center', 'center')
        break
    }
    obj.setCoords()
  })
  canvas.requestRenderAll()
}

export function distributeObjects(canvas: Canvas, objects: FabricObject[], direction: 'horizontal' | 'vertical'): void {
  if (objects.length < 3) return
  const withBounds = objects.map((obj) => ({ obj, rect: obj.getBoundingRect() }))

  if (direction === 'horizontal') {
    withBounds.sort((a, b) => a.rect.left - b.rect.left)
    const first = withBounds[0]
    const last = withBounds[withBounds.length - 1]
    const totalSpan = last.rect.left + last.rect.width - first.rect.left
    const totalWidth = withBounds.reduce((sum, { rect }) => sum + rect.width, 0)
    const gap = (totalSpan - totalWidth) / (withBounds.length - 1)
    let cursor = first.rect.left
    withBounds.forEach(({ obj, rect }) => {
      const center = obj.getCenterPoint()
      obj.setXY(new Point(cursor + rect.width / 2, center.y), 'center', 'center')
      obj.setCoords()
      cursor += rect.width + gap
    })
  } else {
    withBounds.sort((a, b) => a.rect.top - b.rect.top)
    const first = withBounds[0]
    const last = withBounds[withBounds.length - 1]
    const totalSpan = last.rect.top + last.rect.height - first.rect.top
    const totalHeight = withBounds.reduce((sum, { rect }) => sum + rect.height, 0)
    const gap = (totalSpan - totalHeight) / (withBounds.length - 1)
    let cursor = first.rect.top
    withBounds.forEach(({ obj, rect }) => {
      const center = obj.getCenterPoint()
      obj.setXY(new Point(center.x, cursor + rect.height / 2), 'center', 'center')
      obj.setCoords()
      cursor += rect.height + gap
    })
  }
  canvas.requestRenderAll()
}
