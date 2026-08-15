import type { Canvas } from 'fabric'
import type { ExportOptions } from '../../types/canvas'

/**
 * Fabric's toBlob/toCanvasElement multiplies against the canvas element's
 * *current* pixel size, which under our zoom implementation is
 * `documentSize * zoom` — not the true document size. Dividing by the
 * current zoom normalizes back to true document resolution regardless of
 * what the user happens to be viewing at.
 */
export async function exportCanvasToBlob(canvas: Canvas, options: ExportOptions, resolutionMultiplier = 1): Promise<Blob> {
  const originalBackground = canvas.backgroundColor
  if (options.transparentBackground && options.format === 'png') {
    canvas.backgroundColor = ''
  }

  const zoom = canvas.getZoom()
  const blob = await canvas.toBlob({
    format: options.format,
    quality: options.format === 'jpeg' ? options.quality : 1,
    multiplier: resolutionMultiplier / zoom,
  })

  canvas.backgroundColor = originalBackground
  canvas.requestRenderAll()

  if (!blob) throw new Error('Failed to render the canvas to an image.')
  return blob
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
