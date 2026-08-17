import { describe, it, expect } from 'vitest'
import { computeObjectSnap, snapValueToGrid, type SnappingSettings } from './snapping'

const BASE_SETTINGS: SnappingSettings = {
  enabled: true,
  snapToObjects: true,
  snapToGrid: false,
  gridSize: 20,
  threshold: 8,
}

describe('snapValueToGrid', () => {
  it('rounds to the nearest grid multiple', () => {
    expect(snapValueToGrid(23, 20)).toBe(20)
    expect(snapValueToGrid(31, 20)).toBe(40)
  })

  it('is a no-op for a zero grid size', () => {
    expect(snapValueToGrid(23, 0)).toBe(23)
  })
})

describe('computeObjectSnap', () => {
  it('returns a zero offset with no guides when nothing is within threshold', () => {
    const moving = { left: 0, top: 0, width: 50, height: 50 }
    const others = [{ left: 500, top: 500, width: 50, height: 50 }]
    const result = computeObjectSnap(moving, others, BASE_SETTINGS)
    expect(result).toEqual({ dx: 0, dy: 0, guides: [] })
  })

  it('returns a zero result immediately when snapping is disabled', () => {
    const moving = { left: 100, top: 0, width: 50, height: 50 }
    const others = [{ left: 102, top: 0, width: 50, height: 50 }]
    const result = computeObjectSnap(moving, others, { ...BASE_SETTINGS, enabled: false })
    expect(result).toEqual({ dx: 0, dy: 0, guides: [] })
  })

  it('snaps left edge to another object left edge within threshold', () => {
    const moving = { left: 104, top: 0, width: 50, height: 50 }
    const others = [{ left: 100, top: 200, width: 50, height: 50 }]
    const result = computeObjectSnap(moving, others, BASE_SETTINGS)
    expect(result.dx).toBe(-4)
    expect(result.guides).toEqual([{ orientation: 'vertical', position: 100 }])
  })

  it('snaps center to center on both axes independently', () => {
    // moving center: (125, 125); other center: (128, 130) — both within threshold 8
    const moving = { left: 100, top: 100, width: 50, height: 50 }
    const others = [{ left: 103, top: 105, width: 50, height: 50 }]
    const result = computeObjectSnap(moving, others, BASE_SETTINGS)
    expect(result.dx).toBe(3)
    expect(result.dy).toBe(5)
  })

  it('snaps to grid when snapToObjects finds nothing and snapToGrid is enabled', () => {
    const moving = { left: 41, top: 0, width: 50, height: 50 }
    const others: typeof moving[] = []
    const result = computeObjectSnap(moving, others, { ...BASE_SETTINGS, snapToGrid: true, gridSize: 20 })
    expect(result.dx).toBe(-1) // 41 -> nearest grid line 40
  })

  it('prefers an object snap over a grid snap on the same axis', () => {
    const moving = { left: 41, top: 0, width: 50, height: 50 }
    const others = [{ left: 45, top: 200, width: 50, height: 50 }]
    const result = computeObjectSnap(moving, others, { ...BASE_SETTINGS, snapToGrid: true, gridSize: 20 })
    expect(result.dx).toBe(4) // snapped to the other object's left edge (45), not the grid (40)
  })
})
