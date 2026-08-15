import { useCallback } from 'react'
import { useEditorCanvasContext } from '../../lib/editor/EditorCanvasContext'
import { useSelectedObject } from './useSelectedObject'
import { useEditorHistory } from './useEditorHistory'
import { useEditorStore } from '../../stores/editor/editorStore'
import { isEditorImage } from '../../lib/fabric/images'
import { enterCropMode, applyCrop, cancelCrop } from '../../lib/fabric/crop'

export function useImageCrop() {
  const { canvasRef, cropRef, historyRef } = useEditorCanvasContext()
  const { activeObject } = useSelectedObject()
  const { pushState } = useEditorHistory()
  const isCropping = useEditorStore((s) => s.isCropping)
  const setIsCropping = useEditorStore((s) => s.setIsCropping)

  const canStartCrop = !isCropping && isEditorImage(activeObject)

  const startCrop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !canStartCrop || !isEditorImage(activeObject)) return
    // The crop rectangle and preview image are transient scaffolding, not
    // real document content — suppress the history/layers churn their
    // add/remove would otherwise trigger, same guard undo/redo restores use.
    historyRef.current.isRestoring = true
    enterCropMode(canvas, cropRef.current, activeObject)
    setIsCropping(true)
  }, [canvasRef, cropRef, historyRef, canStartCrop, activeObject, setIsCropping])

  const confirmCrop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !isCropping) return
    applyCrop(canvas, cropRef.current)
    historyRef.current.isRestoring = false
    setIsCropping(false)
    pushState()
  }, [canvasRef, cropRef, historyRef, isCropping, setIsCropping, pushState])

  const cancelCropSession = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !isCropping) return
    cancelCrop(canvas, cropRef.current)
    historyRef.current.isRestoring = false
    setIsCropping(false)
  }, [canvasRef, cropRef, historyRef, isCropping, setIsCropping])

  return { isCropping, canStartCrop, startCrop, confirmCrop, cancelCropSession }
}
