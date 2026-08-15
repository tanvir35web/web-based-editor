import { create } from 'zustand'
import type { SelectionInfo } from '../../types/editor'

interface SelectionState extends SelectionInfo {
  version: number
  setSelection: (info: SelectionInfo) => void
  clearSelection: () => void
}

const emptySelection: SelectionInfo = { ids: [], type: 'none', objectType: null }

export const useSelectionStore = create<SelectionState>((set) => ({
  ...emptySelection,
  version: 0,
  setSelection: (info) => set((state) => ({ ...info, version: state.version + 1 })),
  clearSelection: () => set((state) => ({ ...emptySelection, version: state.version + 1 })),
}))
