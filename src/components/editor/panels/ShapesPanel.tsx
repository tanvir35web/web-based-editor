import { Square, RectangleHorizontal, Triangle as TriangleIcon, Circle as CircleIcon } from 'lucide-react'
import { useEditorCanvasContext } from '../../../lib/editor/EditorCanvasContext'
import { useEditorHistory } from '../../../hooks/editor/useEditorHistory'
import { addSquare, addRectangle, addTriangle, addCircle } from '../../../lib/fabric/shapes'

const SHAPE_BUTTONS = [
  { label: 'Square', icon: Square, add: addSquare },
  { label: 'Rectangle', icon: RectangleHorizontal, add: addRectangle },
  { label: 'Triangle', icon: TriangleIcon, add: addTriangle },
  { label: 'Circle', icon: CircleIcon, add: addCircle },
]

export function ShapesPanel() {
  const { canvasRef } = useEditorCanvasContext()
  const { pushState } = useEditorHistory()

  const handleAddShape = (add: (canvas: NonNullable<typeof canvasRef.current>) => void) => {
    const canvas = canvasRef.current
    if (!canvas) return
    add(canvas)
    pushState()
  }

  return (
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
  )
}
