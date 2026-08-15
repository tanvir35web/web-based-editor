import { useCallback, useState } from 'react'
import { useEditorCanvasContext } from '../../lib/editor/EditorCanvasContext'
import { exportCanvasToBlob, downloadBlob } from '../../lib/fabric/export'
import type { ExportOptions } from '../../types/canvas'

export function useEditorExport() {
  const { canvasRef } = useEditorCanvasContext()
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
        downloadBlob(blob, `${filename}.${options.format === 'jpeg' ? 'jpg' : 'png'}`)
      } catch {
        setError('Could not export the image. Try again.')
      } finally {
        setIsExporting(false)
      }
    },
    [canvasRef],
  )

  return { exportImage, isExporting, error }
}
