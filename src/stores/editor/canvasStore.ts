import { create } from 'zustand'
import { EDITOR_DEFAULTS } from '../../lib/editor/constants'
import type { CanvasBackground } from '../../types/canvas'
import type { SnappingSettings } from '../../lib/fabric/snapping'

interface CanvasState {
  zoom: number
  background: CanvasBackground
  snapping: SnappingSettings
  setZoom: (zoom: number) => void
  setBackground: (background: CanvasBackground) => void
  setSnapping: (patch: Partial<SnappingSettings>) => void
}

export const useCanvasStore = create<CanvasState>((set) => ({
  zoom: 1,
  background: { mode: 'white', color: EDITOR_DEFAULTS.CANVAS_BACKGROUND },
  snapping: { enabled: true, snapToObjects: true, snapToGrid: false, gridSize: 20, threshold: 8 },
  setZoom: (zoom) =>
    set({ zoom: Math.min(EDITOR_DEFAULTS.MAX_ZOOM, Math.max(EDITOR_DEFAULTS.MIN_ZOOM, zoom)) }),
  setBackground: (background) => set({ background }),
  setSnapping: (patch) => set((state) => ({ snapping: { ...state.snapping, ...patch } })),
}))
