import { filters } from 'fabric'
import type { EditorImageObject } from './images'
import type { AdjustmentValues } from '../../types/objects'
import { clamp } from '../utils/scaling'

const WARM_TINT = '#ff9d3d'
const COOL_TINT = '#3d9dff'
const TINT_ALPHA = 0.15

/**
 * Builds a fresh filter pipeline from stored adjustment values every time —
 * never mutates `image.filters` in place — so repeated slider changes stay
 * non-destructive and never compound.
 */
export function buildFilterPipeline(adjustments: AdjustmentValues): InstanceType<typeof filters.BaseFilter>[] {
  const pipeline: InstanceType<typeof filters.BaseFilter>[] = []

  if (adjustments.brightness !== 0) {
    pipeline.push(new filters.Brightness({ brightness: adjustments.brightness / 100 }))
  }
  if (adjustments.exposure !== 0) {
    const gamma = clamp(1 - adjustments.exposure / 150, 0.3, 2.2)
    pipeline.push(new filters.Gamma({ gamma: [gamma, gamma, gamma] }))
  }
  if (adjustments.contrast !== 0) {
    pipeline.push(new filters.Contrast({ contrast: adjustments.contrast / 100 }))
  }
  if (adjustments.saturation !== 0) {
    pipeline.push(new filters.Saturation({ saturation: adjustments.saturation / 100 }))
  }
  if (adjustments.hue !== 0) {
    pipeline.push(new filters.HueRotation({ rotation: adjustments.hue / 180 }))
  }
  if (adjustments.blur > 0) {
    pipeline.push(new filters.Blur({ blur: adjustments.blur / 100 }))
  }
  if (adjustments.grayscale) {
    pipeline.push(new filters.Grayscale())
  }
  if (adjustments.sepia) {
    pipeline.push(new filters.Sepia())
  }
  if (adjustments.invert) {
    pipeline.push(new filters.Invert())
  }
  if (adjustments.vintage) {
    pipeline.push(new filters.Vintage())
  }
  if (adjustments.warm) {
    pipeline.push(new filters.BlendColor({ color: WARM_TINT, mode: 'tint', alpha: TINT_ALPHA }))
  }
  if (adjustments.cool) {
    pipeline.push(new filters.BlendColor({ color: COOL_TINT, mode: 'tint', alpha: TINT_ALPHA }))
  }

  return pipeline
}

export function applyAdjustments(image: EditorImageObject, adjustments: AdjustmentValues): void {
  image.filters = buildFilterPipeline(adjustments)
  image.opacity = clamp(adjustments.opacity, 0, 100) / 100
  image.applyFilters()
}
