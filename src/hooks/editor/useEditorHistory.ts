import { useCallback, useRef } from 'react'
import { useEditorCanvasContext } from '../../lib/editor/EditorCanvasContext'
import { useHistoryStore } from '../../stores/editor/historyStore'
import { useEditorStore } from '../../stores/editor/editorStore'
import { useSelectionStore } from '../../stores/editor/selectionStore'
import { usePagesStore } from '../../stores/editor/pagesStore'
import { serializeDocument, deserializeDocument } from '../../lib/fabric/serialization'
import { EDITOR_DEFAULTS } from '../../lib/editor/constants'

/**
 * Undo/redo backed by a single snapshot array + cursor (not two stacks) so
 * redo history is simply "everything after the cursor" and gets truncated
 * naturally whenever a new state is pushed after an undo. The stack itself
 * lives on `historyRef` in EditorCanvasContext — shared across every call
 * site of this hook — so history isn't fragmented per-component.
 *
 * Snapshots capture the *whole* multi-page document (via serializeDocument),
 * not just the active page, so undo/redo can reverse a page add/delete/
 * reorder or an edit on any page — not only the currently active one.
 */
export function useEditorHistory() {
  const { canvasRef, historyRef, pagesRef } = useEditorCanvasContext()
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const canUndo = useHistoryStore((s) => s.canUndo)
  const canRedo = useHistoryStore((s) => s.canRedo)
  const setHistoryFlags = useHistoryStore((s) => s.setHistoryFlags)
  const bumpObjectsVersion = useEditorStore((s) => s.bumpObjectsVersion)
  const clearSelection = useSelectionStore((s) => s.clearSelection)
  const setPagesState = usePagesStore((s) => s.setPagesState)

  const syncFlags = useCallback(() => {
    const history = historyRef.current
    setHistoryFlags({
      canUndo: history.cursor > 0,
      canRedo: history.cursor < history.snapshots.length - 1,
    })
  }, [historyRef, setHistoryFlags])

  const pushState = useCallback(() => {
    const canvas = canvasRef.current
    const history = historyRef.current
    if (!canvas || history.isRestoring) return
    const snapshot = JSON.stringify(serializeDocument(canvas, pagesRef.current))
    history.snapshots = history.snapshots.slice(0, history.cursor + 1)
    history.snapshots.push(snapshot)
    if (history.snapshots.length > EDITOR_DEFAULTS.MAX_HISTORY_LENGTH) {
      history.snapshots.shift()
    }
    history.cursor = history.snapshots.length - 1
    syncFlags()
  }, [canvasRef, historyRef, pagesRef, syncFlags])

  const commitHistory = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(pushState, EDITOR_DEFAULTS.HISTORY_COMMIT_DEBOUNCE_MS)
  }, [pushState])

  const restore = useCallback(
    async (snapshot: string) => {
      const canvas = canvasRef.current
      const history = historyRef.current
      if (!canvas) return
      history.isRestoring = true
      try {
        await deserializeDocument(canvas, pagesRef.current, JSON.parse(snapshot))
      } finally {
        history.isRestoring = false
      }
      // Object events were suppressed during the restore — resync derived state once now.
      setPagesState(
        pagesRef.current.pages.map((page) => ({ id: page.id, name: page.name })),
        pagesRef.current.activePageId,
      )
      clearSelection()
      bumpObjectsVersion()
    },
    [canvasRef, historyRef, pagesRef, clearSelection, bumpObjectsVersion, setPagesState],
  )

  const undo = useCallback(async () => {
    const history = historyRef.current
    if (history.cursor <= 0) return
    history.cursor -= 1
    await restore(history.snapshots[history.cursor])
    syncFlags()
  }, [historyRef, restore, syncFlags])

  const redo = useCallback(async () => {
    const history = historyRef.current
    if (history.cursor >= history.snapshots.length - 1) return
    history.cursor += 1
    await restore(history.snapshots[history.cursor])
    syncFlags()
  }, [historyRef, restore, syncFlags])

  const clearHistory = useCallback(() => {
    historyRef.current.snapshots = []
    historyRef.current.cursor = -1
    syncFlags()
  }, [historyRef, syncFlags])

  const initHistory = useCallback(() => {
    clearHistory()
    pushState()
  }, [clearHistory, pushState])

  return { undo, redo, pushState, commitHistory, clearHistory, initHistory, canUndo, canRedo }
}
