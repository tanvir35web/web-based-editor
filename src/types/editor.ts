import type { EditorObjectMeta } from './objects'

/** One page/artboard's content — the unit that gets swapped onto the live Fabric canvas. */
export interface PageRecord {
  id: string
  name: string
  backgroundColor: string
  /** Fabric's serialized objects for this page (same shape canvas.toObject().objects already produces). */
  objects: unknown[]
}

/** Serializable editor document — the persistence boundary for save/load and future server sync. */
export interface EditorDocument {
  version: number
  canvas: {
    width: number
    height: number
    /** @deprecated version-1 documents only — background is now per-page (PageRecord.backgroundColor). */
    backgroundColor?: string
  }
  pages: PageRecord[]
  activePageId: string | null
  /** @deprecated version-1 documents only — migrated into a single page on load, see deserializeDocument. */
  objects?: unknown[]
}

export type EditorTool = 'select' | 'upload' | 'text' | 'shapes' | 'draw' | 'pen' | 'image' | 'layers' | 'background'

export interface SelectionInfo {
  ids: string[]
  type: 'none' | 'single' | 'multiple'
  objectType: EditorObjectMeta['type'] | null
}
