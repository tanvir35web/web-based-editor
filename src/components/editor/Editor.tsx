import { EditorCanvasProvider } from '../../lib/editor/EditorCanvasContext'
import { TooltipProvider } from '../common/Tooltip'
import { EditorHeader } from './EditorHeader'
import { EditorSidebar } from './EditorSidebar'
import { EditorWorkspace } from './EditorWorkspace'
import { PropertiesPanel } from './PropertiesPanel'
import { EditorStatusBar } from './EditorStatusBar'
import { NewCanvasDialog } from './dialogs/NewCanvasDialog'
import { ExportDialog } from './dialogs/ExportDialog'
import { useKeyboardShortcuts } from '../../hooks/editor/useKeyboardShortcuts'
import { useEditorStore } from '../../stores/editor/editorStore'
import { cn } from '../../lib/utils/cn'

function EditorShell() {
  useKeyboardShortcuts()
  const errorMessage = useEditorStore((s) => s.errorMessage)
  const setError = useEditorStore((s) => s.setError)
  const isLoading = useEditorStore((s) => s.isLoading)
  const loadingMessage = useEditorStore((s) => s.loadingMessage)
  const isMobilePropertiesOpen = useEditorStore((s) => s.isMobilePropertiesOpen)
  const closeMobilePanels = useEditorStore((s) => s.closeMobilePanels)

  return (
    <div className="flex h-screen flex-col bg-surface-0">
      <EditorHeader />
      <div className="flex min-h-0 flex-1">
        <EditorSidebar />
        <EditorWorkspace />
        {isMobilePropertiesOpen && (
          <div className="fixed inset-0 top-14 bottom-7 z-30 bg-black/50 lg:hidden" onClick={closeMobilePanels} aria-hidden="true" />
        )}
        <aside
          className={cn(
            'w-72 shrink-0 border-l border-surface-border bg-surface-1',
            'fixed top-14 bottom-7 right-0 z-40 transition-transform lg:static lg:z-auto lg:translate-x-0',
            isMobilePropertiesOpen ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <PropertiesPanel />
        </aside>
      </div>
      <EditorStatusBar />

      {isLoading && (
        <div
          role="status"
          className="fixed bottom-4 right-4 rounded-md border border-surface-border bg-surface-2 px-3 py-2 text-xs text-text-secondary shadow-lg"
        >
          {loadingMessage || 'Working…'}
        </div>
      )}
      {errorMessage && (
        <div
          role="alert"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-md border border-danger/50 bg-surface-2 px-4 py-2 text-xs text-danger shadow-lg"
        >
          {errorMessage}
          <button type="button" className="ml-3 underline" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      <NewCanvasDialog />
      <ExportDialog />
    </div>
  )
}

export function Editor() {
  return (
    <TooltipProvider>
      <EditorCanvasProvider>
        <EditorShell />
      </EditorCanvasProvider>
    </TooltipProvider>
  )
}
