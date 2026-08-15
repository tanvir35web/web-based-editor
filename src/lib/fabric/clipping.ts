import type { Canvas, FabricObject } from 'fabric'
import { asEditorObject, getObjectMeta, tagObject, type EditorFabricObject } from './objects'
import type { EditorObjectType } from '../../types/objects'

interface ClipMaskMeta {
  type: EditorObjectType
  name: string
}

interface ClippedObject extends EditorFabricObject {
  clipMaskMeta?: ClipMaskMeta
}

/**
 * Illustrator/Figma-style clipping mask: the topmost of two selected objects
 * defines the visible region for the one below it. The mask shape is cloned
 * (Fabric requires a clipPath to be a detached object instance, in its own
 * absolute canvas coordinates) and removed from the canvas as an independent
 * object — its original type/name are stashed on the content object so
 * `releaseClippingMask` can restore a proper, re-tagged object later.
 */
export async function applyClippingMask(canvas: Canvas, maskObject: FabricObject, contentObject: FabricObject): Promise<void> {
  const maskMeta = getObjectMeta(maskObject)
  const maskClone = await maskObject.clone()
  maskClone.set({ absolutePositioned: true })

  contentObject.set({ clipPath: maskClone } as Partial<FabricObject>)
  ;(asEditorObject(contentObject) as ClippedObject).clipMaskMeta = { type: maskMeta.type, name: maskMeta.name }

  canvas.remove(maskObject)
  canvas.setActiveObject(contentObject)
  canvas.requestRenderAll()
}

export function hasClippingMask(object: FabricObject): boolean {
  return !!object.clipPath
}

export async function releaseClippingMask(canvas: Canvas, contentObject: FabricObject): Promise<void> {
  const clipPath = contentObject.clipPath
  if (!clipPath) return

  const meta = (asEditorObject(contentObject) as ClippedObject).clipMaskMeta
  // clipPath's declared type is a narrower FabricObject generic instantiation
  // than the one our helpers expect — the clone is a plain detached object
  // either way, so this cast is safe.
  const restored = (await clipPath.clone()) as FabricObject
  tagObject(restored, { name: meta?.name ?? 'Mask Shape', type: meta?.type ?? 'rect' })

  contentObject.set({ clipPath: undefined } as Partial<FabricObject>)
  ;(asEditorObject(contentObject) as ClippedObject).clipMaskMeta = undefined

  canvas.add(restored)
  canvas.setActiveObject(restored)
  canvas.requestRenderAll()
}
