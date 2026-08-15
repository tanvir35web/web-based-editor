import { useEditorCanvasContext } from '../../lib/editor/EditorCanvasContext'

/**
 * Access to the live Fabric canvas instance via its ref. Callers dereference
 * `canvasRef.current` inside effects/event handlers, never during render —
 * ref reads during render are unsafe under the React Compiler.
 */
export function useEditorCanvas() {
  const { canvasRef, containerRef, isReady } = useEditorCanvasContext()
  return { canvasRef, containerRef, isReady }
}
