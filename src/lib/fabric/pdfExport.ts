import type { Canvas } from 'fabric'
import { getDocumentDimensions } from './canvas'
import { loadPageIntoCanvas, syncActivePageFromCanvas, type PagesStateRef } from './pages'

/**
 * `jspdf` is loaded via a dynamic import, not a static top-level one, so it
 * doesn't bloat the main bundle for users who never export a PDF.
 *
 * Iterates every page onto the *same* live canvas in turn (reusing
 * loadPageIntoCanvas, the same mechanism page-switching uses) rather than
 * spinning up N offscreen canvases, then restores whichever page was
 * originally active when done.
 */
export async function exportDocumentToPDF(canvas: Canvas, pagesRef: PagesStateRef): Promise<Blob> {
  const { jsPDF } = await import('jspdf')

  syncActivePageFromCanvas(canvas, pagesRef)
  const { width, height } = getDocumentDimensions(canvas)
  const orientation = width >= height ? 'landscape' : 'portrait'
  const pdf = new jsPDF({ orientation, unit: 'px', format: [width, height] })

  const originalActiveId = pagesRef.activePageId
  const zoom = canvas.getZoom() || 1

  for (let i = 0; i < pagesRef.pages.length; i++) {
    const page = pagesRef.pages[i]
    await loadPageIntoCanvas(canvas, page)
    const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 1 / zoom })
    if (i > 0) pdf.addPage([width, height], orientation)
    pdf.addImage(dataUrl, 'PNG', 0, 0, width, height)
  }

  const originalPage = pagesRef.pages.find((page) => page.id === originalActiveId)
  if (originalPage) {
    await loadPageIntoCanvas(canvas, originalPage)
    pagesRef.activePageId = originalPage.id
  }

  return pdf.output('blob')
}
