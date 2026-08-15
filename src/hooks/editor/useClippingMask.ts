import { useCallback } from 'react'
import { useEditorCanvasContext } from '../../lib/editor/EditorCanvasContext'
import { useSelectedObject } from './useSelectedObject'
import { useEditorHistory } from './useEditorHistory'
import { applyClippingMask, releaseClippingMask, hasClippingMask } from '../../lib/fabric/clipping'

export function useClippingMask() {
  const { canvasRef } = useEditorCanvasContext()
  const { type, activeObject, activeObjects } = useSelectedObject()
  const { pushState } = useEditorHistory()

  const canCreateClipMask = type === 'multiple' && activeObjects.length === 2
  const canReleaseClipMask = type === 'single' && !!activeObject && hasClippingMask(activeObject)

  const createClipMask = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !canCreateClipMask) return
    // The topmost of the two (highest index in canvas z-order) is the mask shape.
    const [a, b] = activeObjects
    const objects = canvas.getObjects()
    const [mask, content] = objects.indexOf(a) > objects.indexOf(b) ? [a, b] : [b, a]
    void applyClippingMask(canvas, mask, content).then(() => pushState())
  }, [canvasRef, canCreateClipMask, activeObjects, pushState])

  const releaseClipMask = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !activeObject) return
    void releaseClippingMask(canvas, activeObject).then(() => pushState())
  }, [canvasRef, activeObject, pushState])

  return { canCreateClipMask, canReleaseClipMask, createClipMask, releaseClipMask }
}
