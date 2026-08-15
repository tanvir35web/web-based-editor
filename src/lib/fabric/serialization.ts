import type { Canvas } from 'fabric'
import type { EditorDocument } from '../../types/editor'
import { getDocumentDimensions } from './canvas'

export const DOCUMENT_VERSION = 1

/** Custom properties Fabric must round-trip through toObject/loadFromJSON. */
export const CUSTOM_PROPERTIES = ['id', 'name', 'locked', 'editorType', 'adjustments'] as const

export function serializeDocument(canvas: Canvas): EditorDocument {
  const json = canvas.toObject([...CUSTOM_PROPERTIES])
  const { width, height } = getDocumentDimensions(canvas)
  return {
    version: DOCUMENT_VERSION,
    canvas: {
      width,
      height,
      backgroundColor: typeof canvas.backgroundColor === 'string' ? canvas.backgroundColor : '#ffffff',
    },
    objects: json.objects ?? [],
  }
}

export async function deserializeDocument(canvas: Canvas, document: EditorDocument): Promise<void> {
  // The canvas element's pixel size must stay `documentSize * currentZoom`
  // (see getDocumentDimensions) — zoom is a viewport/UI concern tracked
  // separately from the document, so it isn't part of what's restored here.
  const zoom = canvas.getZoom() || 1
  canvas.setDimensions({ width: document.canvas.width * zoom, height: document.canvas.height * zoom })
  await canvas.loadFromJSON({
    background: document.canvas.backgroundColor,
    objects: document.objects,
  })
  canvas.requestRenderAll()
}
