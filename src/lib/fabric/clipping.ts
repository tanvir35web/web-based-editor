import { util, type Canvas, type FabricObject } from 'fabric'
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
 * (Fabric requires a clipPath to be a detached object instance) and removed
 * from the canvas as an independent object — its original type/name are
 * stashed on the content object so `releaseClippingMask` can restore a
 * proper, re-tagged object later.
 */
export async function applyClippingMask(canvas: Canvas, maskObject: FabricObject, contentObject: FabricObject): Promise<void> {
  // Both objects are still part of the just-active multi-selection
  // (ActiveSelection) at this point, which reparents them under a group and
  // rewrites their left/top to be group-relative rather than absolute —
  // clearing the selection first (before reading/cloning anything) ensures
  // everything below works with each object's true canvas-space transform.
  canvas.discardActiveObject()

  const maskMeta = getObjectMeta(maskObject)
  const maskClone = await maskObject.clone()
  // Move the clip from canvas/world space into the content object's own
  // local space, preserving its current visual appearance exactly (Fabric's
  // documented pattern for handing a clipPath to a specific object — see
  // sendObjectToPlane's JSDoc). This is what makes the mask travel with the
  // content object afterward: move/rotate/scale the object and the clip
  // moves/rotates/scales right along with it, instead of staying pinned to
  // its original canvas position (which `absolutePositioned: true` would do).
  util.sendObjectToPlane(maskClone, undefined, contentObject.calcTransformMatrix())

  contentObject.set({ clipPath: maskClone } as Partial<FabricObject>)
  ;(asEditorObject(contentObject) as ClippedObject).clipMaskMeta = { type: maskMeta.type, name: maskMeta.name }
  // `clipPath` isn't one of Fabric's `cacheProperties`, so `.set()` doesn't
  // mark the object dirty on its own — without this it can keep rendering
  // its pre-clip cached bitmap.
  contentObject.set('dirty', true)

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
  // Reverse of applyClippingMask's sendObjectToPlane call: convert back from
  // the content object's local space to canvas/world space, so it becomes a
  // normal independent object again in the same place it visually appeared.
  util.sendObjectToPlane(restored, contentObject.calcTransformMatrix(), undefined)
  tagObject(restored, { name: meta?.name ?? 'Mask Shape', type: meta?.type ?? 'rect' })

  contentObject.set({ clipPath: undefined } as Partial<FabricObject>)
  ;(asEditorObject(contentObject) as ClippedObject).clipMaskMeta = undefined
  contentObject.set('dirty', true)

  canvas.add(restored)
  canvas.setActiveObject(restored)
  canvas.requestRenderAll()
}
