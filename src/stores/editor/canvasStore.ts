import { create } from 'zustand'
import { EDITOR_DEFAULTS } from '../../lib/editor/constants'
import type { CanvasBackground } from '../../types/canvas'

interface CanvasState {
  zoom: number
  background: CanvasBackground
  setZoom: (zoom: number) => void
  setBackground: (background: CanvasBackground) => void
}

export const useCanvasStore = create<CanvasState>((set) => ({
  zoom: 1,
  background: { mode: 'white', color: EDITOR_DEFAULTS.CANVAS_BACKGROUND },
  setZoom: (zoom) =>
    set({ zoom: Math.min(EDITOR_DEFAULTS.MAX_ZOOM, Math.max(EDITOR_DEFAULTS.MIN_ZOOM, zoom)) }),
  setBackground: (background) => set({ background }),
}))
