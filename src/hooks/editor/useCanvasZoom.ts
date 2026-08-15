import { useCallback } from 'react'
import { useEditorCanvasContext } from '../../lib/editor/EditorCanvasContext'
import { useCanvasStore } from '../../stores/editor/canvasStore'
import { useEditorStore } from '../../stores/editor/editorStore'
import { EDITOR_DEFAULTS } from '../../lib/editor/constants'
import { applyCanvasZoom, computeFitZoom } from '../../lib/fabric/viewport'

export function useCanvasZoom() {
  const { canvasRef, containerRef } = useEditorCanvasContext()
  const zoom = useCanvasStore((s) => s.zoom)
  const setZoomValue = useCanvasStore((s) => s.setZoom)
  const documentWidth = useEditorStore((s) => s.documentWidth)
  const documentHeight = useEditorStore((s) => s.documentHeight)

  const setZoom = useCallback(
    (next: number) => {
      const canvas = canvasRef.current
      const clamped = Math.min(EDITOR_DEFAULTS.MAX_ZOOM, Math.max(EDITOR_DEFAULTS.MIN_ZOOM, next))
      if (canvas) applyCanvasZoom(canvas, documentWidth, documentHeight, clamped)
      setZoomValue(clamped)
    },
    [canvasRef, documentWidth, documentHeight, setZoomValue],
  )

  const zoomIn = useCallback(() => setZoom(zoom + EDITOR_DEFAULTS.ZOOM_STEP), [setZoom, zoom])
  const zoomOut = useCallback(() => setZoom(zoom - EDITOR_DEFAULTS.ZOOM_STEP), [setZoom, zoom])
  const zoomToActual = useCallback(() => setZoom(1), [setZoom])

  const zoomToFit = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const fit = computeFitZoom(
      { width: documentWidth, height: documentHeight },
      { width: container.clientWidth, height: container.clientHeight },
    )
    setZoom(fit)
  }, [containerRef, documentWidth, documentHeight, setZoom])

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (!(event.ctrlKey || event.metaKey)) return
      event.preventDefault()
      const delta = event.deltaY > 0 ? -EDITOR_DEFAULTS.ZOOM_STEP : EDITOR_DEFAULTS.ZOOM_STEP
      setZoom(zoom + delta)
    },
    [setZoom, zoom],
  )

  return { zoom, setZoom, zoomIn, zoomOut, zoomToActual, zoomToFit, handleWheel }
}
