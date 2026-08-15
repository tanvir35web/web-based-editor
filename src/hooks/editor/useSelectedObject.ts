import { useCallback, useEffect, useState } from 'react'
import { Point, type FabricObject } from 'fabric'
import { useEditorCanvasContext } from '../../lib/editor/EditorCanvasContext'
import { useSelectionStore } from '../../stores/editor/selectionStore'
import { asEditorObject } from '../../lib/fabric/objects'
import { useEditorHistory } from './useEditorHistory'

export interface SelectedObjectTransform {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  locked: boolean
}

interface DerivedSelection {
  transform: SelectedObjectTransform | null
  activeObject: FabricObject | null
  activeObjects: FabricObject[]
}

const EMPTY_SELECTION: DerivedSelection = { transform: null, activeObject: null, activeObjects: [] }

function deriveSelection(object: FabricObject | undefined, activeObjects: FabricObject[]): DerivedSelection {
  if (!object) return EMPTY_SELECTION
  const center = object.getCenterPoint()
  return {
    activeObject: object,
    activeObjects,
    transform: {
      x: Math.round(center.x),
      y: Math.round(center.y),
      width: Math.round(object.getScaledWidth()),
      height: Math.round(object.getScaledHeight()),
      rotation: Math.round(object.angle ?? 0),
      opacity: Math.round((object.opacity ?? 1) * 100),
      locked: asEditorObject(object).locked ?? false,
    },
  }
}

/**
 * Derives selection info from the live canvas, recomputed only when
 * `selectionStore`'s version changes (selection change or a finished
 * transform) — never on every animation frame of a drag. Ref reads happen
 * inside an effect, not during render, per the React Compiler's ref rules —
 * the effect re-runs precisely when `version` changes, so it stays in sync.
 *
 * Position is reported/set as the object's *center point* rather than a
 * top-left corner — unlike top-left, the center is well defined regardless
 * of rotation or the object's origin setting, so it stays correct at any angle.
 */
export function useSelectedObject() {
  const { canvasRef } = useEditorCanvasContext()
  const ids = useSelectionStore((s) => s.ids)
  const type = useSelectionStore((s) => s.type)
  const objectType = useSelectionStore((s) => s.objectType)
  const version = useSelectionStore((s) => s.version)
  const { commitHistory } = useEditorHistory()

  const [derived, setDerived] = useState<DerivedSelection>(EMPTY_SELECTION)

  useEffect(() => {
    const canvas = canvasRef.current
    setDerived(deriveSelection(canvas?.getActiveObject(), canvas?.getActiveObjects() ?? []))
  }, [canvasRef, version])

  const withActiveObject = useCallback(
    (fn: (canvas: NonNullable<typeof canvasRef.current>, object: FabricObject) => void) => {
      const canvas = canvasRef.current
      const object = canvas?.getActiveObject()
      if (!canvas || !object) return
      fn(canvas, object)
      object.setCoords()
      canvas.requestRenderAll()
      commitHistory()
    },
    [canvasRef, commitHistory],
  )

  const setPosition = useCallback(
    (x: number, y: number) => withActiveObject((_canvas, object) => object.setXY(new Point(x, y), 'center', 'center')),
    [withActiveObject],
  )

  const setSize = useCallback(
    (width: number, height: number) =>
      withActiveObject((_canvas, object) => {
        object.scaleToWidth(Math.max(1, width))
        object.scaleToHeight(Math.max(1, height))
      }),
    [withActiveObject],
  )

  const setRotation = useCallback(
    (angle: number) => withActiveObject((_canvas, object) => object.rotate(angle)),
    [withActiveObject],
  )

  const setOpacity = useCallback(
    (percent: number) => withActiveObject((_canvas, object) => object.set('opacity', Math.min(100, Math.max(0, percent)) / 100)),
    [withActiveObject],
  )

  return {
    ids,
    type,
    objectType,
    version,
    transform: derived.transform,
    activeObject: derived.activeObject,
    activeObjects: derived.activeObjects,
    setPosition,
    setSize,
    setRotation,
    setOpacity,
  }
}
