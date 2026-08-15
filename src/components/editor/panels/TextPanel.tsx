import { Type } from 'lucide-react'
import { Button } from '../../common/Button'
import { useEditorCanvasContext } from '../../../lib/editor/EditorCanvasContext'
import { addText } from '../../../lib/fabric/text'
import { useEditorHistory } from '../../../hooks/editor/useEditorHistory'

const TEXT_PRESETS = [
  { label: 'Heading', text: 'Add a heading', fontSize: 48, fontWeight: 700 },
  { label: 'Subheading', text: 'Add a subheading', fontSize: 28, fontWeight: 600 },
  { label: 'Body text', text: 'Add a little bit of body text', fontSize: 18, fontWeight: 400 },
]

export function TextPanel() {
  const { canvasRef } = useEditorCanvasContext()
  const { pushState } = useEditorHistory()

  const handleAddText = (preset?: (typeof TEXT_PRESETS)[number]) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const object = addText(canvas, preset?.text ?? 'Type something...')
    if (preset) object.set({ fontSize: preset.fontSize, fontWeight: preset.fontWeight })
    canvas.requestRenderAll()
    pushState()
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Text</h3>
      <Button variant="primary" onClick={() => handleAddText()}>
        <Type className="h-4 w-4" />
        Add Text
      </Button>
      <div className="flex flex-col gap-1.5">
        {TEXT_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => handleAddText(preset)}
            className="rounded-md border border-surface-border px-3 py-2 text-left text-xs text-text-secondary hover:border-surface-3 hover:text-text-primary"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}
