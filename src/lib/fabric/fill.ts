import { Gradient } from 'fabric'
import type { FillValue } from '../../types/fill'

/**
 * Gradient coords are defined in the object's own *unscaled local* box
 * (object.width/object.height) — not getScaledWidth()/getScaledHeight(), and
 * unrelated to the canvas-zoom/getDocumentDimensions gotcha (that one is
 * about the canvas element vs. viewport zoom; this is object-local space).
 * Fabric paints the gradient in this local box and then applies the
 * object's own transform, so the gradient stays proportional across resize
 * automatically — no resize hook needed.
 */
export function fillValueToFabricFill(
  value: FillValue,
  size: { width: number; height: number },
): string | Gradient<'linear'> | Gradient<'radial'> {
  if (value.type === 'solid') return value.color

  const colorStops = [...value.stops].sort((a, b) => a.offset - b.offset)

  if (value.gradientType === 'radial') {
    const r = Math.max(size.width, size.height) / 2
    return new Gradient({
      type: 'radial',
      coords: { x1: size.width / 2, y1: size.height / 2, r1: 0, x2: size.width / 2, y2: size.height / 2, r2: r },
      colorStops,
    })
  }

  const rad = (value.angle * Math.PI) / 180
  const dx = (Math.cos(rad) * size.width) / 2
  const dy = (Math.sin(rad) * size.height) / 2
  return new Gradient({
    type: 'linear',
    coords: { x1: size.width / 2 - dx, y1: size.height / 2 - dy, x2: size.width / 2 + dx, y2: size.height / 2 + dy },
    colorStops,
  })
}

export function fabricFillToFillValue(fill: unknown): FillValue {
  if (fill instanceof Gradient) {
    const isRadial = fill.type === 'radial'
    let angle = 0
    if (!isRadial) {
      const { x1, y1, x2, y2 } = fill.coords as { x1: number; y1: number; x2: number; y2: number }
      angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
    }
    return {
      type: 'gradient',
      gradientType: isRadial ? 'radial' : 'linear',
      angle: (angle + 360) % 360,
      stops: fill.colorStops.map((stop) => ({ offset: stop.offset, color: stop.color })),
    }
  }
  return { type: 'solid', color: typeof fill === 'string' ? fill : '#000000' }
}
