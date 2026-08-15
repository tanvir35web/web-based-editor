import { useRef, useState, type DragEvent } from 'react'
import { UploadCloud } from 'lucide-react'
import { useDocumentActions } from '../../../hooks/editor/useDocumentActions'
import { useEditorStore } from '../../../stores/editor/editorStore'
import { ACCEPTED_IMAGE_TYPES } from '../../../lib/editor/constants'
import { cn } from '../../../lib/utils/cn'

export function UploadPanel() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { uploadImage } = useDocumentActions()
  const hasDocument = useEditorStore((s) => s.hasDocument)

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0]
    if (file) void uploadImage(file, hasDocument)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Upload</h3>
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors',
          isDragging ? 'border-accent bg-accent/10' : 'border-surface-border hover:border-surface-3',
        )}
      >
        <UploadCloud className="h-6 w-6 text-text-secondary" />
        <p className="text-xs text-text-secondary">Drag & drop an image, or</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-md bg-surface-3 px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-surface-3/80"
        >
          Browse files
        </button>
        <p className="text-[11px] text-text-muted">PNG, JPEG, WEBP</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </div>
  )
}
