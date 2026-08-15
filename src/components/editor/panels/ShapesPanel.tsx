import { useEffect, useState } from 'react'
import { Square, RectangleHorizontal, Triangle as TriangleIcon, Circle as CircleIcon, Pencil } from 'lucide-react'
import { ColorPicker } from '../../common/ColorPicker'
import { Slider } from '../../common/Slider'
import { useEditorCanvasContext } from '../../../lib/editor/EditorCanvasContext'
import { useEditorStore } from '../../../stores/editor/editorStore'
import { useEditorHistory } from '../../../hooks/editor/useEditorHistory'
import { addSquare, addRectangle, addTriangle, addCircle, startFreeDraw, stopFreeDraw } from '../../../lib/fabric/shapes'
import { EDITOR_DEFAULTS } from '../../../lib/editor/constants'
import { cn } from '../../../lib/utils/cn'

const SHAPE_BUTTONS = [
  { label: 'Square', icon: Square, add: addSquare },
  { label: 'Rectangle', icon: RectangleHorizontal, add: addRectangle },
  { label: 'Triangle', icon: TriangleIcon, add: addTriangle },
  { label: 'Circle', icon: CircleIcon, add: addCircle },
]

export function ShapesPanel() {
  const { canvasRef } = useEditorCanvasContext()
  const { pushState } = useEditorHistory()
  const isDrawingMode = useEditorStore((s) => s.isDrawingMode)
  const setIsDrawingMode = useEditorStore((s) => s.setIsDrawingMode)
  const [drawColor, setDrawColor] = useState<string>(EDITOR_DEFAULTS.DEFAULT_DRAW_STROKE)
  const [drawWidth, setDrawWidth] = useState<number>(EDITOR_DEFAULTS.DEFAULT_DRAW_STROKE_WIDTH)

  // Leaving the Shapes panel (switching tools) shouldn't leave the canvas
  // stuck capturing every pointer event for drawing.
  useEffect(() => {
    return () => {
      // Intentionally read the ref at cleanup time, not capture it at setup
      // time — the canvas may not exist yet when this effect is set up
      // (e.g. panel opened before a document exists) but does by unmount.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const canvas = canvasRef.current
      if (canvas?.isDrawingMode) {
        stopFreeDraw(canvas)
        setIsDrawingMode(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAddShape = (add: (canvas: NonNullable<typeof canvasRef.current>) => void) => {
    const canvas = canvasRef.current
    if (!canvas) return
    add(canvas)
    pushState()
  }

  const toggleDraw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (isDrawingMode) {
      stopFreeDraw(canvas)
      setIsDrawingMode(false)
    } else {
      startFreeDraw(canvas, { color: drawColor, width: drawWidth })
      setIsDrawingMode(true)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Shapes</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {SHAPE_BUTTONS.map(({ label, icon: Icon, add }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleAddShape(add)}
              className="flex flex-col items-center gap-1.5 rounded-md border border-surface-border px-3 py-3 text-xs text-text-secondary hover:border-surface-3 hover:text-text-primary"
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-surface-border pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Draw</h3>
        <button
          type="button"
          onClick={toggleDraw}
          className={cn(
            'flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs font-medium',
            isDrawingMode
              ? 'border-accent bg-accent/15 text-accent'
              : 'border-surface-border text-text-secondary hover:text-text-primary',
          )}
        >
          <Pencil className="h-4 w-4" />
          {isDrawingMode ? 'Drawing… (click to stop)' : 'Draw custom shape'}
        </button>
        {isDrawingMode && (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}
