import { useCallback, useState } from 'react'
import type { FabricObject } from 'fabric'
import { useEditorCanvasContext } from '../../lib/editor/EditorCanvasContext'
import { useCanvasStore } from '../../stores/editor/canvasStore'
import { computeObjectSnap, type SnapGuide } from '../../lib/fabric/snapping'

interface ObjectMovingEvent {
  target: FabricObject
}

/**
 * Wired into CanvasEditor.tsx's `object:moving` listener — the one place
 * canvas.on(...) is called, per architecture. That wiring happens inside an
 * effect that intentionally runs once on mount (see CanvasEditor's comment),
 * so `handleObjectMoving` reads `useCanvasStore.getState().snapping` fresh
 * on every call rather than closing over a reactive selector value — a
 * `useCanvasStore((s) => s.snapping)` subscription would freeze at whatever
 * the setting was when the effect first ran and never see later toggles.
 *
 * `guides` is kept as local state here (not Zustand) since it changes on
 * every animation-frame tick during a drag; CanvasEditor renders it via
 * SnapGuidesOverlay, matching how historyRef/cropRef already keep
 * canvas-adjacent transient state out of global stores.
 */
export function useSnapping() {
  const { canvasRef } = useEditorCanvasContext()
  const [guides, setGuides] = useState<SnapGuide[]>([])

  const handleObjectMoving = useCallback(
    (event: ObjectMovingEvent) => {
      const canvas = canvasRef.current
      const snapping = useCanvasStore.getState().snapping
      if (!canvas || !snapping.enabled) return

      const target = event.target
      const moving = target.getBoundingRect()
      const others = canvas
        .getObjects()
        .filter((obj) => obj !== target && obj.visible !== false)
        .map((obj) => obj.getBoundingRect())

      const snap = computeObjectSnap(moving, others, snapping)
      if (snap.dx !== 0 || snap.dy !== 0) {
        target.set({ left: (target.left ?? 0) + snap.dx, top: (target.top ?? 0) + snap.dy })
        target.setCoords()
      }
      setGuides(snap.guides)
    },
    [canvasRef],
  )

  const clearGuides = useCallback(() => setGuides([]), [])

  return { handleObjectMoving, clearGuides, guides }
}
