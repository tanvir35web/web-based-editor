import { useCallback, useState } from 'react'
import { Textbox } from 'fabric'
import { useEditorCanvasContext } from '../../lib/editor/EditorCanvasContext'
import { useSelectedObject } from './useSelectedObject'
import { useEditorHistory } from './useEditorHistory'
import { getTextProps, updateTextProps } from '../../lib/fabric/text'
import { asEditorObject } from '../../lib/fabric/objects'
import { createDefaultTextProps } from '../../lib/editor/defaults'
import type { TextObjectProps } from '../../types/objects'

export function useTextControls() {
  const { canvasRef } = useEditorCanvasContext()
  const { activeObject, version } = useSelectedObject()
  const { commitHistory } = useEditorHistory()

  const textbox = activeObject instanceof Textbox ? activeObject : null

  // Local state, not a memo off `version` — see useImageAdjustments for why:
  // these controls are the source of truth Select/ColorPicker/Slider are
  // controlled by, so they must reflect every change immediately, not just
  // ones that happen to also bump the selection version. Resynced during
  // render (not in an effect) whenever the selection itself changes.
  const selectionKey = textbox ? `${asEditorObject(textbox).id}#${version}` : `none#${version}`
  const [lastSelectionKey, setLastSelectionKey] = useState(selectionKey)
  const [textProps, setTextProps] = useState<TextObjectProps>(() =>
    textbox ? getTextProps(textbox) : createDefaultTextProps(),
  )
  if (selectionKey !== lastSelectionKey) {
    setLastSelectionKey(selectionKey)
    setTextProps(textbox ? getTextProps(textbox) : createDefaultTextProps())
  }

  const updateText = useCallback(
    (patch: Partial<TextObjectProps>) => {
      const canvas = canvasRef.current
      if (!canvas || !textbox) return
      updateTextProps(canvas, textbox, patch)
      setTextProps((prev) => ({ ...prev, ...patch }))
      commitHistory()
    },
    [canvasRef, textbox, commitHistory],
  )

  return { hasText: textbox !== null, textProps, updateText }
}
