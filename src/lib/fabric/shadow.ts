import { Shadow, type Canvas, type FabricObject } from 'fabric'
import type { BlendMode, ShadowProps } from '../../types/objects'

const SHADOW_DEFAULTS: Omit<ShadowProps, 'enabled'> = {
  color: '#000000',
  blur: 10,
  offsetX: 4,
  offsetY: 4,
}

export function getShadowProps(object: FabricObject): ShadowProps {
  const shadow = object.shadow
  return {
    enabled: shadow != null,
    color: shadow?.color ?? SHADOW_DEFAULTS.color,
    blur: shadow?.blur ?? SHADOW_DEFAULTS.blur,
    offsetX: shadow?.offsetX ?? SHADOW_DEFAULTS.offsetX,
    offsetY: shadow?.offsetY ?? SHADOW_DEFAULTS.offsetY,
  }
}

/**
 * Rebuilds a fresh `Shadow` instance from the full patched props every call —
 * mirrors filters.ts#buildFilterPipeline's non-destructive rebuild pattern —
 * never mutates `object.shadow`'s fields in place.
 */
export function updateShadowProps(canvas: Canvas, object: FabricObject, patch: Partial<ShadowProps>): void {
  const next = { ...getShadowProps(object), ...patch }
  object.set(
    'shadow',
    next.enabled ? new Shadow({ color: next.color, blur: next.blur, offsetX: next.offsetX, offsetY: next.offsetY }) : null,
  )
  object.setCoords()
  canvas.requestRenderAll()
}

export function getBlendMode(object: FabricObject): BlendMode {
  return (object.globalCompositeOperation as BlendMode) ?? 'source-over'
}

export function updateBlendMode(canvas: Canvas, object: FabricObject, mode: BlendMode): void {
  object.set('globalCompositeOperation', mode)
  canvas.requestRenderAll()
}
