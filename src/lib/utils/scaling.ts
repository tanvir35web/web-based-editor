export interface Dimensions {
  width: number
  height: number
}

/**
 * Scale factor to fit `source` inside `target` while preserving aspect ratio,
 * without ever upscaling beyond `maxScale` (default 1 — never enlarge past native size).
 */
export function computeFitScale(source: Dimensions, target: Dimensions, maxScale = 1): number {
  if (source.width <= 0 || source.height <= 0) return 1
  const scale = Math.min(target.width / source.width, target.height / source.height)
  return Math.min(scale, maxScale)
}

export function computeCenteredPosition(source: Dimensions, target: Dimensions): { left: number; top: number } {
  return {
    left: (target.width - source.width) / 2,
    top: (target.height - source.height) / 2,
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
