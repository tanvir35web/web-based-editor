import { describe, it, expect } from 'vitest'
import { Canvas, FabricImage } from 'fabric'
import { computeCropFromRect, enterCropMode, applyCrop, cancelCrop } from './crop'
import { tagObject } from './objects'
import type { EditorImageObject } from './images'
import type { CropStateRef } from '../editor/EditorCanvasContext'

describe('computeCropFromRect (pure)', () => {
  it('converts a canvas-space rect into image-local crop coordinates at scale 1', () => {
    const result = computeCropFromRect(
      { left: 0, top: 0 },
      { left: 20, top: 30, width: 100, height: 50 },
      { x: 1, y: 1 },
      { width: 400, height: 300 },
    )
    expect(result.cropX).toBe(20)
    expect(result.cropY).toBe(30)
    expect(result.width).toBe(100)
    expect(result.height).toBe(50)
    expect(result.centerLeft).toBe(70)
    expect(result.centerTop).toBe(55)
  })

  it('divides by scale to get true source-pixel crop coordinates', () => {
    const result = computeCropFromRect(
      { left: 0, top: 0 },
      { left: 40, top: 40, width: 200, height: 100 },
      { x: 2, y: 2 },
      { width: 400, height: 300 },
    )
    expect(result.cropX).toBe(20)
    expect(result.cropY).toBe(20)
    expect(result.width).toBe(100)
    expect(result.height).toBe(50)
  })

  it('clamps to the source bounds so the crop never extends past the original image', () => {
    const result = computeCropFromRect(
      { left: 0, top: 0 },
      { left: -50, top: -50, width: 1000, height: 1000 },
      { x: 1, y: 1 },
      { width: 400, height: 300 },
    )
    expect(result.cropX).toBe(0)
    expect(result.cropY).toBe(0)
    expect(result.width).toBe(400)
    expect(result.height).toBe(300)
  })
})

function makeCanvasImage() {
  const canvas = new Canvas(document.createElement('canvas'), { width: 800, height: 600 })
  const source = document.createElement('canvas')
  source.width = 400
  source.height = 200
  const image = tagObject(new FabricImage(source, { left: 400, top: 300, originX: 'center', originY: 'center' }), {
    name: 'Photo',
    type: 'image',
  }) as EditorImageObject
  canvas.add(image)
  return { canvas, image }
}

function emptyCropState(): CropStateRef {
  return { targetImage: null, cropRect: null, previewImage: null, original: null }
}

describe('enterCropMode / applyCrop / cancelCrop', () => {
  it('enter adds a crop rect + preview image and selects the crop rect', () => {
    const { canvas, image } = makeCanvasImage()
    const state = emptyCropState()

    enterCropMode(canvas, state, image)

    expect(canvas.getObjects()).toHaveLength(3) // original image (dimmed) + preview + crop rect
    expect(state.cropRect).not.toBeNull()
    expect(state.previewImage).not.toBeNull()
    expect(canvas.getActiveObject()).toBe(state.cropRect)
    expect(image.opacity).toBeLessThan(1)
  })

  it('apply crops the image to the crop rect area and removes the temporary objects', () => {
    const { canvas, image } = makeCanvasImage()
    const state = emptyCropState()
    enterCropMode(canvas, state, image)

    // Shrink the crop rect to the left half of the (now fully revealed) image.
    state.cropRect!.set({ width: 200, height: 200 })
    state.cropRect!.setCoords()

    applyCrop(canvas, state)

    expect(canvas.getObjects()).toEqual([image])
    expect(image.opacity).toBe(1)
    expect(image.cropX).toBeGreaterThanOrEqual(0)
    expect(image.width).toBeLessThanOrEqual(400)
    expect(state.targetImage).toBeNull()
  })

  it('cancel restores the image to its pre-crop state and removes the temporary objects', () => {
    const { canvas, image } = makeCanvasImage()
    const originalOpacity = image.opacity
    const state = emptyCropState()
    enterCropMode(canvas, state, image)

    cancelCrop(canvas, state)

    expect(canvas.getObjects()).toEqual([image])
    expect(image.opacity).toBe(originalOpacity)
    expect(image.angle).toBe(0)
    expect(state.targetImage).toBeNull()
  })
})
