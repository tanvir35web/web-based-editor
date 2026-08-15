import { describe, it, expect } from 'vitest'
import { Canvas, Rect } from 'fabric'
import {
  tagObject,
  getObjectMeta,
  findObjectById,
  applyLockState,
  duplicateObject,
  deleteObjects,
  alignObjects,
  distributeObjects,
} from './objects'

function makeCanvas() {
  return new Canvas(document.createElement('canvas'), { width: 800, height: 600 })
}

describe('tagObject / getObjectMeta', () => {
  it('assigns a stable id and reports metadata', () => {
    const rect = tagObject(new Rect({ width: 10, height: 10 }), { name: 'Box', type: 'rect' })
    const meta = getObjectMeta(rect)
    expect(meta.name).toBe('Box')
    expect(meta.type).toBe('rect')
    expect(meta.locked).toBe(false)
    expect(meta.visible).toBe(true)
    expect(typeof meta.id).toBe('string')
    expect(meta.id.length).toBeGreaterThan(0)
  })

  it('generates unique ids for each object', () => {
    const a = tagObject(new Rect(), { name: 'A', type: 'rect' })
    const b = tagObject(new Rect(), { name: 'B', type: 'rect' })
    expect(a.id).not.toBe(b.id)
  })
})

describe('findObjectById', () => {
  it('finds an object on the canvas by its tagged id', () => {
    const canvas = makeCanvas()
    const rect = tagObject(new Rect(), { name: 'Findable', type: 'rect' })
    canvas.add(rect)

    expect(findObjectById(canvas, rect.id)?.name).toBe('Findable')
    expect(findObjectById(canvas, 'does-not-exist')).toBeUndefined()
  })
})

describe('applyLockState', () => {
  it('disables movement, scaling, rotation, and selectability when locked', () => {
    const rect = tagObject(new Rect(), { name: 'Lockable', type: 'rect' })
    applyLockState(rect, true)

    expect(rect.locked).toBe(true)
    expect(rect.lockMovementX).toBe(true)
    expect(rect.lockMovementY).toBe(true)
    expect(rect.selectable).toBe(false)
  })

  it('restores normal interaction when unlocked', () => {
    const rect = tagObject(new Rect(), { name: 'Lockable', type: 'rect' })
    applyLockState(rect, true)
    applyLockState(rect, false)

    expect(rect.locked).toBe(false)
    expect(rect.selectable).toBe(true)
  })
})

describe('duplicateObject', () => {
  it('adds a clone offset by 20px on both axes and selects it', async () => {
    const canvas = makeCanvas()
    const rect = tagObject(new Rect({ left: 100, top: 100, width: 20, height: 20 }), { name: 'Original', type: 'rect' })
    canvas.add(rect)

    const clone = await duplicateObject(canvas, rect)

    expect(canvas.getObjects()).toHaveLength(2)
    expect(clone.left).toBe(120)
    expect(clone.top).toBe(120)
    expect(clone.id).not.toBe(rect.id)
    expect(canvas.getActiveObject()).toBe(clone)
  })
})

describe('deleteObjects', () => {
  it('removes the given objects and clears the active selection', () => {
    const canvas = makeCanvas()
    const rect = tagObject(new Rect(), { name: 'Doomed', type: 'rect' })
    canvas.add(rect)
    canvas.setActiveObject(rect)

    deleteObjects(canvas, [rect])

    expect(canvas.getObjects()).toHaveLength(0)
    expect(canvas.getActiveObject()).toBeUndefined()
  })
})

describe('alignObjects', () => {
  it('aligns objects to the left edge of their combined bounds', () => {
    const canvas = makeCanvas()
    // Fabric objects default to center origin, so `left`/`top` here set the
    // object's *center* — compute the expected edge from getBoundingRect()
    // rather than assuming left/top-origin placement.
    const a = tagObject(new Rect({ left: 50, top: 0, width: 20, height: 20, strokeWidth: 0 }), { name: 'A', type: 'rect' })
    const b = tagObject(new Rect({ left: 150, top: 0, width: 20, height: 20, strokeWidth: 0 }), { name: 'B', type: 'rect' })
    canvas.add(a, b)
    const expectedLeftEdge = Math.min(a.getBoundingRect().left, b.getBoundingRect().left)

    alignObjects(canvas, [a, b], 'left')

    expect(a.getBoundingRect().left).toBeCloseTo(expectedLeftEdge)
    expect(b.getBoundingRect().left).toBeCloseTo(expectedLeftEdge)
  })
})

describe('distributeObjects', () => {
  it('spaces three or more objects evenly between the first and last', () => {
    const canvas = makeCanvas()
    const a = tagObject(new Rect({ left: 0, top: 0, width: 20, height: 20 }), { name: 'A', type: 'rect' })
    const b = tagObject(new Rect({ left: 40, top: 0, width: 20, height: 20 }), { name: 'B', type: 'rect' })
    const c = tagObject(new Rect({ left: 200, top: 0, width: 20, height: 20 }), { name: 'C', type: 'rect' })
    canvas.add(a, b, c)

    distributeObjects(canvas, [a, b, c], 'horizontal')

    const gapAB = b.getBoundingRect().left - (a.getBoundingRect().left + a.getBoundingRect().width)
    const gapBC = c.getBoundingRect().left - (b.getBoundingRect().left + b.getBoundingRect().width)
    expect(gapAB).toBeCloseTo(gapBC, 5)
  })
})
