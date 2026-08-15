import type { Canvas } from 'fabric'
import type { EditorDocument } from '../../types/editor'

export const DOCUMENT_VERSION = 1

/** Custom properties Fabric must round-trip through toObject/loadFromJSON. */
export const CUSTOM_PROPERTIES = ['id', 'name', 'locked', 'editorType', 'adjustments'] as const

export function serializeDocument(canvas: Canvas): EditorDocument {
  const json = canvas.toObject([...CUSTOM_PROPERTIES])
  return {
    version: DOCUMENT_VERSION,
    canvas: {
      width: canvas.getWidth(),
      height: canvas.getHeight(),
      backgroundColor: typeof canvas.backgroundColor === 'string' ? canvas.backgroundColor : '#ffffff',
    },
    objects: json.objects ?? [],
  }
}

export async function deserializeDocument(canvas: Canvas, document: EditorDocument): Promise<void> {
  canvas.setDimensions({ width: document.canvas.width, height: document.canvas.height })
  await canvas.loadFromJSON({
    background: document.canvas.backgroundColor,
    objects: document.objects,
  })
  canvas.requestRenderAll()
}
