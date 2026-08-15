import { Download } from 'lucide-react'
import { Button } from '../../common/Button'
import { useEditorExport } from '../../../hooks/editor/useEditorExport'
import { useEditorStore } from '../../../stores/editor/editorStore'

export function ExportPanel() {
  const { exportImage, isExporting } = useEditorExport()
  const openExportDialog = useEditorStore((s) => s.openExportDialog)

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Export</h3>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          className="flex-1"
          disabled={isExporting}
          onClick={() => void exportImage({ format: 'png', quality: 1, transparentBackground: false })}
        >
          <Download className="h-4 w-4" />
          PNG
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          disabled={isExporting}
          onClick={() => void exportImage({ format: 'jpeg', quality: 0.92, transparentBackground: false })}
        >
          <Download className="h-4 w-4" />
          JPEG
        </Button>
      </div>
      <button type="button" onClick={openExportDialog} className="text-left text-xs text-accent hover:underline">
        More export options…
      </button>
    </div>
  )
}
