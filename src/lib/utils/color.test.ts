import { describe, it, expect } from 'vitest'
import { isValidHexColor, normalizeHexColor, hexToRgba, withAlpha } from './color'

describe('isValidHexColor', () => {
  it('accepts 3, 6, and 8 digit hex colors', () => {
    expect(isValidHexColor('#fff')).toBe(true)
    expect(isValidHexColor('#ffffff')).toBe(true)
    expect(isValidHexColor('#ffffffff')).toBe(true)
  })

  it('rejects malformed values', () => {
    expect(isValidHexColor('fff')).toBe(false)
    expect(isValidHexColor('#ggg')).toBe(false)
    expect(isValidHexColor('transparent')).toBe(false)
    expect(isValidHexColor('')).toBe(false)
  })
})

describe('normalizeHexColor', () => {
  it('lowercases and expands shorthand hex', () => {
    expect(normalizeHexColor('#ABC')).toBe('#aabbcc')
  })

  it('lowercases full hex without changing it structurally', () => {
    expect(normalizeHexColor('#FF00FF')).toBe('#ff00ff')
  })

  it('falls back to the provided default for invalid input', () => {
    expect(normalizeHexColor('not-a-color', '#123456')).toBe('#123456')
  })
})

describe('hexToRgba', () => {
  it('converts hex to an rgba() string with the given alpha', () => {
    expect(hexToRgba('#ff0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)')
  })

  it('defaults to fully opaque', () => {
    expect(hexToRgba('#00ff00')).toBe('rgba(0, 255, 0, 1)')
  })
})

describe('withAlpha', () => {
  it('converts a 0-100 percentage into a 0-1 alpha channel', () => {
    expect(withAlpha('#0000ff', 50)).toBe('rgba(0, 0, 255, 0.5)')
  })

  it('clamps out-of-range percentages', () => {
    expect(withAlpha('#0000ff', 150)).toBe('rgba(0, 0, 255, 1)')
    expect(withAlpha('#0000ff', -50)).toBe('rgba(0, 0, 255, 0)')
  })
})
