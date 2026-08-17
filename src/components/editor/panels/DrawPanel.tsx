import { useEffect, useState } from 'react'
import { Square as StopIcon } from 'lucide-react'
import { ColorPicker } from '../../common/ColorPicker'
import { Slider } from '../../common/Slider'
import { Button } from '../../common/Button'
import { useEditorCanvasContext } from '../../../lib/editor/EditorCanvasContext'
import { useEditorStore } from '../../../stores/editor/editorStore'
import { startFreeDraw, stopFreeDraw } from '../../../lib/fabric/shapes'
import { EDITOR_DEFAULTS } from '../../../lib/editor/constants'

/**
 * Reached directly from the tool rail — mounting this panel *is* the
 * activation (matches Figma/Illustrator: clicking the toolbar icon puts you
 * straight into the mode, no extra click). Switching to any other rail tool
 * unmounts this panel, and the cleanup effect stops drawing.
 */
export function DrawPanel() {
  const { canvasRef } = useEditorCanvasContext()
  const setActiveTool = useEditorStore((s) => s.setActiveTool)
  const setIsDrawingMode = useEditorStore((s) => s.setIsDrawingMode)
  const [drawColor, setDrawColor] = useState<string>(EDITOR_DEFAULTS.DEFAULT_DRAW_STROKE)
  const [drawWidth, setDrawWidth] = useState<number>(EDITOR_DEFAULTS.DEFAULT_DRAW_STROKE_WIDTH)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    startFreeDraw(canvas, { color: drawColor, width: drawWidth })
    setIsDrawingMode(true)
    return () => {
      const c = canvasRef.current
      if (c?.isDrawingMode) {
        stopFreeDraw(c)
        setIsDrawingMode(false)
      }
    }
    // Runs once on mount/unmount — starting/stopping with whatever
    // color/width was current at that moment; live changes below mutate the
    // brush directly, matching the effect's own one-shot lifecycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Draw</h3>
      <p className="text-[11px] text-text-muted">Drag on the canvas to draw a freehand shape.</p>
      <ColorPicker
        label="Stroke Color"
        value={drawColor}
        onChange={(color) => {
          setDrawColor(color)
          if (canvasRef.current?.freeDrawingBrush) canvasRef.current.freeDrawingBrush.color = color
        }}
      />
      <Slider
        label="Stroke Width"
        value={drawWidth}
        min={1}
        max={40}
        onChange={(width) => {
          setDrawWidth(width)
          if (canvasRef.current?.freeDrawingBrush) canvasRef.current.freeDrawingBrush.width = width
        }}
      />
      <Button variant="secondary" size="sm" onClick={() => setActiveTool('select')}>
        <StopIcon className="h-3.5 w-3.5" />
        Stop drawing
      </Button>
    </div>
  )
}
