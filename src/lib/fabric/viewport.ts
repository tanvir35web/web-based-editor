import type { Canvas } from 'fabric'

/**
 * Canvas zoom scales the DOM canvas element itself (and the internal
 * viewportTransform to match) — it never touches object.scaleX/scaleY.
 * This keeps "canvas zoom" and "object scale" fully independent.
 */
export function applyCanvasZoom(canvas: Canvas, documentWidth: number, documentHeight: number, zoom: number): void {
  canvas.setDimensions({ width: documentWidth * zoom, height: documentHeight * zoom })
  canvas.setZoom(zoom)
  canvas.requestRenderAll()
}

export function computeFitZoom(
  documentSize: { width: number; height: number },
  viewportSize: { width: number; height: number },
  padding = 48,
): number {
  const availableWidth = Math.max(viewportSize.width - padding * 2, 50)
  const availableHeight = Math.max(viewportSize.height - padding * 2, 50)
  return Math.min(availableWidth / documentSize.width, availableHeight / documentSize.height)
}
