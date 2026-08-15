import { describe, it, expect } from 'vitest'
import { computeFitScale, computeCenteredPosition, clamp } from './scaling'

describe('computeFitScale', () => {
  it('scales down a larger source to fit within the target', () => {
    const scale = computeFitScale({ width: 2000, height: 1000 }, { width: 1000, height: 1000 })
    expect(scale).toBeCloseTo(0.5)
  })

  it('picks the smaller of the two axis ratios so aspect ratio is preserved', () => {
    const scale = computeFitScale({ width: 400, height: 100 }, { width: 200, height: 200 })
    // width ratio 0.5, height ratio 2 -> must use the smaller (0.5) or it would overflow horizontally
    expect(scale).toBeCloseTo(0.5)
  })

  it('never upscales past maxScale even when the source is smaller than the target', () => {
    const scale = computeFitScale({ width: 100, height: 100 }, { width: 1000, height: 1000 }, 1)
    expect(scale).toBe(1)
  })

  it('returns 1 for degenerate (zero or negative) source dimensions', () => {
    expect(computeFitScale({ width: 0, height: 100 }, { width: 500, height: 500 })).toBe(1)
    expect(computeFitScale({ width: 100, height: -1 }, { width: 500, height: 500 })).toBe(1)
  })
})

describe('computeCenteredPosition', () => {
  it('centers a smaller box within a larger one', () => {
    const position = computeCenteredPosition({ width: 100, height: 50 }, { width: 400, height: 200 })
    expect(position).toEqual({ left: 150, top: 75 })
  })
})

describe('clamp', () => {
  it('leaves values inside the range untouched', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('clamps values below the minimum', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
  })

  it('clamps values above the maximum', () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })
})
