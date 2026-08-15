import { useEditorCanvasContext } from '../../../lib/editor/EditorCanvasContext'
import { useCanvasZoom } from '../../../hooks/editor/useCanvasZoom'
import { CanvasEditor } from './CanvasEditor'

export function CanvasContainer() {
  const { containerRef } = useEditorCanvasContext()
  const { handleWheel } = useCanvasZoom()

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      className="scroll-thin relative flex h-full w-full items-center justify-center overflow-auto bg-surface-0 p-12"
    >
      <div className="shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_60px_-15px_rgba(0,0,0,0.6)]">
        <CanvasEditor />
      </div>
    </div>
  )
}
