import { useEffect, type ReactNode } from 'react'
import { EditorCanvasProvider, useEditorCanvasContext } from '../lib/editor/EditorCanvasContext'
import { createFabricCanvas, disposeFabricCanvas } from '../lib/fabric/canvas'

/** Mounts a real Fabric canvas into an EditorCanvasProvider for hook tests. */
function CanvasMounter({ children }: { children: ReactNode }) {
  const { registerCanvas, containerRef } = useEditorCanvasContext()

  useEffect(() => {
    const canvas = createFabricCanvas(document.createElement('canvas'))
    registerCanvas(canvas)
    return () => disposeFabricCanvas(canvas)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={containerRef}>{children}</div>
}

export function CanvasTestProvider({ children }: { children: ReactNode }) {
  return (
    <EditorCanvasProvider>
      <CanvasMounter>{children}</CanvasMounter>
    </EditorCanvasProvider>
  )
}
