import { describe, it, expect } from 'vitest'
import { Canvas, Rect } from 'fabric'
import { serializeDocument, deserializeDocument, DOCUMENT_VERSION } from './serialization'
import { addText } from './text'
import { tagObject } from './objects'
import { createBlankPageRecord, type PagesStateRef } from './pages'
import type { EditorDocument } from '../../types/editor'

function makeCanvas(width = 400, height = 300) {
  return new Canvas(document.createElement('canvas'), { width, height, backgroundColor: '#ffffff' })
}

function makePagesRef(backgroundColor = '#ffffff'): PagesStateRef {
  const page = createBlankPageRecord('Page 1', backgroundColor)
  return { pages: [page], activePageId: page.id }
}

describe('serializeDocument', () => {
  it('captures canvas dimensions and the active page objects/background', () => {
    const canvas = makeCanvas(500, 400)
    addText(canvas, 'Hello world')
    const pagesRef = makePagesRef()

    const doc = serializeDocument(canvas, pagesRef)

    expect(doc.version).toBe(DOCUMENT_VERSION)
    expect(doc.canvas).toEqual({ width: 500, height: 400 })
    expect(doc.pages).toHaveLength(1)
    expect(doc.pages[0].backgroundColor).toBe('#ffffff')
    expect(doc.pages[0].objects).toHaveLength(1)
    expect(doc.activePageId).toBe(pagesRef.activePageId)
  })

  it('preserves custom editor properties (id, name, locked) on each object', () => {
    const canvas = makeCanvas()
    const rect = tagObject(new Rect({ width: 50, height: 50 }), { name: 'My Rect', type: 'rect' })
    canvas.add(rect)
    const pagesRef = makePagesRef()

    const doc = serializeDocument(canvas, pagesRef)
    const serializedRect = doc.pages[0].objects[0] as Record<string, unknown>

    expect(serializedRect.id).toBe(rect.id)
    expect(serializedRect.name).toBe('My Rect')
    expect(serializedRect.locked).toBe(false)
  })

  it('serializes multiple pages, only the active one reflecting the live canvas', () => {
    const canvas = makeCanvas()
    addText(canvas, 'On the live canvas')
    const otherPage = createBlankPageRecord('Page 2', '#000000')
    const activePage = createBlankPageRecord('Page 1', '#ffffff')
    const pagesRef: PagesStateRef = { pages: [activePage, otherPage], activePageId: activePage.id }

    const doc = serializeDocument(canvas, pagesRef)

    expect(doc.pages).toHaveLength(2)
    expect(doc.pages.find((p) => p.id === activePage.id)?.objects).toHaveLength(1)
    expect(doc.pages.find((p) => p.id === otherPage.id)?.objects).toHaveLength(0)
  })
})

describe('deserializeDocument', () => {
  it('round-trips a document: same object count, dimensions, and custom properties survive', async () => {
    const source = makeCanvas(600, 400)
    addText(source, 'Round trip me')
    const sourcePagesRef = makePagesRef()
    const doc = serializeDocument(source, sourcePagesRef)

    const target = makeCanvas(100, 100)
    const targetPagesRef: PagesStateRef = { pages: [], activePageId: null }
    await deserializeDocument(target, targetPagesRef, doc)

    expect(target.getWidth()).toBe(600)
    expect(target.getHeight()).toBe(400)
    expect(target.getObjects()).toHaveLength(1)
    expect(targetPagesRef.pages).toHaveLength(1)
    expect(targetPagesRef.activePageId).toBe(doc.activePageId)

    const restoredDoc = serializeDocument(target, targetPagesRef)
    expect(restoredDoc.pages).toEqual(doc.pages)
  })

  it('replaces existing content rather than appending to it', async () => {
    const target = makeCanvas()
    addText(target, 'will be replaced')
    expect(target.getObjects()).toHaveLength(1)

    const emptyDoc = serializeDocument(makeCanvas(), makePagesRef())
    const targetPagesRef: PagesStateRef = { pages: [], activePageId: null }
    await deserializeDocument(target, targetPagesRef, emptyDoc)

    expect(target.getObjects()).toHaveLength(0)
  })

  it('migrates a version-1 document (flat objects, no pages) into a single page', async () => {
    const v1Document = {
      version: 1,
      canvas: { width: 300, height: 200, backgroundColor: '#123456' },
      objects: [{ type: 'Rect', width: 10, height: 10 }],
    } as unknown as EditorDocument

    const target = makeCanvas()
    const targetPagesRef: PagesStateRef = { pages: [], activePageId: null }
    await deserializeDocument(target, targetPagesRef, v1Document)

    expect(targetPagesRef.pages).toHaveLength(1)
    expect(targetPagesRef.pages[0].backgroundColor).toBe('#123456')
    expect(targetPagesRef.pages[0].objects).toHaveLength(1)
    expect(targetPagesRef.activePageId).toBe(targetPagesRef.pages[0].id)
    expect(target.getObjects()).toHaveLength(1)
  })
})
