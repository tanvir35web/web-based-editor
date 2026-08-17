import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const MAX_RECENT_COLORS = 12

interface PaletteState {
  savedColors: string[]
  recentColors: string[]
  addSavedColor: (hex: string) => void
  removeSavedColor: (hex: string) => void
  pushRecentColor: (hex: string) => void
}

/**
 * Global, browser-scoped (localStorage) — not embedded per-document. A
 * personal swatch/recent-colors set is expected to travel across documents,
 * unlike everything else in `stores/editor/*` which mirrors live canvas
 * state and is deliberately never persisted.
 */
export const usePaletteStore = create<PaletteState>()(
  persist(
    (set) => ({
      savedColors: [],
      recentColors: [],
      addSavedColor: (hex) =>
        set((state) => (state.savedColors.includes(hex) ? state : { savedColors: [...state.savedColors, hex] })),
      removeSavedColor: (hex) => set((state) => ({ savedColors: state.savedColors.filter((c) => c !== hex) })),
      pushRecentColor: (hex) =>
        set((state) => ({
          recentColors: [hex, ...state.recentColors.filter((c) => c !== hex)].slice(0, MAX_RECENT_COLORS),
        })),
    }),
    { name: 'artboard-editor:palette' },
  ),
)
