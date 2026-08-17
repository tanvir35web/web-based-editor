import { useRef } from 'react'
import { Undo2, Redo2, Download, Save, FolderOpen, FilePlus2, PanelRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { IconButton } from '../common/IconButton'
import { Button } from '../common/Button'
import { useEditorHistory } from '../../hooks/editor/useEditorHistory'
import { useEditorStore } from '../../stores/editor/editorStore'
import { usePagesStore } from '../../stores/editor/pagesStore'
import { useEditorCanvasContext } from '../../lib/editor/EditorCanvasContext'
import { serializeDocument, deserializeDocument } from '../../lib/fabric/serialization'
import { downloadBlob } from '../../lib/fabric/export'
import type { EditorDocument } from '../../types/editor'

export function EditorHeader() {
  const { undo, redo, canUndo, canRedo, initHistory } = useEditorHistory()
  const { canvasRef, pagesRef } = useEditorCanvasContext()
  const openNewDocumentDialog = useEditorStore((s) => s.openNewDocumentDialog)
  const openExportDialog = useEditorStore((s) => s.openExportDialog)
  const setDocumentCreated = useEditorStore((s) => s.setDocumentCreated)
  const hasDocument = useEditorStore((s) => s.hasDocument)
  const toggleMobileProperties = useEditorStore((s) => s.toggleMobileProperties)
  const setPagesState = usePagesStore((s) => s.setPagesState)
  const loadInputRef = useRef<HTMLInputElement | null>(null)

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const document = serializeDocument(canvas, pagesRef.current)
    downloadBlob(new Blob([JSON.stringify(document)], { type: 'application/json' }), 'design.json')
  }

  const handleLoadFile = async (file: File) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const text = await file.text()
    const document = JSON.parse(text) as EditorDocument
    await deserializeDocument(canvas, pagesRef.current, document)
    setPagesState(
      pagesRef.current.pages.map((page) => ({ id: page.id, name: page.name })),
      pagesRef.current.activePageId,
    )
    setDocumentCreated(document.canvas.width, document.canvas.height)
    initHistory()
  }

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-surface-border bg-surface-1 px-4">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-sm font-semibold text-text-primary">
          Artboard
        </Link>
        <div className="h-5 w-px bg-surface-border" />
        <Button variant="ghost" size="sm" onClick={openNewDocumentDialog}>
          <FilePlus2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => loadInputRef.current?.click()}>
          <FolderOpen className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Open</span>
        </Button>
        <input
          ref={loadInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void handleLoadFile(file)
            event.target.value = ''
          }}
        />
      </div>

      <div className="flex items-center gap-1">
        <IconButton icon={<Undo2 className="h-4 w-4" />} label="Undo" disabled={!canUndo} onClick={() => void undo()} />
        <IconButton icon={<Redo2 className="h-4 w-4" />} label="Redo" disabled={!canRedo} onClick={() => void redo()} />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" disabled={!hasDocument} onClick={handleSave} className="hidden sm:inline-flex">
          <Save className="h-3.5 w-3.5" />
          Save
        </Button>
        <Button variant="primary" size="sm" disabled={!hasDocument} onClick={openExportDialog}>
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
        <IconButton
          icon={<PanelRight className="h-4 w-4" />}
          label="Toggle properties panel"
          className="lg:hidden"
          onClick={toggleMobileProperties}
        />
      </div>
    </header>
  )
}
