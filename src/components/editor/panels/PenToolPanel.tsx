import { useEffect, useState } from 'react'
import { Check, X, Undo2 } from 'lucide-react'
import { ColorPicker } from '../../common/ColorPicker'
import { Slider } from '../../common/Slider'
import { Button } from '../../common/Button'
import { useEditorStore } from '../../../stores/editor/editorStore'
import { usePenTool } from '../../../hooks/editor/usePenTool'
import { EDITOR_DEFAULTS } from '../../../lib/editor/constants'

/**
 * Reached directly from the tool rail — mounting this panel *is* the
 * activation (see DrawPanel for the same reasoning). The unmount-cleanup
 * effect only cancels the session if it's *still* active — if the user
 * finished/cancelled explicitly (Finish/Cancel button, Enter/Escape,
 * click-to-close), usePenTool's finishPath/cancelPenToolSession already
 * switched the tool back to 'select' themselves, so by the time this panel
 * unmounts there's nothing left to clean up.
 */
export function PenToolPanel() {
  const { startPenTool, finishPath, cancelPenToolSession, removeLastPoint, updateStrokeStyle } = usePenTool()
  const [drawColor, setDrawColor] = useState<string>(EDITOR_DEFAULTS.DEFAULT_DRAW_STROKE)
  const [drawWidth, setDrawWidth] = useState<number>(EDITOR_DEFAULTS.DEFAULT_DRAW_STROKE_WIDTH)

  useEffect(() => {
    startPenTool({ color: drawColor, width: drawWidth })
    return () => {
      if (useEditorStore.getState().isPenToolActive) {
        cancelPenToolSession(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Pen Tool</h3>
      <p className="text-[11px] text-text-muted">
        Click to place points. Click and drag while placing a point to curve the segment. Click back on the first
        point to close the shape, or use Finish for an open path.
      </p>
      <ColorPicker
        label="Stroke Color"
        value={drawColor}
        onChange={(color) => {
          setDrawColor(color)
          updateStrokeStyle({ color })
        }}
      />
      <Slider
        label="Stroke Width"
        value={drawWidth}
        min={1}
        max={40}
        onChange={(width) => {
          setDrawWidth(width)
          updateStrokeStyle({ width })
        }}
      />
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" className="flex-1" onClick={removeLastPoint}>
          <Undo2 className="h-3.5 w-3.5" />
          Undo point
        </Button>
        <Button variant="primary" size="sm" className="flex-1" onClick={() => finishPath(false)}>
          <Check className="h-3.5 w-3.5" />
          Finish
        </Button>
        <Button variant="ghost" size="sm" className="flex-1" onClick={() => cancelPenToolSession()}>
          <X className="h-3.5 w-3.5" />
          Cancel
        </Button>
      </div>
    </div>
  )
}
