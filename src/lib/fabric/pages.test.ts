import { describe, it, expect } from 'vitest'
import { Canvas, Rect } from 'fabric'
import {
  createBlankPageRecord,
  syncActivePageFromCanvas,
  loadPageIntoCanvas,
  switchToPage,
  type PagesStateRef,
} from './pages'
import { tagObject } from './objects'

function makeCanvas(width = 400, height = 300) {
  return new Canvas(document.createElement('canvas'), { width, height, backgroundColor: '#ffffff' })
}

describe('createBlankPageRecord', () => {
  it('creates an empty page with a unique id', () => {
    const a = createBlankPageRecord('Page 1', '#ffffff')
    const b = createBlankPageRecord('Page 2', '#000000')
    expect(a.id).not.toBe(b.id)
    expect(a.objects).toEqual([])
    expect(a.name).toBe('Page 1')
    expect(a.backgroundColor).toBe('#ffffff')
  })
})

describe('syncActivePageFromCanvas', () => {
  it('captures the live canvas objects/background into the active page', () => {
    const canvas = makeCanvas()
    canvas.backgroundColor = '#ff0000'
    canvas.add(tagObject(new Rect({ width: 10, height: 10 }), { name: 'A', type: 'rect' }))
    const page = createBlankPageRecord('Page 1', '#ffffff')
    const ref: PagesStateRef = { pages: [page], activePageId: page.id }

    syncActivePageFromCanvas(canvas, ref)

    expect(page.objects).toHaveLength(1)
    expect(page.backgroundColor).toBe('#ff0000')
  })

  it('self-heals by creating a page from the live canvas when none is tracked as active', () => {
    const canvas = makeCanvas()
    canvas.add(tagObject(new Rect({ width: 10, height: 10 }), { name: 'A', type: 'rect' }))
    const ref: PagesStateRef = { pages: [], activePageId: null }

    syncActivePageFromCanvas(canvas, ref)

    expect(ref.pages).toHaveLength(1)
    expect(ref.activePageId).toBe(ref.pages[0].id)
    expect(ref.pages[0].objects).toHaveLength(1)
  })
})

describe('switchToPage', () => {
  it('round-trips two pages worth of distinct objects across a switch and back', async () => {
    const canvas = makeCanvas()
    canvas.add(tagObject(new Rect({ width: 10, height: 10, fill: 'red' }), { name: 'PageA rect', type: 'rect' }))
    const pageA = createBlankPageRecord('Page A', '#ffffff')
    const pageB = createBlankPageRecord('Page B', '#000000')
    const ref: PagesStateRef = { pages: [pageA, pageB], activePageId: pageA.id }

    await switchToPage(canvas, ref, pageB.id)

    expect(ref.activePageId).toBe(pageB.id)
    expect(pageA.objects).toHaveLength(1) // synced out before leaving
    expect(canvas.getObjects()).toHaveLength(0) // page B started empty

    canvas.add(tagObject(new Rect({ width: 20, height: 20, fill: 'blue' }), { name: 'PageB rect', type: 'rect' }))
    await switchToPage(canvas, ref, pageA.id)

    expect(ref.activePageId).toBe(pageA.id)
    expect(canvas.getObjects()).toHaveLength(1)
    expect((canvas.getObjects()[0] as unknown as { fill: string }).fill).toBe('red')
    expect(pageB.objects).toHaveLength(1) // page B's edit was synced out too
  })

  it('is a no-op when switching to the already-active page', async () => {
    const canvas = makeCanvas()
    const page = createBlankPageRecord('Page 1', '#ffffff')
    const ref: PagesStateRef = { pages: [page], activePageId: page.id }
    canvas.add(tagObject(new Rect({ width: 10, height: 10 }), { name: 'A', type: 'rect' }))

    await switchToPage(canvas, ref, page.id)

    // Unsynced — a real no-op returns before syncActivePageFromCanvas runs.
    expect(page.objects).toEqual([])
    expect(canvas.getObjects()).toHaveLength(1)
  })
})

describe('loadPageIntoCanvas', () => {
  it('replaces canvas content and background with the given page', async () => {
    const canvas = makeCanvas()
    canvas.add(tagObject(new Rect({ width: 10, height: 10 }), { name: 'old', type: 'rect' }))
    const page = createBlankPageRecord('Page 1', '#123456')

    await loadPageIntoCanvas(canvas, page)

    expect(canvas.getObjects()).toHaveLength(0)
    expect(canvas.backgroundColor).toBe('#123456')
  })
})
