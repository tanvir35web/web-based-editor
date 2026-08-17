import { useCallback } from 'react'
import type { TPointerEventInfo } from 'fabric'
import { useEditorCanvasContext } from '../../lib/editor/EditorCanvasContext'
import { useEditorStore } from '../../stores/editor/editorStore'
import { useEditorHistory } from './useEditorHistory'
import {
  startPenTool as startPenToolFn,
  addPoint,
  updateHandleDrag,
  commitHandleDrag,
  updateRubberBand,
  removeLastPoint as removeLastPointFn,
  updateStrokeStyle as updateStrokeStyleFn,
  isNearFirstPoint,
  finishPenTool as finishPenToolFn,
  cancelPenTool as cancelPenToolFn,
} from '../../lib/fabric/penTool'

/**
 * Session-based custom canvas interaction, mirroring useImageCrop.ts's
 * start/finish/cancel shape. The mouse handlers below are wired into
 * CanvasEditor.tsx's mount-once listener-registration effect, so they read
 * `useEditorStore.getState().isPenToolActive` fresh at call time rather than
 * a reactive selector — exactly like useSnapping.ts's handleObjectMoving —
 * since a reactive value captured at mount would never see later toggles.
 */
export function usePenTool() {
  const { canvasRef, penToolRef, historyRef } = useEditorCanvasContext()
  const isPenToolActive = useEditorStore((s) => s.isPenToolActive)
  const setIsPenToolActive = useEditorStore((s) => s.setIsPenToolActive)
  const setActiveTool = useEditorStore((s) => s.setActiveTool)
  const isDrawingMode = useEditorStore((s) => s.isDrawingMode)
  const isCropping = useEditorStore((s) => s.isCropping)
  const { pushState } = useEditorHistory()

  const canStartPenTool = !isPenToolActive && !isDrawingMode && !isCropping

  const startPenTool = useCallback(
    (options: { color: string; width: number }) => {
      const canvas = canvasRef.current
      if (!canvas) return
      // The preview path and anchor markers are transient scaffolding, not
      // real document content — suppress the history/layers churn their
      // add/remove would otherwise trigger, same guard crop mode uses.
      historyRef.current.isRestoring = true
      startPenToolFn(canvas, penToolRef.current, options)
      setIsPenToolActive(true)
    },
    [canvasRef, penToolRef, historyRef, setIsPenToolActive],
  )

  /**
   * `returnToSelect` (default true) switches the active rail tool back to
   * 'select' after finishing — every *explicit* finish (click-to-close,
   * dblclick, Enter, the panel's Finish button) wants this, matching real
   * pen-tool UX (you land back on the selection tool with the new shape
   * selected). The one caller that passes `false` is PenToolPanel's own
   * unmount-cleanup effect, which runs *because* the tool already changed
   * away — forcing it back to 'select' there would fight whatever tool the
   * user actually clicked next.
   */
  const finishPath = useCallback(
    (close: boolean, returnToSelect = true) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const result = finishPenToolFn(canvas, penToolRef.current, { close })
      historyRef.current.isRestoring = false
      setIsPenToolActive(false)
      if (returnToSelect) setActiveTool('select')
      if (result) {
        canvas.setActiveObject(result)
        pushState()
      }
    },
    [canvasRef, penToolRef, historyRef, setIsPenToolActive, setActiveTool, pushState],
  )

  const cancelPenToolSession = useCallback(
    (returnToSelect = true) => {
      const canvas = canvasRef.current
      if (!canvas) return
      cancelPenToolFn(canvas, penToolRef.current)
      historyRef.current.isRestoring = false
      setIsPenToolActive(false)
      if (returnToSelect) setActiveTool('select')
    },
    [canvasRef, penToolRef, historyRef, setIsPenToolActive, setActiveTool],
  )

  const removeLastPoint = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    removeLastPointFn(canvas, penToolRef.current)
  }, [canvasRef, penToolRef])

  const updateStrokeStyle = useCallback(
    (options: { color?: string; width?: number }) => {
      const canvas = canvasRef.current
      if (!canvas) return
      updateStrokeStyleFn(canvas, penToolRef.current, options)
    },
    [canvasRef, penToolRef],
  )

  const handleMouseDown = useCallback(
    (event: TPointerEventInfo) => {
      if (!useEditorStore.getState().isPenToolActive) return
      const canvas = canvasRef.current
      if (!canvas) return
      const state = penToolRef.current
      const point = { x: event.scenePoint.x, y: event.scenePoint.y }
      if (state.points.length >= 2 && isNearFirstPoint(state, point)) {
        finishPath(true)
        return
      }
      addPoint(canvas, state, point)
    },
    [canvasRef, penToolRef, finishPath],
  )

  const handleMouseMove = useCallback(
    (event: TPointerEventInfo) => {
      if (!useEditorStore.getState().isPenToolActive) return
      const canvas = canvasRef.current
      if (!canvas) return
      const point = { x: event.scenePoint.x, y: event.scenePoint.y }
      const state = penToolRef.current
      if (state.isDraggingHandle) {
        updateHandleDrag(canvas, state, point)
      } else {
        updateRubberBand(canvas, state, point)
      }
    },
    [canvasRef, penToolRef],
  )

  const handleMouseUp = useCallback(() => {
    if (!useEditorStore.getState().isPenToolActive) return
    commitHandleDrag(penToolRef.current)
  }, [penToolRef])

  const handleDblClick = useCallback(() => {
    if (!useEditorStore.getState().isPenToolActive) return
    const canvas = canvasRef.current
    if (!canvas) return
    // A dblclick is preceded by two real mouse:down events, so the second
    // click of the double-click already added a spurious extra point.
    removeLastPointFn(canvas, penToolRef.current)
    finishPath(false)
  }, [canvasRef, penToolRef, finishPath])

  return {
    isPenToolActive,
    canStartPenTool,
    startPenTool,
    finishPath,
    cancelPenToolSession,
    removeLastPoint,
    updateStrokeStyle,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDblClick,
  }
}
