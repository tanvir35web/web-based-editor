import { describe, it, expect } from 'vitest'
import { Canvas } from 'fabric'
import { computeFitZoom, applyCanvasZoom } from './viewport'

describe('computeFitZoom', () => {
  it('fits a document within the viewport, accounting for padding', () => {
    const zoom = computeFitZoom({ width: 1000, height: 1000 }, { width: 600, height: 600 }, 50)
    // available space is 500x500 -> zoom 0.5
    expect(zoom).toBeCloseTo(0.5)
  })

  it('uses the more constrained axis to keep aspect ratio', () => {
    const zoom = computeFitZoom({ width: 1000, height: 500 }, { width: 500, height: 500 }, 0)
    // width needs 0.5, height needs 1 -> must pick 0.5
    expect(zoom).toBeCloseTo(0.5)
  })
})

describe('applyCanvasZoom', () => {
  it('resizes the canvas element to documentSize * zoom and sets internal zoom to match', () => {
    const el = document.createElement('canvas')
    const canvas = new Canvas(el, { width: 1200, height: 800 })

    applyCanvasZoom(canvas, 1200, 800, 0.5)

    expect(canvas.getWidth()).toBe(600)
    expect(canvas.getHeight()).toBe(400)
    expect(canvas.getZoom()).toBe(0.5)
  })
})
