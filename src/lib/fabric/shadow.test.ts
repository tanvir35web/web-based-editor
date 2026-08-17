import { describe, it, expect } from 'vitest'
import { Canvas, Rect } from 'fabric'
import { getShadowProps, updateShadowProps, getBlendMode, updateBlendMode } from './shadow'

function makeCanvasAndRect() {
  const canvas = new Canvas(document.createElement('canvas'), { width: 800, height: 600 })
  const rect = new Rect({ width: 100, height: 100 })
  canvas.add(rect)
  return { canvas, rect }
}

describe('getShadowProps / updateShadowProps', () => {
  it('reports disabled with defaults when no shadow is set', () => {
    const { rect } = makeCanvasAndRect()
    expect(getShadowProps(rect)).toEqual({ enabled: false, color: '#000000', blur: 10, offsetX: 4, offsetY: 4 })
  })

  it('enables a shadow with the given props', () => {
    const { canvas, rect } = makeCanvasAndRect()
    updateShadowProps(canvas, rect, { enabled: true, color: '#ff0000', blur: 20, offsetX: 5, offsetY: 5 })
    expect(rect.shadow).not.toBeNull()
    expect(getShadowProps(rect)).toEqual({ enabled: true, color: '#ff0000', blur: 20, offsetX: 5, offsetY: 5 })
  })

  it('rebuilds the shadow from full props on a partial patch, never mutating in place', () => {
    const { canvas, rect } = makeCanvasAndRect()
    updateShadowProps(canvas, rect, { enabled: true, color: '#00ff00', blur: 15, offsetX: 2, offsetY: 2 })
    const firstShadow = rect.shadow
    updateShadowProps(canvas, rect, { blur: 30 })
    expect(rect.shadow).not.toBe(firstShadow)
    expect(getShadowProps(rect)).toEqual({ enabled: true, color: '#00ff00', blur: 30, offsetX: 2, offsetY: 2 })
  })

  it('disables the shadow (sets it back to null) when enabled is set to false', () => {
    const { canvas, rect } = makeCanvasAndRect()
    updateShadowProps(canvas, rect, { enabled: true })
    updateShadowProps(canvas, rect, { enabled: false })
    expect(rect.shadow).toBeNull()
    expect(getShadowProps(rect).enabled).toBe(false)
  })
})

describe('getBlendMode / updateBlendMode', () => {
  it('defaults to source-over (Normal)', () => {
    const { rect } = makeCanvasAndRect()
    expect(getBlendMode(rect)).toBe('source-over')
  })

  it('updates the blend mode', () => {
    const { canvas, rect } = makeCanvasAndRect()
    updateBlendMode(canvas, rect, 'multiply')
    expect(getBlendMode(rect)).toBe('multiply')
  })
})
