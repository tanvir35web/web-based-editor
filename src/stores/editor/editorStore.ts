import { create } from 'zustand'
import { EDITOR_DEFAULTS } from '../../lib/editor/constants'
import type { EditorTool } from '../../types/editor'

interface EditorState {
  hasDocument: boolean
  documentWidth: number
  documentHeight: number
  activeTool: EditorTool
  isNewDocumentDialogOpen: boolean
  isExportDialogOpen: boolean
  isLoading: boolean
  loadingMessage: string
  errorMessage: string | null
  objectsVersion: number
  /** Below the `lg` breakpoint, the tool/properties panels become toggleable overlays instead of persistent columns. */
  isMobileToolsOpen: boolean
  isMobilePropertiesOpen: boolean
  /** Freehand drawing (PencilBrush) is active — captures all canvas pointer events until toggled off. */
  isDrawingMode: boolean
  /** A crop session is in progress on some image — see useImageCrop. */
  isCropping: boolean

  setActiveTool: (tool: EditorTool) => void
  openNewDocumentDialog: () => void
  closeNewDocumentDialog: () => void
  openExportDialog: () => void
  closeExportDialog: () => void
  setDocumentCreated: (width: number, height: number) => void
  setLoading: (isLoading: boolean, message?: string) => void
  setError: (message: string | null) => void
  bumpObjectsVersion: () => void
  setIsDrawingMode: (isDrawingMode: boolean) => void
  setIsCropping: (isCropping: boolean) => void
  toggleMobileTools: () => void
  toggleMobileProperties: () => void
  closeMobilePanels: () => void
}

export const useEditorStore = create<EditorState>((set) => ({
  hasDocument: false,
  documentWidth: EDITOR_DEFAULTS.CANVAS_WIDTH,
  documentHeight: EDITOR_DEFAULTS.CANVAS_HEIGHT,
  activeTool: 'select',
  isNewDocumentDialogOpen: false,
  isExportDialogOpen: false,
  isLoading: false,
  loadingMessage: '',
  errorMessage: null,
  objectsVersion: 0,
  isMobileToolsOpen: false,
  isMobilePropertiesOpen: false,
  isDrawingMode: false,
  isCropping: false,

  setActiveTool: (tool) => set({ activeTool: tool, isMobileToolsOpen: true }),
  openNewDocumentDialog: () => set({ isNewDocumentDialogOpen: true }),
  closeNewDocumentDialog: () => set({ isNewDocumentDialogOpen: false }),
  openExportDialog: () => set({ isExportDialogOpen: true }),
  closeExportDialog: () => set({ isExportDialogOpen: false }),
  setDocumentCreated: (width, height) =>
    set({ hasDocument: true, documentWidth: width, documentHeight: height }),
  setLoading: (isLoading, message = '') => set({ isLoading, loadingMessage: message }),
  setError: (message) => set({ errorMessage: message }),
  bumpObjectsVersion: () => set((state) => ({ objectsVersion: state.objectsVersion + 1 })),
  setIsDrawingMode: (isDrawingMode) => set({ isDrawingMode }),
  setIsCropping: (isCropping) => set({ isCropping }),
  toggleMobileTools: () =>
    set((state) => ({ isMobileToolsOpen: !state.isMobileToolsOpen, isMobilePropertiesOpen: false })),
  toggleMobileProperties: () =>
    set((state) => ({ isMobilePropertiesOpen: !state.isMobilePropertiesOpen, isMobileToolsOpen: false })),
  closeMobilePanels: () => set({ isMobileToolsOpen: false, isMobilePropertiesOpen: false }),
}))
