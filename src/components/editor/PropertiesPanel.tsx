import { Trash2 } from 'lucide-react'
import { useSelectedObject } from '../../hooks/editor/useSelectedObject'
import { useEditorStore } from '../../stores/editor/editorStore'
import { useEditorCanvasContext } from '../../lib/editor/EditorCanvasContext'
import { useEditorHistory } from '../../hooks/editor/useEditorHistory'
import { deleteObjects } from '../../lib/fabric/objects'
import { BackgroundPanel } from './panels/BackgroundPanel'
import { ImageObjectControls } from './objects/ImageObjectControls'
import { TextObjectControls } from './objects/TextObjectControls'
import { ShapeObjectControls } from './objects/ShapeObjectControls'
import { ObjectPositionControls } from './objects/ObjectPositionControls'
import { ObjectSizeControls } from './objects/ObjectSizeControls'
import { ObjectRotationControls } from './objects/ObjectRotationControls'
import { AlignmentControls } from './objects/AlignmentControls'
import { ClippingMaskControls } from './objects/ClippingMaskControls'
import { CropModeControls } from './objects/CropModeControls'
import { Button } from '../common/Button'
import type { EditorObjectType } from '../../types/objects'

function Section({ children }: { children: React.ReactNode }) {
  return <div className="border-b border-surface-border px-4 py-4 last:border-b-0">{children}</div>
}

const OBJECT_TYPE_LABEL: Record<EditorObjectType, string> = {
  image: 'Image',
  textbox: 'Text',
  rect: 'Shape',
  circle: 'Shape',
  triangle: 'Shape',
  path: 'Drawing',
}

const SHAPE_LIKE: EditorObjectType[] = ['rect', 'circle', 'triangle', 'path']

export function PropertiesPanel() {
  const { type, objectType, activeObjects } = useSelectedObject()
  const documentWidth = useEditorStore((s) => s.documentWidth)
  const documentHeight = useEditorStore((s) => s.documentHeight)
  const isCropping = useEditorStore((s) => s.isCropping)
  const { canvasRef } = useEditorCanvasContext()
  const { pushState } = useEditorHistory()

  // The active object during a crop session is the crop rectangle, not the
  // image, so this must short-circuit ahead of the normal selection-driven
  // branches below rather than living inside one of them.
  if (isCropping) {
    return (
      <div className="scroll-thin h-full overflow-y-auto">
        <CropModeControls />
      </div>
    )
  }

  if (type === 'none') {
    return (
      <div className="scroll-thin h-full overflow-y-auto">
        <Section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Document</h3>
          <p className="text-xs text-text-secondary">
            {documentWidth} × {documentHeight}px
          </p>
        </Section>
        <Section>
          <BackgroundPanel />
        </Section>
      </div>
    )
  }

  if (type === 'multiple') {
    return (
      <div className="scroll-thin h-full overflow-y-auto">
        <Section>
          <AlignmentControls />
        </Section>
        <ClippingMaskControls />
        <Section>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              const canvas = canvasRef.current
              if (!canvas) return
              deleteObjects(canvas, activeObjects)
              pushState()
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete selection
          </Button>
        </Section>
      </div>
    )
  }

  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <Section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
          {objectType ? OBJECT_TYPE_LABEL[objectType] : ''}
        </h3>
      </Section>
      {objectType === 'textbox' && (
        <Section>
          <TextObjectControls />
        </Section>
      )}
      {objectType && SHAPE_LIKE.includes(objectType) && (
        <Section>
          <ShapeObjectControls />
        </Section>
      )}
      <Section>
        <div className="flex flex-col gap-3">
          <ObjectPositionControls />
          <ObjectSizeControls />
          <ObjectRotationControls />
        </div>
      </Section>
      {objectType === 'image' && (
        <Section>
          <ImageObjectControls />
        </Section>
      )}
      <ClippingMaskControls />
    </div>
  )
}
