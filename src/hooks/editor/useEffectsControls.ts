import { useCallback, useState } from 'react'
import { useEditorCanvasContext } from '../../lib/editor/EditorCanvasContext'
import { useSelectedObject } from './useSelectedObject'
import { useEditorHistory } from './useEditorHistory'
import { getShadowProps, updateShadowProps, getBlendMode, updateBlendMode } from '../../lib/fabric/shadow'
import { asEditorObject } from '../../lib/fabric/objects'
import type { BlendMode, ShadowProps } from '../../types/objects'

const DEFAULT_SHADOW: ShadowProps = { enabled: false, color: '#000000', blur: 10, offsetX: 4, offsetY: 4 }

/**
 * Applies to any single selected object (image/text/shape/path alike), not
 * just shape-like types — mirrors useShapeControls/useTextControls's
 * resync-on-selection pattern (local state, adjusted during render rather
 * than an effect, so sliders stay controlled without lagging a frame).
 */
export function useEffectsControls() {
  const { canvasRef } = useEditorCanvasContext()
  const { activeObject, version } = useSelectedObject()
  const { commitHistory } = useEditorHistory()

  const object = activeObject

  const selectionKey = object ? `${asEditorObject(object).id}#${version}` : `none#${version}`
  const [lastSelectionKey, setLastSelectionKey] = useState(selectionKey)
  const [shadow, setShadow] = useState<ShadowProps>(() => (object ? getShadowProps(object) : DEFAULT_SHADOW))
  const [blendMode, setBlendMode] = useState<BlendMode>(() => (object ? getBlendMode(object) : 'source-over'))
  if (selectionKey !== lastSelectionKey) {
    setLastSelectionKey(selectionKey)
    setShadow(object ? getShadowProps(object) : DEFAULT_SHADOW)
    setBlendMode(object ? getBlendMode(object) : 'source-over')
  }

  const updateShadow = useCallback(
    (patch: Partial<ShadowProps>) => {
      const canvas = canvasRef.current
      if (!canvas || !object) return
      updateShadowProps(canvas, object, patch)
      setShadow((prev) => ({ ...prev, ...patch }))
      commitHistory()
    },
    [canvasRef, object, commitHistory],
  )

  const updateBlend = useCallback(
    (mode: BlendMode) => {
      const canvas = canvasRef.current
      if (!canvas || !object) return
      updateBlendMode(canvas, object, mode)
      setBlendMode(mode)
      commitHistory()
    },
    [canvasRef, object, commitHistory],
  )

  return { hasObject: object !== null, shadow, blendMode, updateShadow, updateBlend }
}
