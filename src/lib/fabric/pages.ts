import { StaticCanvas, type Canvas } from 'fabric'
import { CUSTOM_PROPERTIES } from '../editor/constants'
import type { PageRecord } from '../../types/editor'

export interface PagesStateRef {
  pages: PageRecord[]
  activePageId: string | null
}

export function createPageId(): string {
  return crypto.randomUUID()
}

export function createBlankPageRecord(name: string, backgroundColor: string): PageRecord {
  return { id: createPageId(), name, backgroundColor, objects: [] }
}

/**
 * Snapshots the *live* canvas's objects/background back into the ref's
 * currently-active page. Self-healing: if nothing is tracked as active yet
 * (e.g. history/serialization used before a page was explicitly seeded),
 * creates one from whatever's currently on the canvas rather than silently
 * dropping it.
 */
export function syncActivePageFromCanvas(canvas: Canvas, ref: PagesStateRef): void {
  let active = ref.pages.find((page) => page.id === ref.activePageId)
  if (!active) {
    active = createBlankPageRecord('Page 1', '#ffffff')
    ref.pages.push(active)
    ref.activePageId = active.id
  }
  const json = canvas.toObject([...CUSTOM_PROPERTIES])
  active.objects = json.objects ?? []
  active.backgroundColor = typeof canvas.backgroundColor === 'string' ? canvas.backgroundColor : '#ffffff'
}

export async function loadPageIntoCanvas(canvas: Canvas, page: PageRecord): Promise<void> {
  canvas.clear()
  await canvas.loadFromJSON({ background: page.backgroundColor, objects: page.objects })
  canvas.requestRenderAll()
}

/** Syncs the currently-active page out, then loads `targetPageId` in and makes it active. */
export async function switchToPage(canvas: Canvas, ref: PagesStateRef, targetPageId: string): Promise<void> {
  if (ref.activePageId === targetPageId) return
  syncActivePageFromCanvas(canvas, ref)
  const target = ref.pages.find((page) => page.id === targetPageId)
  if (!target) return
  await loadPageIntoCanvas(canvas, target)
  ref.activePageId = targetPageId
}

/**
 * Renders a small preview PNG of a page's content via a short-lived offscreen
 * StaticCanvas — never touches the live canvas, and the result is a UI-only
 * cache (see usePages/PageNavigator), never persisted in the document JSON.
 */
export async function renderPageThumbnail(
  page: PageRecord,
  documentSize: { width: number; height: number },
  maxWidth = 120,
): Promise<string> {
  const scale = maxWidth / documentSize.width
  const width = documentSize.width * scale
  const height = documentSize.height * scale
  const el = document.createElement('canvas')
  const staticCanvas = new StaticCanvas(el, { width, height, backgroundColor: page.backgroundColor })
  staticCanvas.setZoom(scale)
  await staticCanvas.loadFromJSON({ objects: page.objects })
  staticCanvas.requestRenderAll()
  const dataUrl = staticCanvas.toDataURL({ format: 'png', multiplier: 1 })
  staticCanvas.dispose()
  return dataUrl
}
