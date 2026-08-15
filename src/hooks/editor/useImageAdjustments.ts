import { useCallback, useState } from 'react'
import { useEditorCanvasContext } from '../../lib/editor/EditorCanvasContext'
import { useSelectedObject } from './useSelectedObject'
import { useEditorHistory } from './useEditorHistory'
import { isEditorImage, getImageAdjustments, setImageAdjustments, type EditorImageObject } from '../../lib/fabric/images'
import { createDefaultAdjustments } from '../../lib/editor/defaults'
import type { AdjustmentValues } from '../../types/objects'

export function useImageAdjustments() {
  const { canvasRef } = useEditorCanvasContext()
  const { activeObject, version } = useSelectedObject()
  const { commitHistory } = useEditorHistory()

  const image = isEditorImage(activeObject) ? (activeObject as EditorImageObject) : null

  // Local state, not a memo off `version` — `version` only changes on
  // selection/transform events, not on every adjustment tweak, so a memo
  // would keep returning a stale snapshot after each slider/toggle change
  // (and since sliders are controlled by this value, they'd visually snap
  // back). Resynced from the image whenever the selection itself changes,
  // adjusted during render rather than in an effect — see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const selectionKey = image ? `${image.id}#${version}` : `none#${version}`
  const [lastSelectionKey, setLastSelectionKey] = useState(selectionKey)
  const [adjustments, setAdjustments] = useState<AdjustmentValues>(() =>
    image ? getImageAdjustments(image) : createDefaultAdjustments(),
  )
  if (selectionKey !== lastSelectionKey) {
    setLastSelectionKey(selectionKey)
    setAdjustments(image ? getImageAdjustments(image) : createDefaultAdjustments())
  }

  const updateAdjustments = useCallback(
    (patch: Partial<AdjustmentValues>) => {
      const canvas = canvasRef.current
      if (!canvas || !image) return
      const next = { ...getImageAdjustments(image), ...patch }
      setImageAdjustments(canvas, image, next)
      setAdjustments(next)
      commitHistory()
    },
    [canvasRef, image, commitHistory],
  )

  const resetAdjustments = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !image) return
    const defaults = createDefaultAdjustments()
    setImageAdjustments(canvas, image, defaults)
    setAdjustments(defaults)
    commitHistory()
  }, [canvasRef, image, commitHistory])

  return { hasImage: image !== null, adjustments, updateAdjustments, resetAdjustments }
}
