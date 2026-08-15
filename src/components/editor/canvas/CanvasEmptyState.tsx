import { ImagePlus, LayoutTemplate } from 'lucide-react'
import { Button } from '../../common/Button'
import { useEditorStore } from '../../../stores/editor/editorStore'

interface CanvasEmptyStateProps {
  onUploadClick: () => void
}

export function CanvasEmptyState({ onUploadClick }: CanvasEmptyStateProps) {
  const openNewDocumentDialog = useEditorStore((s) => s.openNewDocumentDialog)

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-surface-0">
      <div className="flex flex-col items-center gap-6 text-center">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Start creating</h1>
          <p className="mt-1 max-w-sm text-sm text-text-secondary">
            Open a blank artboard or upload a photo to begin editing.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" onClick={openNewDocumentDialog}>
            <LayoutTemplate className="h-4 w-4" />
            Create New
          </Button>
          <Button variant="secondary" onClick={onUploadClick}>
            <ImagePlus className="h-4 w-4" />
            Upload Image
          </Button>
        </div>
      </div>
    </div>
  )
}
