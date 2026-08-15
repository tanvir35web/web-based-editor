import { describe, it, expect } from 'vitest'
import { Canvas, Rect } from 'fabric'
import { applyClippingMask, releaseClippingMask, hasClippingMask } from './clipping'
import { tagObject, asEditorObject } from './objects'

function makeCanvas() {
  return new Canvas(document.createElement('canvas'), { width: 800, height: 600 })
}

describe('applyClippingMask', () => {
  it('assigns the mask as the content object\'s clipPath and removes the mask from the canvas', async () => {
    const canvas = makeCanvas()
    const mask = tagObject(new Rect({ left: 100, top: 100, width: 50, height: 50 }), { name: 'Mask', type: 'rect' })
    const content = tagObject(new Rect({ left: 100, top: 100, width: 200, height: 200, fill: 'blue' }), {
      name: 'Content',
      type: 'rect',
    })
    canvas.add(content, mask)

    await applyClippingMask(canvas, mask, content)

    expect(canvas.getObjects()).toEqual([content])
    expect(content.clipPath).toBeDefined()
    expect(hasClippingMask(content)).toBe(true)
    expect(canvas.getActiveObject()).toBe(content)
  })

  it('the clip path is a detached, absolutely-positioned clone (not the original mask instance)', async () => {
    const canvas = makeCanvas()
    const mask = tagObject(new Rect({ left: 10, top: 10, width: 30, height: 30 }), { name: 'Mask', type: 'rect' })
    const content = tagObject(new Rect({ width: 100, height: 100 }), { name: 'Content', type: 'rect' })
    canvas.add(content, mask)

    await applyClippingMask(canvas, mask, content)

    expect(content.clipPath).not.toBe(mask)
    expect(content.clipPath?.absolutePositioned).toBe(true)
  })
})

describe('releaseClippingMask', () => {
  it('restores the mask as a visible, tagged canvas object and clears the clipPath', async () => {
    const canvas = makeCanvas()
    const mask = tagObject(new Rect({ left: 10, top: 10, width: 30, height: 30 }), { name: 'Circle Mask', type: 'circle' })
    const content = tagObject(new Rect({ width: 100, height: 100 }), { name: 'Content', type: 'rect' })
    canvas.add(content, mask)
    await applyClippingMask(canvas, mask, content)

    await releaseClippingMask(canvas, content)

    expect(content.clipPath).toBeUndefined()
    expect(hasClippingMask(content)).toBe(false)
    expect(canvas.getObjects()).toHaveLength(2)
    const restored = canvas.getObjects().find((obj) => obj !== content)
    expect(restored).toBeDefined()
    expect(asEditorObject(restored!).name).toBe('Circle Mask')
    expect(asEditorObject(restored!).editorType).toBe('circle')
    expect(canvas.getActiveObject()).toBe(restored)
  })

  it('is a no-op when the object has no clip mask', async () => {
    const canvas = makeCanvas()
    const content = tagObject(new Rect({ width: 100, height: 100 }), { name: 'Content', type: 'rect' })
    canvas.add(content)

    await releaseClippingMask(canvas, content)

    expect(canvas.getObjects()).toEqual([content])
  })
})
