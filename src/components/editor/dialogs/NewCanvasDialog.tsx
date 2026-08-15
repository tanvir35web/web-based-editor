import { useState } from 'react'
import { Modal } from '../../common/Modal'
import { Button } from '../../common/Button'
import { NumberInput } from '../../common/NumberInput'
import { ColorPicker } from '../../common/ColorPicker'
import { useEditorStore } from '../../../stores/editor/editorStore'
import { useDocumentActions } from '../../../hooks/editor/useDocumentActions'
import { CANVAS_PRESETS, EDITOR_DEFAULTS } from '../../../lib/editor/constants'
import { validateCanvasDimensions } from '../../../lib/editor/validation'
import { cn } from '../../../lib/utils/cn'

const CUSTOM_PRESET_ID = 'custom'

export function NewCanvasDialog() {
  const isOpen = useEditorStore((s) => s.isNewDocumentDialogOpen)
  const closeNewDocumentDialog = useEditorStore((s) => s.closeNewDocumentDialog)
  const hasDocument = useEditorStore((s) => s.hasDocument)
  const { createBlankDocument } = useDocumentActions()

  const [presetId, setPresetId] = useState<string>(CUSTOM_PRESET_ID)
  const [width, setWidth] = useState<number>(EDITOR_DEFAULTS.CANVAS_WIDTH)
  const [height, setHeight] = useState<number>(EDITOR_DEFAULTS.CANVAS_HEIGHT)
  const [backgroundColor, setBackgroundColor] = useState<string>(EDITOR_DEFAULTS.CANVAS_BACKGROUND)
  const [error, setError] = useState<string | null>(null)

  const selectPreset = (id: string) => {
    setPresetId(id)
    const preset = CANVAS_PRESETS.find((p) => p.id === id)
    if (preset) {
      setWidth(preset.width)
      setHeight(preset.height)
    }
  }

  const handleCreate = () => {
    const validation = validateCanvasDimensions(width, height)
    if (!validation.valid) {
      setError(validation.error ?? 'Invalid dimensions.')
      return
    }
    createBlankDocument({ width, height, backgroundColor })
    closeNewDocumentDialog()
  }

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && closeNewDocumentDialog()}
      title="Create new document"
      description={hasDocument ? 'This replaces your current design.' : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={closeNewDocumentDialog}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            Create
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          {CANVAS_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => selectPreset(preset.id)}
              className={cn(
                'rounded-md border px-3 py-2 text-left text-xs',
                presetId === preset.id
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-surface-border text-text-secondary hover:text-text-primary',
              )}
            >
              <div className="font-medium">{preset.label}</div>
              <div className="text-[11px] text-text-muted">
                {preset.width} × {preset.height}
              </div>
            </button>
          ))}
          <button
            type="button"
            onClick={() => selectPreset(CUSTOM_PRESET_ID)}
            className={cn(
              'rounded-md border px-3 py-2 text-left text-xs',
              presetId === CUSTOM_PRESET_ID
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-surface-border text-text-secondary hover:text-text-primary',
            )}
          >
            <div className="font-medium">Custom</div>
            <div className="text-[11px] text-text-muted">Set your own size</div>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label="Width"
            value={width}
            min={1}
            onCommit={(value) => {
              setWidth(value)
              setPresetId(CUSTOM_PRESET_ID)
            }}
          />
          <NumberInput
            label="Height"
            value={height}
            min={1}
            onCommit={(value) => {
              setHeight(value)
              setPresetId(CUSTOM_PRESET_ID)
            }}
          />
        </div>

        <ColorPicker label="Background Color" value={backgroundColor} onChange={setBackgroundColor} allowTransparent />

        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    </Modal>
  )
}
