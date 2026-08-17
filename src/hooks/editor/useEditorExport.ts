import { useCallback, useState } from 'react'
import { useEditorCanvasContext } from '../../lib/editor/EditorCanvasContext'
import { exportCanvasToBlob, downloadBlob } from '../../lib/fabric/export'
import { exportDocumentToPDF } from '../../lib/fabric/pdfExport'
import type { ExportOptions } from '../../types/canvas'

export function useEditorExport() {
  const { canvasRef, pagesRef } = useEditorCanvasContext()
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportImage = useCallback(
    async (options: ExportOptions, filename = 'artwork') => {
      const canvas = canvasRef.current
      if (!canvas) return
      setIsExporting(true)
      setError(null)
      try {
        const blob = await exportCanvasToBlob(canvas, options)
        const extension = options.format === 'jpeg' ? 'jpg' : options.format
        downloadBlob(blob, `${filename}.${extension}`)
      } catch {
        setError('Could not export the image. Try again.')
      } finally {
        setIsExporting(false)
      }
    },
    [canvasRef],
  )

  /** Whole-document export (every page), separate from exportImage's current-page-only formats. */
  const exportPDF = useCallback(
    async (filename = 'artwork') => {
      const canvas = canvasRef.current
      if (!canvas) return
      setIsExporting(true)
      setError(null)
      try {
        const blob = await exportDocumentToPDF(canvas, pagesRef.current)
        downloadBlob(blob, `${filename}.pdf`)
      } catch {
        setError('Could not export the PDF. Try again.')
      } finally {
        setIsExporting(false)
      }
    },
    [canvasRef, pagesRef],
  )

  return { exportImage, exportPDF, isExporting, error }
}
