import { FabricImage, type Canvas } from 'fabric'
import { computeFitScale } from '../utils/scaling'
import { tagObject, type EditorFabricObject } from './objects'
import { getDocumentDimensions } from './canvas'
import { createDefaultAdjustments } from '../editor/defaults'
import { applyAdjustments } from './filters'
import type { AdjustmentValues } from '../../types/objects'

const FIT_MARGIN_RATIO = 0.9

export type EditorImageObject = FabricImage & EditorFabricObject & { adjustments: AdjustmentValues }

export async function addImageFromUrl(canvas: Canvas, url: string, name = 'Image'): Promise<EditorImageObject> {
  const image = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' })
  // Document space, not `canvas.getWidth()`/`getHeight()` — those return the
  // zoom-scaled canvas element size (see getDocumentDimensions), and using
  // them here would fit/center the image relative to the wrong scale
  // whenever the user isn't at 100% zoom.
  const { width: docWidth, height: docHeight } = getDocumentDimensions(canvas)
  const scale = computeFitScale(
    { width: image.width, height: image.height },
    { width: docWidth * FIT_MARGIN_RATIO, height: docHeight * FIT_MARGIN_RATIO },
  )

  image.set({
    left: docWidth / 2,
    top: docHeight / 2,
    originX: 'center',
    originY: 'center',
    scaleX: scale,
    scaleY: scale,
  })

  const editorImage = tagObject(image, { name, type: 'image' }) as EditorImageObject
  editorImage.adjustments = createDefaultAdjustments()

  canvas.add(editorImage)
  canvas.setActiveObject(editorImage)
  canvas.requestRenderAll()
  return editorImage
}

export function isEditorImage(object: unknown): object is EditorImageObject {
  return object instanceof FabricImage
}

export function getImageAdjustments(image: EditorImageObject): AdjustmentValues {
  return image.adjustments ?? createDefaultAdjustments()
}

export function setImageAdjustments(canvas: Canvas, image: EditorImageObject, adjustments: AdjustmentValues): void {
  image.adjustments = adjustments
  applyAdjustments(image, adjustments)
  canvas.requestRenderAll()
}
