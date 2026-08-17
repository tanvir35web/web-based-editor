import { Textbox, type Canvas } from 'fabric'
import { createDefaultTextProps } from '../editor/defaults'
import type { TextObjectProps } from '../../types/objects'
import { tagObject, type EditorFabricObject } from './objects'
import { getDocumentDimensions } from './canvas'
import { fillValueToFabricFill, fabricFillToFillValue } from './fill'

const DEFAULT_TEXT_WIDTH = 320
const DEFAULT_TEXT_HEIGHT = 40

export function addText(canvas: Canvas, text = 'Type something...'): EditorFabricObject {
  const props = createDefaultTextProps()
  // Document space, not `canvas.getCenterPoint()` — see getDocumentDimensions.
  const { width: docWidth, height: docHeight } = getDocumentDimensions(canvas)
  const center = { x: docWidth / 2, y: docHeight / 2 }
  const textbox = new Textbox(text, {
    left: center.x,
    top: center.y,
    originX: 'center',
    originY: 'center',
    width: DEFAULT_TEXT_WIDTH,
    fontFamily: props.fontFamily,
    fontSize: props.fontSize,
    fontWeight: props.fontWeight,
    fontStyle: props.fontStyle,
    underline: props.underline,
    linethrough: props.linethrough,
    fill: fillValueToFabricFill(props.fill, { width: DEFAULT_TEXT_WIDTH, height: DEFAULT_TEXT_HEIGHT }),
    opacity: props.opacity / 100,
    charSpacing: props.charSpacing,
    lineHeight: props.lineHeight,
    textAlign: props.textAlign,
  })
  const editorObject = tagObject(textbox, { name: 'Text', type: 'textbox' })
  canvas.add(editorObject)
  canvas.setActiveObject(editorObject)
  canvas.requestRenderAll()
  return editorObject
}

export function getTextProps(textbox: Textbox): TextObjectProps {
  return {
    fontFamily: textbox.fontFamily ?? 'Inter',
    fontSize: textbox.fontSize ?? 32,
    fontWeight: Number(textbox.fontWeight) || 400,
    fontStyle: (textbox.fontStyle as TextObjectProps['fontStyle']) ?? 'normal',
    underline: textbox.underline ?? false,
    linethrough: textbox.linethrough ?? false,
    fill: fabricFillToFillValue(textbox.fill),
    backgroundColor: textbox.backgroundColor || 'transparent',
    opacity: Math.round((textbox.opacity ?? 1) * 100),
    charSpacing: textbox.charSpacing ?? 0,
    lineHeight: textbox.lineHeight ?? 1.16,
    textAlign: (textbox.textAlign as TextObjectProps['textAlign']) ?? 'left',
  }
}

export function updateTextProps(canvas: Canvas, textbox: Textbox, updates: Partial<TextObjectProps>): void {
  const patch: Record<string, unknown> = { ...updates }
  if (updates.fill !== undefined) {
    patch.fill = fillValueToFabricFill(updates.fill, { width: textbox.width ?? 0, height: textbox.height ?? 0 })
  }
  if (updates.opacity !== undefined) patch.opacity = updates.opacity / 100
  if (updates.backgroundColor !== undefined && updates.backgroundColor !== 'transparent') {
    patch.backgroundColor = updates.backgroundColor
  } else if (updates.backgroundColor === 'transparent') {
    patch.backgroundColor = ''
  }
  textbox.set(patch)
  textbox.setCoords()
  canvas.requestRenderAll()
}
