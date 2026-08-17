/* eslint-disable react-refresh/only-export-components -- Provider + its consumer hook are conventionally colocated */
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Canvas, FabricImage, Rect } from 'fabric'
import type { PagesStateRef } from '../fabric/pages'
import type { PenToolStateRef } from '../fabric/penTool'

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
  /** Every page's content while it isn't the live canvas's — see lib/fabric/pages.ts. */
  pagesRef: React.RefObject<PagesStateRef>
  /** Transient state for an in-progress pen-tool drawing session — see usePenTool. */
  penToolRef: React.RefObject<PenToolStateRef>
}

const EditorCanvasContext = createContext<EditorCanvasContextValue | null>(null)

export function EditorCanvasProvider({ children }: { children: ReactNode }) {
  const canvasRef = useRef<Canvas | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const historyRef = useRef<HistoryStackRef>({ snapshots: [], cursor: -1, isRestoring: false })
  const cropRef = useRef<CropStateRef>({ targetImage: null, cropRect: null, previewImage: null, original: null })
  const pagesRef = useRef<PagesStateRef>({ pages: [], activePageId: null })
  const penToolRef = useRef<PenToolStateRef>({
    points: [],
    previewPath: null,
    anchorMarkers: [],
    rubberBandPoint: null,
    isDraggingHandle: false,
    strokeColor: '#111111',
    strokeWidth: 4,
  })
  const [isReady, setIsReady] = useState(false)

  const registerCanvas = useCallback((canvas: Canvas | null) => {
    canvasRef.current = canvas
    setIsReady(canvas !== null)
  }, [])

  const value = useMemo<EditorCanvasContextValue>(
    () => ({ canvasRef, containerRef, isReady, registerCanvas, historyRef, cropRef, pagesRef, penToolRef }),
    [isReady, registerCanvas],
  )

  return <EditorCanvasContext.Provider value={value}>{children}</EditorCanvasContext.Provider>
}

export function useEditorCanvasContext(): EditorCanvasContextValue {
  const ctx = useContext(EditorCanvasContext)
  if (!ctx) throw new Error('useEditorCanvasContext must be used within an EditorCanvasProvider')
  return ctx
}
