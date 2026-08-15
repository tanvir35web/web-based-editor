import { FabricImage, Rect, type Canvas } from 'fabric'
import type { CropStateRef, CropOriginalState } from '../editor/EditorCanvasContext'
import { clamp } from '../utils/scaling'

const PREVIEW_DIM_OPACITY = 0.35
const CROP_RECT_COLOR = '#6366f1'

function getSourceSize(image: FabricImage): { width: number; height: number } {
  const element = image.getElement()
  const asImg = element as HTMLImageElement
  if (asImg.naturalWidth) return { width: asImg.naturalWidth, height: asImg.naturalHeight }
  const asCanvas = element as HTMLCanvasElement
  return { width: asCanvas.width, height: asCanvas.height }
}

function syncPreviewClip(previewImage: FabricImage, cropRect: Rect): void {
  if (!previewImage.clipPath) {
    previewImage.clipPath = new Rect({ absolutePositioned: true, originX: 'center', originY: 'center' })
  }
  const bounds = cropRect.getBoundingRect()
  previewImage.clipPath.set({
    left: bounds.left + bounds.width / 2,
    top: bounds.top + bounds.height / 2,
    width: bounds.width,
    height: bounds.height,
    scaleX: 1,
    scaleY: 1,
  })
}

/**
 * Reveals the full source image (so a previous crop can be expanded, not
 * just shrunk further) and adds an interactive crop rectangle plus a bright
 * "spotlight" preview clipped to it. Rotation is reset to 0 for the duration
 * — crop math is done in the image's own unrotated frame — and restored on
 * apply/cancel.
 */
export function enterCropMode(canvas: Canvas, state: CropStateRef, image: FabricImage): void {
  const source = getSourceSize(image)
  const original: CropOriginalState = {
    cropX: image.cropX ?? 0,
    cropY: image.cropY ?? 0,
    width: image.width,
    height: image.height,
    scaleX: image.scaleX ?? 1,
    scaleY: image.scaleY ?? 1,
    left: image.left ?? 0,
    top: image.top ?? 0,
    angle: image.angle ?? 0,
    opacity: image.opacity ?? 1,
  }
  state.original = original
  state.targetImage = image

  // The previously-visible crop window's on-screen box, unchanged — the
  // crop rect starts out exactly there. Both the image and the crop rect
  // use center origin throughout (matching how every image in this app is
  // created), so `left`/`top` below are center coordinates, not top-left.
  const windowWidth = original.width * original.scaleX
  const windowHeight = original.height * original.scaleY

  // Re-center the full (uncropped) image so that window stays in place: the
  // offset from the full image's center to the old window's center, scaled.
  const offsetX = (original.cropX + original.width / 2 - source.width / 2) * original.scaleX
  const offsetY = (original.cropY + original.height / 2 - source.height / 2) * original.scaleY

  image.set({
    angle: 0,
    cropX: 0,
    cropY: 0,
    width: source.width,
    height: source.height,
    left: original.left - offsetX,
    top: original.top - offsetY,
    opacity: PREVIEW_DIM_OPACITY,
    selectable: false,
    evented: false,
  })
  image.setCoords()

  const cropRect = new Rect({
    left: original.left,
    top: original.top,
    width: windowWidth,
    height: windowHeight,
    originX: 'center',
    originY: 'center',
    fill: 'transparent',
    stroke: CROP_RECT_COLOR,
    strokeWidth: 2,
    strokeDashArray: [6, 4],
    strokeUniform: true,
    lockRotation: true,
    cornerColor: CROP_RECT_COLOR,
    cornerStyle: 'circle',
    transparentCorners: false,
  })

  const previewImage = new FabricImage(image.getElement(), {
    left: image.left,
    top: image.top,
    originX: 'center',
    originY: 'center',
    scaleX: image.scaleX,
    scaleY: image.scaleY,
    angle: 0,
    opacity: 1,
    selectable: false,
    evented: false,
  })
  syncPreviewClip(previewImage, cropRect)

  const resync = () => {
    syncPreviewClip(previewImage, cropRect)
    canvas.requestRenderAll()
  }
  cropRect.on('moving', resync)
  cropRect.on('scaling', resync)

  state.cropRect = cropRect
  state.previewImage = previewImage

  canvas.add(previewImage)
  canvas.add(cropRect)
  canvas.setActiveObject(cropRect)
  canvas.requestRenderAll()
}

function cleanupCropObjects(canvas: Canvas, state: CropStateRef): void {
  if (state.cropRect) canvas.remove(state.cropRect)
  if (state.previewImage) canvas.remove(state.previewImage)
  state.cropRect = null
  state.previewImage = null
  state.targetImage = null
  state.original = null
}

export interface CropResult {
  cropX: number
  cropY: number
  width: number
  height: number
  centerLeft: number
  centerTop: number
}

/** Pure conversion from the crop rect's canvas-space box to image-local crop coordinates. Exported for unit testing. */
export function computeCropFromRect(
  imageBounds: { left: number; top: number },
  rectBounds: { left: number; top: number; width: number; height: number },
  scale: { x: number; y: number },
  source: { width: number; height: number },
): CropResult {
  const rawLeft = (rectBounds.left - imageBounds.left) / scale.x
  const rawTop = (rectBounds.top - imageBounds.top) / scale.y
  const cropX = clamp(rawLeft, 0, source.width)
  const cropY = clamp(rawTop, 0, source.height)
  const width = clamp(rectBounds.width / scale.x, 1, source.width - cropX)
  const height = clamp(rectBounds.height / scale.y, 1, source.height - cropY)
  return {
    cropX,
    cropY,
    width,
    height,
    centerLeft: rectBounds.left + rectBounds.width / 2,
    centerTop: rectBounds.top + rectBounds.height / 2,
  }
}

export function applyCrop(canvas: Canvas, state: CropStateRef): void {
  const { targetImage, cropRect, original } = state
  if (!targetImage || !cropRect || !original) return

  const source = getSourceSize(targetImage)
  const imageBounds = targetImage.getBoundingRect()
  const rectBounds = cropRect.getBoundingRect()
  const result = computeCropFromRect(
    imageBounds,
    rectBounds,
    { x: targetImage.scaleX ?? 1, y: targetImage.scaleY ?? 1 },
    source,
  )

  targetImage.set({
    cropX: result.cropX,
    cropY: result.cropY,
    width: result.width,
    height: result.height,
    left: result.centerLeft,
    top: result.centerTop,
    opacity: original.opacity,
    selectable: true,
    evented: true,
  })
  targetImage.rotate(original.angle)
  targetImage.setCoords()

  cleanupCropObjects(canvas, state)
  canvas.setActiveObject(targetImage)
  canvas.requestRenderAll()
}

export function cancelCrop(canvas: Canvas, state: CropStateRef): void {
  const { targetImage, original } = state
  if (targetImage && original) {
    targetImage.set({ ...original, selectable: true, evented: true })
    targetImage.setCoords()
  }
  cleanupCropObjects(canvas, state)
  if (targetImage) canvas.setActiveObject(targetImage)
  canvas.requestRenderAll()
}
