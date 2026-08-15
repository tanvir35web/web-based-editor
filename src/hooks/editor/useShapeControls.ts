import { useCallback, useState } from 'react'
import type { FabricObject } from 'fabric'
import { useEditorCanvasContext } from '../../lib/editor/EditorCanvasContext'
import { useSelectedObject } from './useSelectedObject'
import { useEditorHistory } from './useEditorHistory'
import { getShapeProps, updateShapeProps } from '../../lib/fabric/shapes'
import { asEditorObject } from '../../lib/fabric/objects'
import { createDefaultShapeProps } from '../../lib/editor/defaults'
import type { EditorObjectType, ShapeObjectProps } from '../../types/objects'

// Freehand-drawn paths share the same fill/stroke/strokeWidth properties as
// the quick-add shapes, so they're editable through the same controls
// (just without a corner-radius, which only makes sense for rects).
const SHAPE_LIKE_TYPES: EditorObjectType[] = ['rect', 'circle', 'triangle', 'path']

function isShapeObject(object: FabricObject | null): boolean {
  if (!object) return false
  return SHAPE_LIKE_TYPES.includes(asEditorObject(object).editorType)
}

export function useShapeControls() {
  const { canvasRef } = useEditorCanvasContext()
  const { activeObject, version } = useSelectedObject()
  const { commitHistory } = useEditorHistory()

  const shape = isShapeObject(activeObject) ? activeObject : null
  const isRectShape = shape !== null && asEditorObject(shape).editorType === 'rect'

  // See useTextControls/useImageAdjustments for why this is local state
  // resynced during render, not a memo off `version`.
  const selectionKey = shape ? `${asEditorObject(shape).id}#${version}` : `none#${version}`
  const [lastSelectionKey, setLastSelectionKey] = useState(selectionKey)
  const [shapeProps, setShapeProps] = useState<ShapeObjectProps>(() =>
    shape ? getShapeProps(shape) : createDefaultShapeProps(),
  )
  if (selectionKey !== lastSelectionKey) {
    setLastSelectionKey(selectionKey)
    setShapeProps(shape ? getShapeProps(shape) : createDefaultShapeProps())
  }

  const updateShape = useCallback(
    (patch: Partial<ShapeObjectProps>) => {
      const canvas = canvasRef.current
      if (!canvas || !shape) return
      updateShapeProps(canvas, shape, patch)
      setShapeProps((prev) => ({ ...prev, ...patch }))
      commitHistory()
    },
    [canvasRef, shape, commitHistory],
  )

  return { hasShape: shape !== null, isRectShape, shapeProps, updateShape }
}
