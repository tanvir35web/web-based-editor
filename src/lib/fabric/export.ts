import type { Canvas } from 'fabric'
import type { ExportOptions } from '../../types/canvas'
import { getDocumentDimensions } from './canvas'

/**
 * Fabric's toBlob/toCanvasElement multiplies against the canvas element's
 * *current* pixel size, which under our zoom implementation is
 * `documentSize * zoom` — not the true document size. Dividing by the
 * current zoom normalizes back to true document resolution regardless of
 * what the user happens to be viewing at.
 */
/** Only ever called for the non-svg formats — see exportCanvasToBlob's branch. */
async function exportCanvasToRasterBlob(canvas: Canvas, options: ExportOptions & { format: 'png' | 'jpeg' }): Promise<Blob> {
  const originalBackground = canvas.backgroundColor
  if (options.transparentBackground && options.format === 'png') {
    canvas.backgroundColor = ''
  }

  const zoom = canvas.getZoom() || 1
  const blob = await canvas.toBlob({
    format: options.format,
    quality: options.format === 'jpeg' ? options.quality : 1,
    multiplier: options.resolutionMultiplier / zoom,
  })

  canvas.backgroundColor = originalBackground
  canvas.requestRenderAll()

  if (!blob) throw new Error('Failed to render the canvas to an image.')
  return blob
}

/**
 * `canvas.toSVG()`'s `<svg width/height>` default to `canvas.width`/`height`
 * — the same zoom-scaled canvas-element size as getWidth()/getHeight() (see
 * getDocumentDimensions) — so they must be overridden explicitly here, or
 * the exported SVG's declared size shrinks/grows with whatever zoom the
 * user happens to be viewing at.
 */
function exportCanvasToSVGBlob(canvas: Canvas, options: ExportOptions): Blob {
  const originalBackground = canvas.backgroundColor
  if (options.transparentBackground) canvas.backgroundColor = ''

  const { width, height } = getDocumentDimensions(canvas)
  const svg = canvas.toSVG({ width: `${width}`, height: `${height}` })

  canvas.backgroundColor = originalBackground
  canvas.requestRenderAll()

  return new Blob([svg], { type: 'image/svg+xml' })
}

export async function exportCanvasToBlob(canvas: Canvas, options: ExportOptions): Promise<Blob> {
  if (options.format === 'svg') return exportCanvasToSVGBlob(canvas, options)
  return exportCanvasToRasterBlob(canvas, { ...options, format: options.format })
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
