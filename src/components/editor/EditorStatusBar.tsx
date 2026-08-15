import { useEditorStore } from '../../stores/editor/editorStore'
import { useCanvasStore } from '../../stores/editor/canvasStore'
import { useSelectedObject } from '../../hooks/editor/useSelectedObject'

export function EditorStatusBar() {
  const documentWidth = useEditorStore((s) => s.documentWidth)
  const documentHeight = useEditorStore((s) => s.documentHeight)
  const hasDocument = useEditorStore((s) => s.hasDocument)
  const zoom = useCanvasStore((s) => s.zoom)
  const { type, ids, transform } = useSelectedObject()

  return (
    <footer className="flex h-7 items-center justify-between border-t border-surface-border bg-surface-1 px-4 text-[11px] text-text-muted">
      <div>{hasDocument ? `${documentWidth} × ${documentHeight}px` : 'No document'}</div>
      <div className="flex items-center gap-3">
        {type === 'single' && transform && (
          <span>
            {transform.width} × {transform.height} · {transform.rotation}°
          </span>
        )}
        {type === 'multiple' && <span>{ids.length} objects selected</span>}
        <span>{Math.round(zoom * 100)}%</span>
      </div>
    </footer>
  )
}
