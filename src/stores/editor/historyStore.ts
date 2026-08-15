import { create } from 'zustand'

interface HistoryState {
  canUndo: boolean
  canRedo: boolean
  setHistoryFlags: (flags: { canUndo: boolean; canRedo: boolean }) => void
}

export const useHistoryStore = create<HistoryState>((set) => ({
  canUndo: false,
  canRedo: false,
  setHistoryFlags: (flags) => set(flags),
}))
