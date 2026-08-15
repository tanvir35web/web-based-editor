import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useCanvasZoom } from './useCanvasZoom'
import { useEditorCanvasContext } from '../../lib/editor/EditorCanvasContext'
import { useCanvasStore } from '../../stores/editor/canvasStore'
import { useEditorStore } from '../../stores/editor/editorStore'
import { EDITOR_DEFAULTS } from '../../lib/editor/constants'
import { CanvasTestProvider } from '../../test/canvasTestHarness'

function useTestSubject() {
  return { zoom: useCanvasZoom(), ctx: useEditorCanvasContext() }
}

async function renderReady() {
  const view = renderHook(() => useTestSubject(), { wrapper: CanvasTestProvider })
  await waitFor(() => expect(view.result.current.ctx.isReady).toBe(true))
  return view
}

beforeEach(() => {
  useCanvasStore.setState({ zoom: 1 })
  useEditorStore.setState({ documentWidth: EDITOR_DEFAULTS.CANVAS_WIDTH, documentHeight: EDITOR_DEFAULTS.CANVAS_HEIGHT })
})

describe('useCanvasZoom', () => {
  it('starts at 100% zoom', async () => {
    const { result } = await renderReady()
    expect(result.current.zoom.zoom).toBe(1)
  })

  it('zoomIn increases zoom by the configured step', async () => {
    const { result } = await renderReady()
    act(() => result.current.zoom.zoomIn())
    expect(result.current.zoom.zoom).toBeCloseTo(1 + EDITOR_DEFAULTS.ZOOM_STEP)
  })

  it('zoomOut decreases zoom by the configured step', async () => {
    const { result } = await renderReady()
    act(() => result.current.zoom.zoomOut())
    expect(result.current.zoom.zoom).toBeCloseTo(1 - EDITOR_DEFAULTS.ZOOM_STEP)
  })

  it('never zooms below the configured minimum', async () => {
    const { result } = await renderReady()
    act(() => result.current.zoom.setZoom(0))
    expect(result.current.zoom.zoom).toBe(EDITOR_DEFAULTS.MIN_ZOOM)
  })

  it('never zooms above the configured maximum', async () => {
    const { result } = await renderReady()
    act(() => result.current.zoom.setZoom(100))
    expect(result.current.zoom.zoom).toBe(EDITOR_DEFAULTS.MAX_ZOOM)
  })

  it('zoomToActual resets zoom to 100%', async () => {
    const { result } = await renderReady()
    act(() => result.current.zoom.setZoom(2))
    act(() => result.current.zoom.zoomToActual())
    expect(result.current.zoom.zoom).toBe(1)
  })

  it('setZoom keeps canvas zoom and dimensions in sync (independent of object scale)', async () => {
    const { result } = await renderReady()
    act(() => result.current.zoom.setZoom(0.5))

    const canvas = result.current.ctx.canvasRef.current!
    expect(canvas.getZoom()).toBe(0.5)
    expect(canvas.getWidth()).toBe(EDITOR_DEFAULTS.CANVAS_WIDTH * 0.5)
    expect(canvas.getHeight()).toBe(EDITOR_DEFAULTS.CANVAS_HEIGHT * 0.5)
  })
})
