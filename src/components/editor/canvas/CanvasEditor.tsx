import { useEffect, useRef } from 'react'
import type { Canvas, FabricObject } from 'fabric'
import { useEditorCanvasContext } from '../../../lib/editor/EditorCanvasContext'
import { createFabricCanvas, disposeFabricCanvas } from '../../../lib/fabric/canvas'
import { getObjectMeta } from '../../../lib/fabric/objects'
import { tagFreeDrawnPath } from '../../../lib/fabric/shapes'
import { useSelectionStore } from '../../../stores/editor/selectionStore'
import { useEditorStore } from '../../../stores/editor/editorStore'
import { useEditorHistory } from '../../../hooks/editor/useEditorHistory'
import { useSnapping } from '../../../hooks/editor/useSnapping'
import { usePenTool } from '../../../hooks/editor/usePenTool'
import { SnapGuidesOverlay } from './SnapGuidesOverlay'
import type { SelectionInfo } from '../../../types/editor'

function computeSelectionInfo(canvas: Canvas): SelectionInfo {
  const active = canvas.getActiveObjects()
  if (active.length === 0) return { ids: [], type: 'none', objectType: null }
  const metas = active.map(getObjectMeta)
  return {
    ids: metas.map((m) => m.id),
    type: active.length === 1 ? 'single' : 'multiple',
    objectType: active.length === 1 ? metas[0].type : null,
  }
}

export function CanvasEditor() {
  const { registerCanvas, historyRef } = useEditorCanvasContext()
  const canvasElRef = useRef<HTMLCanvasElement | null>(null)
  const setSelection = useSelectionStore((s) => s.setSelection)
  const clearSelection = useSelectionStore((s) => s.clearSelection)
  const bumpObjectsVersion = useEditorStore((s) => s.bumpObjectsVersion)
  const { pushState } = useEditorHistory()
  const { handleObjectMoving, clearGuides, guides } = useSnapping()
  const { handleMouseDown, handleMouseMove, handleMouseUp, handleDblClick } = usePenTool()

  useEffect(() => {
    const el = canvasElRef.current
    if (!el) return

    const canvas = createFabricCanvas(el)
    registerCanvas(canvas)

    const handleSelectionChange = () => setSelection(computeSelectionInfo(canvas))
    const handleSelectionCleared = () => clearSelection()
    const handleObjectMutated = () => {
      // loadFromJSON (undo/redo, document load) fires object:added per restored
      // object — skip the per-object store churn while a restore is in flight.
      if (historyRef.current.isRestoring) return
      setSelection(computeSelectionInfo(canvas))
      bumpObjectsVersion()
      pushState()
    }
    const handleObjectModified = () => {
      clearGuides()
      if (historyRef.current.isRestoring) return
      setSelection(computeSelectionInfo(canvas))
      pushState()
    }
    // Fires before the drawn path is added to the canvas (and thus before
    // 'object:added'), so the path must be tagged with an id/name here —
    // otherwise the object:added history snapshot would capture it untagged.
    const handleBeforePathCreated = (event: { path: FabricObject }) => {
      tagFreeDrawnPath(event.path)
    }

    canvas.on('selection:created', handleSelectionChange)
    canvas.on('selection:updated', handleSelectionChange)
    canvas.on('selection:cleared', handleSelectionCleared)
    canvas.on('object:added', handleObjectMutated)
    canvas.on('object:removed', handleObjectMutated)
    canvas.on('object:modified', handleObjectModified)
    canvas.on('object:moving', handleObjectMoving)
    canvas.on('mouse:up', clearGuides)
    canvas.on('mouse:down', handleMouseDown)
    canvas.on('mouse:move', handleMouseMove)
    canvas.on('mouse:up', handleMouseUp)
    canvas.on('mouse:dblclick', handleDblClick)
    canvas.on('before:path:created', handleBeforePathCreated)

    return () => {
      canvas.off('selection:created', handleSelectionChange)
      canvas.off('selection:updated', handleSelectionChange)
      canvas.off('selection:cleared', handleSelectionCleared)
      canvas.off('object:added', handleObjectMutated)
      canvas.off('object:removed', handleObjectMutated)
      canvas.off('object:modified', handleObjectModified)
      canvas.off('object:moving', handleObjectMoving)
      canvas.off('mouse:up', clearGuides)
      canvas.off('mouse:down', handleMouseDown)
      canvas.off('mouse:move', handleMouseMove)
      canvas.off('mouse:up', handleMouseUp)
      canvas.off('mouse:dblclick', handleDblClick)
      canvas.off('before:path:created', handleBeforePathCreated)
      registerCanvas(null)
      disposeFabricCanvas(canvas)
    }
    // Canvas lifecycle should run exactly once per mount — all handlers close
    // over stable store setters / refs, not over changing render-time values.
    // handleObjectMoving/clearGuides (useSnapping) and the pen-tool handlers
    // (usePenTool) are themselves stable across renders (they only depend on
    // stable refs, reading any reactive flag fresh via getState() inside the
    // callback instead), so they're safe to omit from deps here too.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative">
      <canvas ref={canvasElRef} className="block" />
      <SnapGuidesOverlay guides={guides} />
    </div>
  )
}
