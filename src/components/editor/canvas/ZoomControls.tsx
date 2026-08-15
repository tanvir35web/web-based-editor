import { Minus, Plus, Maximize } from 'lucide-react'
import { useCanvasZoom } from '../../../hooks/editor/useCanvasZoom'
import { IconButton } from '../../common/IconButton'

export function ZoomControls() {
  const { zoom, zoomIn, zoomOut, zoomToActual, zoomToFit } = useCanvasZoom()

  return (
    <div className="flex items-center gap-1 rounded-lg border border-surface-border bg-surface-1 p-1 shadow-lg">
      <IconButton icon={<Minus className="h-4 w-4" />} label="Zoom out" size="sm" onClick={zoomOut} />
      <button
        type="button"
        onClick={zoomToActual}
        className="min-w-[3.5rem] rounded-md px-1.5 py-1 text-center text-xs text-text-secondary tabular-nums hover:bg-surface-2 hover:text-text-primary"
      >
        {Math.round(zoom * 100)}%
      </button>
      <IconButton icon={<Plus className="h-4 w-4" />} label="Zoom in" size="sm" onClick={zoomIn} />
      <div className="mx-0.5 h-5 w-px bg-surface-border" />
      <IconButton icon={<Maximize className="h-4 w-4" />} label="Fit to screen" size="sm" onClick={zoomToFit} />
    </div>
  )
}
