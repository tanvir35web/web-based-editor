import { create } from 'zustand'

export interface PageListItem {
  id: string
  name: string
}

interface PagesState {
  pages: PageListItem[]
  activePageId: string | null
  setPagesState: (pages: PageListItem[], activePageId: string | null) => void
}

/**
 * Thin reactive mirror of EditorCanvasContext's `pagesRef` — the ref holds
 * the actual per-page serialized objects (heavy, not meant to trigger
 * re-renders), this store holds just enough (id + name list, active id) for
 * the page navigator UI. Manually re-synced after every pagesRef mutation,
 * the same pattern useEditorHistory's syncFlags() already uses for
 * historyRef -> historyStore.
 */
export const usePagesStore = create<PagesState>((set) => ({
  pages: [],
  activePageId: null,
  setPagesState: (pages, activePageId) => set({ pages, activePageId }),
}))
