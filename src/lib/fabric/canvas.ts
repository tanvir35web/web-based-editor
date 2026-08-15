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
