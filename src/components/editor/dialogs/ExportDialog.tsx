import { useState } from 'react'
import { Modal } from '../../common/Modal'
import { Button } from '../../common/Button'
import { Slider } from '../../common/Slider'
import { useEditorStore } from '../../../stores/editor/editorStore'
import { useEditorExport } from '../../../hooks/editor/useEditorExport'
import type { ExportFormat } from '../../../types/canvas'
import { cn } from '../../../lib/utils/cn'

const FORMATS: { value: ExportFormat; label: string }[] = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
]

export function ExportDialog() {
  const isOpen = useEditorStore((s) => s.isExportDialogOpen)
  const closeExportDialog = useEditorStore((s) => s.closeExportDialog)
  const { exportImage, isExporting, error } = useEditorExport()

  const [format, setFormat] = useState<ExportFormat>('png')
  const [quality, setQuality] = useState(92)
  const [transparentBackground, setTransparentBackground] = useState(false)

  const handleExport = async () => {
    await exportImage({ format, quality: quality / 100, transparentBackground })
    closeExportDialog()
  }

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && closeExportDialog()}
      title="Export artwork"
      description="Download your design as an image."
      footer={
        <>
          <Button variant="ghost" onClick={closeExportDialog}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => void handleExport()} disabled={isExporting}>
            {isExporting ? 'Exporting…' : 'Export'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-text-secondary">Format</span>
          <div className="flex gap-2">
            {FORMATS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFormat(f.value)}
                className={cn(
                  'flex-1 rounded-md border px-3 py-2 text-xs font-medium',
                  format === f.value
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-surface-border text-text-secondary hover:text-text-primary',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {format === 'jpeg' && (
          <Slider label="Quality" value={quality} min={10} max={100} onChange={setQuality} formatValue={(v) => `${v}%`} />
        )}

        {format === 'png' && (
          <label className="flex items-center justify-between rounded-md border border-surface-border px-3 py-2 text-xs text-text-secondary">
            Transparent background
            <input
              type="checkbox"
              checked={transparentBackground}
              onChange={(event) => setTransparentBackground(event.target.checked)}
              className="h-4 w-4 accent-[var(--color-accent)]"
            />
          </label>
        )}

        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    </Modal>
  )
}
