import { useCallback } from 'react'
import { useEditorCanvasContext } from '../../lib/editor/EditorCanvasContext'
import { useEditorStore } from '../../stores/editor/editorStore'
import { useSelectionStore } from '../../stores/editor/selectionStore'
import { usePagesStore } from '../../stores/editor/pagesStore'
import { useEditorHistory } from './useEditorHistory'
import { switchToPage, createBlankPageRecord, syncActivePageFromCanvas, loadPageIntoCanvas } from '../../lib/fabric/pages'
import { EDITOR_DEFAULTS } from '../../lib/editor/constants'

export function usePages() {
  const { canvasRef, pagesRef, historyRef } = useEditorCanvasContext()
  const pages = usePagesStore((s) => s.pages)
  const activePageId = usePagesStore((s) => s.activePageId)
  const setPagesState = usePagesStore((s) => s.setPagesState)
  const bumpObjectsVersion = useEditorStore((s) => s.bumpObjectsVersion)
  const clearSelection = useSelectionStore((s) => s.clearSelection)
  const { pushState } = useEditorHistory()

  const syncStore = useCallback(() => {
    setPagesState(
      pagesRef.current.pages.map((page) => ({ id: page.id, name: page.name })),
      pagesRef.current.activePageId,
    )
  }, [pagesRef, setPagesState])

  // canvas.clear() + loadFromJSON (inside switchToPage/loadPageIntoCanvas)
  // fire object:added/object:removed per object *while `activePageId` still
  // points at the outgoing page* — CanvasEditor's listeners would otherwise
  // turn those into pushState() calls that attribute the transitional,
  // half-swapped canvas content to the wrong page. Guarding with the same
  // `historyRef.isRestoring` flag useEditorHistory.restore() uses for
  // undo/redo suppresses that, and callers resync derived state once after.
  const switchPage = useCallback(
    async (id: string) => {
      const canvas = canvasRef.current
      if (!canvas) return
      historyRef.current.isRestoring = true
      try {
        await switchToPage(canvas, pagesRef.current, id)
      } finally {
        historyRef.current.isRestoring = false
      }
      syncStore()
      clearSelection()
      bumpObjectsVersion()
    },
    [canvasRef, pagesRef, historyRef, syncStore, clearSelection, bumpObjectsVersion],
  )

  const addPage = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    syncActivePageFromCanvas(canvas, pagesRef.current)
    const page = createBlankPageRecord(`Page ${pagesRef.current.pages.length + 1}`, EDITOR_DEFAULTS.CANVAS_BACKGROUND)
    pagesRef.current.pages.push(page)
    await switchPage(page.id)
    pushState()
  }, [canvasRef, pagesRef, switchPage, pushState])

  const duplicatePage = useCallback(
    async (id: string) => {
      const canvas = canvasRef.current
      if (!canvas) return
      syncActivePageFromCanvas(canvas, pagesRef.current)
      const source = pagesRef.current.pages.find((page) => page.id === id)
      if (!source) return
      const index = pagesRef.current.pages.indexOf(source)
      const copy = createBlankPageRecord(`${source.name} copy`, source.backgroundColor)
      copy.objects = JSON.parse(JSON.stringify(source.objects))
      pagesRef.current.pages.splice(index + 1, 0, copy)
      await switchPage(copy.id)
      pushState()
    },
    [canvasRef, pagesRef, switchPage, pushState],
  )

  const removePage = useCallback(
    async (id: string) => {
      const canvas = canvasRef.current
      if (!canvas || pagesRef.current.pages.length <= 1) return
      const index = pagesRef.current.pages.findIndex((page) => page.id === id)
      if (index === -1) return
      const wasActive = pagesRef.current.activePageId === id
      pagesRef.current.pages.splice(index, 1)

      if (wasActive) {
        const nextActive = pagesRef.current.pages[Math.max(0, index - 1)]
        pagesRef.current.activePageId = nextActive.id
        historyRef.current.isRestoring = true
        try {
          await loadPageIntoCanvas(canvas, nextActive)
        } finally {
          historyRef.current.isRestoring = false
        }
        clearSelection()
        bumpObjectsVersion()
      }
      syncStore()
      pushState()
    },
    [canvasRef, pagesRef, historyRef, syncStore, clearSelection, bumpObjectsVersion, pushState],
  )

  const renamePage = useCallback(
    (id: string, name: string) => {
      const page = pagesRef.current.pages.find((p) => p.id === id)
      if (!page || !name.trim()) return
      page.name = name.trim()
      syncStore()
      pushState()
    },
    [pagesRef, syncStore, pushState],
  )

  const reorderPage = useCallback(
    (id: string, direction: 'earlier' | 'later') => {
      const list = pagesRef.current.pages
      const index = list.findIndex((page) => page.id === id)
      const targetIndex = direction === 'earlier' ? index - 1 : index + 1
      if (index === -1 || targetIndex < 0 || targetIndex >= list.length) return
      const [moved] = list.splice(index, 1)
      list.splice(targetIndex, 0, moved)
      syncStore()
      pushState()
    },
    [pagesRef, syncStore, pushState],
  )

  return { pages, activePageId, switchPage, addPage, duplicatePage, removePage, renamePage, reorderPage }
}
