import { ColorPicker } from '../../common/ColorPicker'
import { useEditorCanvasContext } from '../../../lib/editor/EditorCanvasContext'
import { useCanvasStore } from '../../../stores/editor/canvasStore'
import { useEditorHistory } from '../../../hooks/editor/useEditorHistory'
import { setCanvasBackground } from '../../../lib/fabric/canvas'
import { cn } from '../../../lib/utils/cn'
import type { BackgroundMode } from '../../../types/canvas'

const PRESETS: { mode: BackgroundMode; label: string; color: string }[] = [
  { mode: 'white', label: 'White', color: '#ffffff' },
  { mode: 'black', label: 'Black', color: '#000000' },
  { mode: 'transparent', label: 'Transparent', color: 'transparent' },
]

export function BackgroundPanel() {
  const { canvasRef } = useEditorCanvasContext()
  const background = useCanvasStore((s) => s.background)
  const setBackground = useCanvasStore((s) => s.setBackground)
  const { commitHistory } = useEditorHistory()

  const applyBackground = (mode: BackgroundMode, color: string) => {
    const canvas = canvasRef.current
    if (!canvas) return
    setCanvasBackground(canvas, mode === 'transparent' ? '' : color)
    setBackground({ mode, color })
    commitHistory()
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Background</h3>
      <div className="grid grid-cols-3 gap-1.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.mode}
            type="button"
            onClick={() => applyBackground(preset.mode, preset.color)}
            className={cn(
              'rounded-md border px-2 py-1.5 text-xs',
              background.mode === preset.mode
                ? 'border-accent text-accent bg-accent/10'
                : 'border-surface-border text-text-secondary hover:text-text-primary',
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <ColorPicker
        label="Custom Color"
        value={background.mode === 'transparent' ? 'transparent' : background.color}
        onChange={(color) => applyBackground(color === 'transparent' ? 'transparent' : 'custom', color)}
        allowTransparent
      />
    </div>
  )
}
