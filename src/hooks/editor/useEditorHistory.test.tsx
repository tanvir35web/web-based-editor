import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { Rect } from 'fabric'
import { useEditorHistory } from './useEditorHistory'
import { useEditorCanvasContext } from '../../lib/editor/EditorCanvasContext'
import { useHistoryStore } from '../../stores/editor/historyStore'
import { CanvasTestProvider } from '../../test/canvasTestHarness'
import { tagObject } from '../../lib/fabric/objects'

function useTestSubject() {
  return { history: useEditorHistory(), ctx: useEditorCanvasContext() }
}

// historyStore is a module-level singleton — reset it between tests since
// each test mounts a fresh canvas/history stack but shares the same store.
beforeEach(() => {
  useHistoryStore.setState({ canUndo: false, canRedo: false })
})

async function renderReady() {
  const view = renderHook(() => useTestSubject(), { wrapper: CanvasTestProvider })
  await waitFor(() => expect(view.result.current.ctx.isReady).toBe(true))
  return view
}

describe('useEditorHistory', () => {
  it('starts with nothing to undo or redo', async () => {
    const { result } = await renderReady()
    expect(result.current.history.canUndo).toBe(false)
    expect(result.current.history.canRedo).toBe(false)
  })

  it('initHistory seeds a baseline snapshot so the first change becomes undoable', async () => {
    const { result } = await renderReady()

    act(() => result.current.history.initHistory())
    expect(result.current.history.canUndo).toBe(false)

    act(() => {
      const canvas = result.current.ctx.canvasRef.current!
      canvas.add(tagObject(new Rect({ width: 10, height: 10 }), { name: 'A', type: 'rect' }))
      result.current.history.pushState()
    })

    expect(result.current.history.canUndo).toBe(true)
    expect(result.current.history.canRedo).toBe(false)
  })

  it('undo restores the previous snapshot and enables redo', async () => {
    const { result } = await renderReady()
    act(() => result.current.history.initHistory())

    act(() => {
      const canvas = result.current.ctx.canvasRef.current!
      canvas.add(tagObject(new Rect({ width: 10, height: 10 }), { name: 'A', type: 'rect' }))
      result.current.history.pushState()
    })
    expect(result.current.ctx.canvasRef.current!.getObjects()).toHaveLength(1)

    await act(async () => {
      await result.current.history.undo()
    })

    expect(result.current.ctx.canvasRef.current!.getObjects()).toHaveLength(0)
    expect(result.current.history.canUndo).toBe(false)
    expect(result.current.history.canRedo).toBe(true)
  })

  it('redo re-applies the change that was just undone', async () => {
    const { result } = await renderReady()
    act(() => result.current.history.initHistory())
    act(() => {
      const canvas = result.current.ctx.canvasRef.current!
      canvas.add(tagObject(new Rect({ width: 10, height: 10 }), { name: 'A', type: 'rect' }))
      result.current.history.pushState()
    })

    await act(async () => {
      await result.current.history.undo()
    })
    await act(async () => {
      await result.current.history.redo()
    })

    expect(result.current.ctx.canvasRef.current!.getObjects()).toHaveLength(1)
    expect(result.current.history.canRedo).toBe(false)
  })

  it('pushing a new state after an undo discards the redo branch', async () => {
    const { result } = await renderReady()
    act(() => result.current.history.initHistory())
    act(() => {
      const canvas = result.current.ctx.canvasRef.current!
      canvas.add(tagObject(new Rect({ width: 10, height: 10 }), { name: 'A', type: 'rect' }))
      result.current.history.pushState()
    })
    await act(async () => {
      await result.current.history.undo()
    })
    expect(result.current.history.canRedo).toBe(true)

    act(() => {
      const canvas = result.current.ctx.canvasRef.current!
      canvas.add(tagObject(new Rect({ width: 20, height: 20 }), { name: 'B', type: 'rect' }))
      result.current.history.pushState()
    })

    expect(result.current.history.canRedo).toBe(false)
  })
})
