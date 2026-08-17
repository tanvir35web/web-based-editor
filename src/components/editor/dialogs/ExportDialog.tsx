import { useState } from 'react'
import { Modal } from '../../common/Modal'
import { Button } from '../../common/Button'
import { Slider } from '../../common/Slider'
import { useEditorStore } from '../../../stores/editor/editorStore'
import { useEditorExport } from '../../../hooks/editor/useEditorExport'
import { usePages } from '../../../hooks/editor/usePages'
import type { ExportFormat } from '../../../types/canvas'
import { cn } from '../../../lib/utils/cn'

type DialogFormat = ExportFormat | 'pdf'

const FORMATS: { value: DialogFormat; label: string }[] = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'svg', label: 'SVG' },
  { value: 'pdf', label: 'PDF' },
]

const RESOLUTION_MULTIPLIERS = [1, 2, 3]

export function ExportDialog() {
  const isOpen = useEditorStore((s) => s.isExportDialogOpen)
  const closeExportDialog = useEditorStore((s) => s.closeExportDialog)
  const { exportImage, exportPDF, isExporting, error } = useEditorExport()
  const { pages } = usePages()

  const [format, setFormat] = useState<DialogFormat>('png')
  const [quality, setQuality] = useState(92)
  const [transparentBackground, setTransparentBackground] = useState(false)
  const [resolutionMultiplier, setResolutionMultiplier] = useState(1)

  const handleExport = async () => {
    if (format === 'pdf') {
      await exportPDF()
    } else {
      await exportImage({ format, quality: quality / 100, transparentBackground, resolutionMultiplier })
    }
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

        {format === 'pdf' && (
          <p className="text-xs text-text-secondary">
            Exports all {pages.length} page{pages.length === 1 ? '' : 's'} as a single multi-page PDF.
          </p>
        )}

        {format === 'jpeg' && (
          <Slider label="Quality" value={quality} min={10} max={100} onChange={setQuality} formatValue={(v) => `${v}%`} />
        )}

        {format !== 'svg' && format !== 'pdf' && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-text-secondary">Resolution</span>
            <div className="flex gap-2">
              {RESOLUTION_MULTIPLIERS.map((multiplier) => (
                <button
                  key={multiplier}
                  type="button"
                  onClick={() => setResolutionMultiplier(multiplier)}
                  className={cn(
                    'flex-1 rounded-md border px-3 py-2 text-xs font-medium',
                    resolutionMultiplier === multiplier
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-surface-border text-text-secondary hover:text-text-primary',
                  )}
                >
                  {multiplier}x
                </button>
              ))}
            </div>
          </div>
        )}

        {(format === 'png' || format === 'svg') && (
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
