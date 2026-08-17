import { useCallback } from 'react'
import { useEditorCanvasContext } from '../../lib/editor/EditorCanvasContext'
import { useEditorStore } from '../../stores/editor/editorStore'
import { useCanvasStore } from '../../stores/editor/canvasStore'
import { usePagesStore } from '../../stores/editor/pagesStore'
import { useEditorHistory } from './useEditorHistory'
import { useCanvasZoom } from './useCanvasZoom'
import { setCanvasDimensions, setCanvasBackground } from '../../lib/fabric/canvas'
import { createBlankPageRecord } from '../../lib/fabric/pages'
import { addImageFromUrl } from '../../lib/fabric/images'
import { validateImageFile } from '../../lib/editor/validation'
import { EDITOR_DEFAULTS } from '../../lib/editor/constants'
import type { NewDocumentOptions } from '../../types/canvas'

export function useDocumentActions() {
  const { canvasRef, pagesRef } = useEditorCanvasContext()
  const setDocumentCreated = useEditorStore((s) => s.setDocumentCreated)
  const setLoading = useEditorStore((s) => s.setLoading)
  const setError = useEditorStore((s) => s.setError)
  const setBackground = useCanvasStore((s) => s.setBackground)
  const setPagesState = usePagesStore((s) => s.setPagesState)
  const { initHistory } = useEditorHistory()
  const { zoomToFit } = useCanvasZoom()

  const createBlankDocument = useCallback(
    (options: NewDocumentOptions) => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.clear()
      setCanvasDimensions(canvas, options.width, options.height)
      setCanvasBackground(canvas, options.backgroundColor)
      setBackground({ mode: options.backgroundColor === 'transparent' ? 'transparent' : 'custom', color: options.backgroundColor })

      const page = createBlankPageRecord('Page 1', options.backgroundColor)
      pagesRef.current.pages = [page]
      pagesRef.current.activePageId = page.id
      setPagesState([{ id: page.id, name: page.name }], page.id)

      setDocumentCreated(options.width, options.height)
      initHistory()
      requestAnimationFrame(zoomToFit)
    },
    [canvasRef, pagesRef, setBackground, setPagesState, setDocumentCreated, initHistory, zoomToFit],
  )

  const addImageToDocument = useCallback(
    async (file: File) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const validation = validateImageFile(file)
      if (!validation.valid) {
        setError(validation.error ?? 'Invalid image file.')
        return
      }

      setLoading(true, 'Uploading image...')
      const objectUrl = URL.createObjectURL(file)
      try {
        // No explicit history call needed here: adding the image fires
        // Fabric's 'object:added' event, which CanvasEditor already turns
        // into a pushState() — calling initHistory() again would wipe out
        // any undo history from changes made before this upload.
        await addImageFromUrl(canvas, objectUrl, file.name.replace(/\.[^.]+$/, ''))
      } catch {
        setError('Could not load this image. Try a different file.')
      } finally {
        URL.revokeObjectURL(objectUrl)
        setLoading(false)
      }
    },
    [canvasRef, setError, setLoading],
  )

  const uploadImage = useCallback(
    async (file: File, hasDocument: boolean) => {
      if (!hasDocument) {
        createBlankDocument({
          width: EDITOR_DEFAULTS.CANVAS_WIDTH,
          height: EDITOR_DEFAULTS.CANVAS_HEIGHT,
          backgroundColor: EDITOR_DEFAULTS.CANVAS_BACKGROUND,
        })
      }
      await addImageToDocument(file)
    },
    [createBlankDocument, addImageToDocument],
  )

  return { createBlankDocument, addImageToDocument, uploadImage }
}
