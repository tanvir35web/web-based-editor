import { useRef } from 'react'
import { CanvasContainer } from './canvas/CanvasContainer'
import { CanvasControls } from './canvas/CanvasControls'
import { ZoomControls } from './canvas/ZoomControls'
import { SnappingControls } from './canvas/SnappingControls'
import { CanvasEmptyState } from './canvas/CanvasEmptyState'
import { PageNavigator } from './canvas/PageNavigator'
import { useEditorStore } from '../../stores/editor/editorStore'
import { useDocumentActions } from '../../hooks/editor/useDocumentActions'
import { ACCEPTED_IMAGE_TYPES } from '../../lib/editor/constants'

export function EditorWorkspace() {
  const hasDocument = useEditorStore((s) => s.hasDocument)
  const { uploadImage } = useDocumentActions()
  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="relative flex-1 overflow-hidden">
        <CanvasContainer />
        {hasDocument && (
          <CanvasControls>
            <div className="flex items-center gap-2">
              <ZoomControls />
              <div className="rounded-lg border border-surface-border bg-surface-1 p-1 shadow-lg">
                <SnappingControls />
              </div>
            </div>
          </CanvasControls>
        )}
        {!hasDocument && <CanvasEmptyState onUploadClick={() => inputRef.current?.click()} />}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void uploadImage(file, hasDocument)
            event.target.value = ''
          }}
        />
      </div>
      {hasDocument && <PageNavigator />}
    </div>
  )
}
