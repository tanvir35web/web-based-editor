import type { Canvas } from 'fabric'
import type { EditorDocument, PageRecord } from '../../types/editor'
import { getDocumentDimensions } from './canvas'
import { syncActivePageFromCanvas, loadPageIntoCanvas, createBlankPageRecord, type PagesStateRef } from './pages'

export const DOCUMENT_VERSION = 2

export function serializeDocument(canvas: Canvas, pagesRef: PagesStateRef): EditorDocument {
  syncActivePageFromCanvas(canvas, pagesRef)
  const { width, height } = getDocumentDimensions(canvas)
  return {
    version: DOCUMENT_VERSION,
    canvas: { width, height },
    pages: pagesRef.pages,
    activePageId: pagesRef.activePageId,
  }
}

/** Migrates a version-1 document (flat `objects`, no `pages`) into a single page. */
function migrateToPages(document: EditorDocument): { pages: PageRecord[]; activePageId: string } {
  const page = createBlankPageRecord('Page 1', document.canvas.backgroundColor ?? '#ffffff')
  page.objects = document.objects ?? []
  return { pages: [page], activePageId: page.id }
}

export async function deserializeDocument(canvas: Canvas, pagesRef: PagesStateRef, document: EditorDocument): Promise<void> {
  const { pages, activePageId } =
    document.pages && document.pages.length > 0
      ? { pages: document.pages, activePageId: document.activePageId ?? document.pages[0].id }
      : migrateToPages(document)

  pagesRef.pages = pages
  pagesRef.activePageId = activePageId

  // The canvas element's pixel size must stay `documentSize * currentZoom`
  // (see getDocumentDimensions) — zoom is a viewport/UI concern tracked
  // separately from the document, so it isn't part of what's restored here.
  const zoom = canvas.getZoom() || 1
  canvas.setDimensions({ width: document.canvas.width * zoom, height: document.canvas.height * zoom })

  const activePage = pages.find((page) => page.id === activePageId) ?? pages[0]
  await loadPageIntoCanvas(canvas, activePage)
}
