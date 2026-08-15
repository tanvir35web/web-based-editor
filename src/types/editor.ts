import type { EditorObjectMeta } from './objects'

/** Serializable editor document — the persistence boundary for save/load and future server sync. */
export interface EditorDocument {
  version: number
  canvas: {
    width: number
    height: number
    backgroundColor: string
  }
  objects: unknown[]
}

export type EditorTool = 'select' | 'upload' | 'text' | 'shapes' | 'image' | 'layers' | 'background'

export interface SelectionInfo {
  ids: string[]
  type: 'none' | 'single' | 'multiple'
  objectType: EditorObjectMeta['type'] | null
}
