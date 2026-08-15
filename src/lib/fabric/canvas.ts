import { Canvas } from 'fabric'
import { EDITOR_DEFAULTS } from '../editor/constants'

export function createFabricCanvas(el: HTMLCanvasElement): Canvas {
  return new Canvas(el, {
    width: EDITOR_DEFAULTS.CANVAS_WIDTH,
    height: EDITOR_DEFAULTS.CANVAS_HEIGHT,
    backgroundColor: EDITOR_DEFAULTS.CANVAS_BACKGROUND,
    preserveObjectStacking: true,
    selectionColor: 'rgba(99, 102, 241, 0.15)',
    selectionBorderColor: '#6366f1',
    selectionLineWidth: 1,
  })
}

export function disposeFabricCanvas(canvas: Canvas): void {
  canvas.dispose()
}

export function setCanvasDimensions(canvas: Canvas, width: number, height: number): void {
  canvas.setDimensions({ width, height })
  canvas.requestRenderAll()
}

export function setCanvasBackground(canvas: Canvas, color: string): void {
  canvas.backgroundColor = color
  canvas.requestRenderAll()
}

/**
 * The true logical document size, independent of the current zoom level.
 *
 * `applyCanvasZoom` (useCanvasZoom) resizes the canvas element itself to
 * `documentSize * zoom` so the artboard visually shrinks/grows to fit its
 * container — which means `canvas.getWidth()`/`getHeight()`/`getCenterPoint()`
 * return the *zoom-scaled* size, not the document size. Anything that places
 * or measures objects in document space (adding text/images/shapes at
 * "canvas center", serializing width/height) must use this instead, or it
 * ends up double-scaled by the viewport transform at any zoom other than 100%.
 */
export function getDocumentDimensions(canvas: Canvas): { width: number; height: number } {
  const zoom = canvas.getZoom() || 1
  return { width: canvas.getWidth() / zoom, height: canvas.getHeight() / zoom }
}
