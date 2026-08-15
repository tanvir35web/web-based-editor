/* eslint-disable react-refresh/only-export-components -- Provider + its consumer hook are conventionally colocated */
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Canvas, FabricImage, Rect } from 'fabric'

export interface HistoryStackRef {
  snapshots: string[]
  cursor: number
  isRestoring: boolean
}

export interface CropOriginalState {
  cropX: number
  cropY: number
  width: number
  height: number
  scaleX: number
  scaleY: number
  left: number
  top: number
  angle: number
  opacity: number
}

export interface CropStateRef {
  targetImage: FabricImage | null
  cropRect: Rect | null
  previewImage: FabricImage | null
  original: CropOriginalState | null
}

interface EditorCanvasContextValue {
  canvasRef: React.RefObject<Canvas | null>
  containerRef: React.RefObject<HTMLDivElement | null>
  isReady: boolean
  registerCanvas: (canvas: Canvas | null) => void
  /** Shared across every `useEditorHistory()` call site so undo/redo state isn't duplicated per-component. */
  historyRef: React.RefObject<HistoryStackRef>
  /** Transient state for an in-progress crop session — see useImageCrop. */
  cropRef: React.RefObject<CropStateRef>
}

const EditorCanvasContext = createContext<EditorCanvasContextValue | null>(null)

export function EditorCanvasProvider({ children }: { children: ReactNode }) {
  const canvasRef = useRef<Canvas | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const historyRef = useRef<HistoryStackRef>({ snapshots: [], cursor: -1, isRestoring: false })
  const cropRef = useRef<CropStateRef>({ targetImage: null, cropRect: null, previewImage: null, original: null })
  const [isReady, setIsReady] = useState(false)

  const registerCanvas = useCallback((canvas: Canvas | null) => {
    canvasRef.current = canvas
    setIsReady(canvas !== null)
  }, [])

  const value = useMemo<EditorCanvasContextValue>(
    () => ({ canvasRef, containerRef, isReady, registerCanvas, historyRef, cropRef }),
    [isReady, registerCanvas],
  )

  return <EditorCanvasContext.Provider value={value}>{children}</EditorCanvasContext.Provider>
}

export function useEditorCanvasContext(): EditorCanvasContextValue {
  const ctx = useContext(EditorCanvasContext)
  if (!ctx) throw new Error('useEditorCanvasContext must be used within an EditorCanvasProvider')
  return ctx
}
