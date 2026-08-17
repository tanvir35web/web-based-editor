import { describe, it, expect } from 'vitest'
import { Gradient } from 'fabric'
import { fillValueToFabricFill, fabricFillToFillValue } from './fill'
import type { FillValue } from '../../types/fill'

describe('fillValueToFabricFill / fabricFillToFillValue', () => {
  it('round-trips a solid color unchanged', () => {
    const value: FillValue = { type: 'solid', color: '#ff0000' }
    const fabricFill = fillValueToFabricFill(value, { width: 100, height: 100 })
    expect(fabricFill).toBe('#ff0000')
    expect(fabricFillToFillValue(fabricFill)).toEqual(value)
  })

  it('builds a linear Gradient with coords spanning the given size at the given angle', () => {
    const value: FillValue = {
      type: 'gradient',
      gradientType: 'linear',
      angle: 0,
      stops: [
        { offset: 0, color: '#000000' },
        { offset: 1, color: '#ffffff' },
      ],
    }
    const fill = fillValueToFabricFill(value, { width: 100, height: 50 })
    expect(fill).toBeInstanceOf(Gradient)
    const gradient = fill as Gradient<'linear'>
    expect(gradient.type).toBe('linear')
    expect(gradient.coords.y1).toBeCloseTo(25)
    expect(gradient.coords.y2).toBeCloseTo(25)
    expect(gradient.coords.x2).toBeGreaterThan(gradient.coords.x1)
  })

  it('builds a radial Gradient centered in the given size', () => {
    const value: FillValue = {
      type: 'gradient',
      gradientType: 'radial',
      angle: 0,
      stops: [
        { offset: 0, color: '#000000' },
        { offset: 1, color: '#ffffff' },
      ],
    }
    const fill = fillValueToFabricFill(value, { width: 100, height: 100 })
    const gradient = fill as Gradient<'radial'>
    expect(gradient.type).toBe('radial')
    expect(gradient.coords.x1).toBeCloseTo(50)
    expect(gradient.coords.y1).toBeCloseTo(50)
    expect(gradient.coords.r2).toBeCloseTo(50)
  })

  it('round-trips a gradient back to a sorted FillValue', () => {
    const value: FillValue = {
      type: 'gradient',
      gradientType: 'linear',
      angle: 90,
      stops: [
        { offset: 1, color: '#ffffff' },
        { offset: 0, color: '#000000' },
      ],
    }
    const fill = fillValueToFabricFill(value, { width: 100, height: 100 })
    const roundTripped = fabricFillToFillValue(fill)
    expect(roundTripped.type).toBe('gradient')
    if (roundTripped.type === 'gradient') {
      expect(roundTripped.stops.map((s) => s.offset)).toEqual([0, 1])
    }
  })

  it('falls back to black for a non-string, non-Gradient fill', () => {
    expect(fabricFillToFillValue(null)).toEqual({ type: 'solid', color: '#000000' })
  })
})
