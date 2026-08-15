import { describe, it, expect } from 'vitest'
import { Canvas } from 'fabric'
import { serializeDocument, deserializeDocument, DOCUMENT_VERSION } from './serialization'
import { addText } from './text'
import { tagObject } from './objects'
import { Rect } from 'fabric'

function makeCanvas(width = 400, height = 300) {
  return new Canvas(document.createElement('canvas'), { width, height, backgroundColor: '#ffffff' })
}

describe('serializeDocument', () => {
  it('captures canvas dimensions, background, and object count', () => {
    const canvas = makeCanvas(500, 400)
    addText(canvas, 'Hello world')

    const doc = serializeDocument(canvas)

    expect(doc.version).toBe(DOCUMENT_VERSION)
    expect(doc.canvas).toEqual({ width: 500, height: 400, backgroundColor: '#ffffff' })
    expect(doc.objects).toHaveLength(1)
  })

  it('preserves custom editor properties (id, name, locked) on each object', () => {
    const canvas = makeCanvas()
    const rect = tagObject(new Rect({ width: 50, height: 50 }), { name: 'My Rect', type: 'rect' })
    canvas.add(rect)

    const doc = serializeDocument(canvas)
    const serializedRect = doc.objects[0] as Record<string, unknown>

    expect(serializedRect.id).toBe(rect.id)
    expect(serializedRect.name).toBe('My Rect')
    expect(serializedRect.locked).toBe(false)
  })
})

describe('deserializeDocument', () => {
  it('round-trips a document: same object count, dimensions, and custom properties survive', async () => {
    const source = makeCanvas(600, 400)
    addText(source, 'Round trip me')
    const doc = serializeDocument(source)

    const target = makeCanvas(100, 100)
    await deserializeDocument(target, doc)

    expect(target.getWidth()).toBe(600)
    expect(target.getHeight()).toBe(400)
    expect(target.getObjects()).toHaveLength(1)

    const restoredDoc = serializeDocument(target)
    expect(restoredDoc.objects).toEqual(doc.objects)
  })

  it('replaces existing content rather than appending to it', async () => {
    const target = makeCanvas()
    addText(target, 'will be replaced')
    expect(target.getObjects()).toHaveLength(1)

    const emptyDoc = serializeDocument(makeCanvas())
    await deserializeDocument(target, emptyDoc)

    expect(target.getObjects()).toHaveLength(0)
  })
})
