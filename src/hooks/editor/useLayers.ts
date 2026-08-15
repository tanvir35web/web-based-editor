import { useCallback, useEffect, useState } from 'react'
import { useEditorCanvasContext } from '../../lib/editor/EditorCanvasContext'
import { useEditorStore } from '../../stores/editor/editorStore'
import { useEditorHistory } from './useEditorHistory'
import {
  asEditorObject,
  applyLockState,
  setObjectVisibility,
  bringForward as bringObjectForward,
  sendBackward as sendObjectBackward,
  bringToFront as bringObjectToFront,
  sendToBack as sendObjectToBack,
  deleteObjects,
  findObjectById,
  getObjectMeta,
} from '../../lib/fabric/objects'
import type { EditorObjectMeta } from '../../types/objects'

export function useLayers() {
  const { canvasRef } = useEditorCanvasContext()
  const objectsVersion = useEditorStore((s) => s.objectsVersion)
  const bumpObjectsVersion = useEditorStore((s) => s.bumpObjectsVersion)
  const { commitHistory, pushState } = useEditorHistory()

  // Ref reads happen inside an effect, not during render, per the React
  // Compiler's ref rules — this re-syncs precisely when objectsVersion changes.
  const [layers, setLayers] = useState<EditorObjectMeta[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      setLayers([])
      return
    }
    // Fabric orders objects back-to-front; layers panels read top-to-front-first.
    setLayers(canvas.getObjects().map(getObjectMeta).reverse())
  }, [canvasRef, objectsVersion])

  const withObject = useCallback(
    (id: string, fn: (canvas: NonNullable<typeof canvasRef.current>, object: ReturnType<typeof findObjectById>) => void) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const object = findObjectById(canvas, id)
      if (!object) return
      fn(canvas, object)
      bumpObjectsVersion()
    },
    [canvasRef, bumpObjectsVersion],
  )

  const selectLayer = useCallback(
    (id: string) => {
      const canvas = canvasRef.current
      const object = canvas && findObjectById(canvas, id)
      if (!canvas || !object) return
      canvas.setActiveObject(object)
      canvas.requestRenderAll()
    },
    [canvasRef],
  )

  const toggleVisibility = useCallback(
    (id: string) => {
      withObject(id, (canvas, object) => {
        if (!object) return
        setObjectVisibility(object, !(object.visible ?? true))
        canvas.requestRenderAll()
        commitHistory()
      })
    },
    [withObject, commitHistory],
  )

  const toggleLock = useCallback(
    (id: string) => {
      withObject(id, (canvas, object) => {
        if (!object) return
        applyLockState(object, !asEditorObject(object).locked)
        canvas.requestRenderAll()
        commitHistory()
      })
    },
    [withObject, commitHistory],
  )

  const reorder = useCallback(
    (id: string, action: 'forward' | 'backward' | 'front' | 'back') => {
      withObject(id, (canvas, object) => {
        if (!object) return
        if (action === 'forward') bringObjectForward(canvas, object)
        if (action === 'backward') sendObjectBackward(canvas, object)
        if (action === 'front') bringObjectToFront(canvas, object)
        if (action === 'back') sendObjectToBack(canvas, object)
        pushState()
      })
    },
    [withObject, pushState],
  )

  const deleteLayer = useCallback(
    (id: string) => {
      withObject(id, (canvas, object) => {
        if (!object) return
        deleteObjects(canvas, [object])
        pushState()
      })
    },
    [withObject, pushState],
  )

  return { layers, selectLayer, toggleVisibility, toggleLock, reorder, deleteLayer }
}
