import { useEffect, useRef } from 'react'
import { ActiveSelection, type FabricObject } from 'fabric'
import { useEditorCanvasContext } from '../../lib/editor/EditorCanvasContext'
import { useEditorHistory } from './useEditorHistory'
import { useEditorStore } from '../../stores/editor/editorStore'
import { useDocumentActions } from './useDocumentActions'
import { useImageCrop } from './useImageCrop'
import { deleteObjects, duplicateObject, asEditorObject } from '../../lib/fabric/objects'
import { ACCEPTED_IMAGE_TYPES } from '../../lib/editor/constants'

const NUDGE_STEP = 1
const NUDGE_STEP_FAST = 10

function isTypingInField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
}

export function useKeyboardShortcuts() {
  const { canvasRef } = useEditorCanvasContext()
  const { undo, redo, pushState } = useEditorHistory()
  const bumpObjectsVersion = useEditorStore((s) => s.bumpObjectsVersion)
  const hasDocument = useEditorStore((s) => s.hasDocument)
  const { uploadImage } = useDocumentActions()
  const { isCropping, confirmCrop, cancelCropSession } = useImageCrop()
  const clipboard = useRef<FabricObject | null>(null)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const canvas = canvasRef.current
      if (!canvas) return

      // While cropping, the crop rect is the active object — every other
      // shortcut (Delete, Ctrl+A, nudging, ...) should be suppressed so it
      // can't be deleted/reselected out from under the crop session.
      if (isCropping) {
        if (event.key === 'Escape') {
          event.preventDefault()
          cancelCropSession()
        } else if (event.key === 'Enter') {
          event.preventDefault()
          confirmCrop()
        }
        return
      }

      const activeObject = canvas.getActiveObject()
      const isEditingText = !!activeObject && 'isEditing' in activeObject && (activeObject as { isEditing?: boolean }).isEditing
      if (isEditingText || isTypingInField(event.target)) return

      const isMeta = event.ctrlKey || event.metaKey

      if (event.key === 'Delete' || event.key === 'Backspace') {
        const targets = canvas.getActiveObjects().filter((obj) => !asEditorObject(obj).locked)
        if (targets.length === 0) return
        event.preventDefault()
        deleteObjects(canvas, targets)
        bumpObjectsVersion()
        pushState()
        return
      }

      if (isMeta && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) void redo()
        else void undo()
        return
      }

      if (isMeta && event.key.toLowerCase() === 'y') {
        event.preventDefault()
        void redo()
        return
      }

      if (isMeta && event.key.toLowerCase() === 'c') {
        if (!activeObject) return
        event.preventDefault()
        clipboard.current = activeObject
        return
      }

      if (isMeta && event.key.toLowerCase() === 'd') {
        if (!activeObject || asEditorObject(activeObject).locked) return
        event.preventDefault()
        void duplicateObject(canvas, activeObject).then(() => {
          bumpObjectsVersion()
          pushState()
        })
        return
      }

      if (isMeta && event.key.toLowerCase() === 'a') {
        event.preventDefault()
        canvas.discardActiveObject()
        const selectable = canvas.getObjects().filter((obj) => !asEditorObject(obj).locked && obj.visible)
        if (selectable.length === 1) {
          canvas.setActiveObject(selectable[0])
        } else if (selectable.length > 1) {
          canvas.setActiveObject(new ActiveSelection(selectable, { canvas }))
        }
        canvas.requestRenderAll()
        return
      }

      if (event.key === 'Escape') {
        canvas.discardActiveObject()
        canvas.requestRenderAll()
        return
      }

      if (event.key.startsWith('Arrow') && activeObject && !asEditorObject(activeObject).locked) {
        event.preventDefault()
        const step = event.shiftKey ? NUDGE_STEP_FAST : NUDGE_STEP
        const dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0
        const dy = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0
        activeObject.set({ left: (activeObject.left ?? 0) + dx, top: (activeObject.top ?? 0) + dy })
        activeObject.setCoords()
        canvas.requestRenderAll()
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (event.key.startsWith('Arrow')) pushState()
    }

    // Real OS clipboard paste (image or internally-copied object) is handled
    // via the native `paste` event rather than a keydown('v') branch, since a
    // genuine Ctrl+V fires both — keeping it in one place avoids double-pasting.
    function handlePaste(event: ClipboardEvent) {
      if (isTypingInField(event.target)) return
      const imageFile = Array.from(event.clipboardData?.files ?? []).find((file) =>
        ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number]),
      )
      if (imageFile) {
        event.preventDefault()
        void uploadImage(imageFile, hasDocument)
        return
      }
      const canvas = canvasRef.current
      if (canvas && clipboard.current) {
        event.preventDefault()
        void duplicateObject(canvas, clipboard.current).then(() => {
          bumpObjectsVersion()
          pushState()
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('paste', handlePaste)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('paste', handlePaste)
    }
  }, [canvasRef, undo, redo, pushState, bumpObjectsVersion, uploadImage, hasDocument, isCropping, confirmCrop, cancelCropSession])
}

export const KEYBOARD_SHORTCUTS_HELP = [
  { keys: 'Delete / Backspace', action: 'Delete selection' },
  { keys: 'Ctrl/Cmd + Z', action: 'Undo' },
  { keys: 'Ctrl/Cmd + Shift + Z', action: 'Redo' },
  { keys: 'Ctrl/Cmd + C / V', action: 'Copy / Paste' },
  { keys: 'Ctrl/Cmd + D', action: 'Duplicate' },
  { keys: 'Ctrl/Cmd + A', action: 'Select all' },
  { keys: 'Escape', action: 'Deselect (or cancel crop)' },
  { keys: 'Enter', action: 'Apply crop' },
  { keys: 'Arrow keys', action: 'Nudge selection' },
  { keys: 'Shift + Arrow', action: 'Nudge faster' },
]
