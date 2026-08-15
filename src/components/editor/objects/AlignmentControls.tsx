import {
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignHorizontalSpaceAround,
  AlignVerticalSpaceAround,
} from 'lucide-react'
import { IconButton } from '../../common/IconButton'
import { useEditorCanvasContext } from '../../../lib/editor/EditorCanvasContext'
import { useSelectedObject } from '../../../hooks/editor/useSelectedObject'
import { useEditorHistory } from '../../../hooks/editor/useEditorHistory'
import { alignObjects, distributeObjects, type HorizontalAlign, type VerticalAlign } from '../../../lib/fabric/objects'

const HORIZONTAL: { value: HorizontalAlign; icon: typeof AlignHorizontalJustifyStart; label: string }[] = [
  { value: 'left', icon: AlignHorizontalJustifyStart, label: 'Align left' },
  { value: 'center', icon: AlignHorizontalJustifyCenter, label: 'Align center' },
  { value: 'right', icon: AlignHorizontalJustifyEnd, label: 'Align right' },
]

const VERTICAL: { value: VerticalAlign; icon: typeof AlignVerticalJustifyStart; label: string }[] = [
  { value: 'top', icon: AlignVerticalJustifyStart, label: 'Align top' },
  { value: 'middle', icon: AlignVerticalJustifyCenter, label: 'Align middle' },
  { value: 'bottom', icon: AlignVerticalJustifyEnd, label: 'Align bottom' },
]

export function AlignmentControls() {
  const { canvasRef } = useEditorCanvasContext()
  const { activeObjects, type } = useSelectedObject()
  const { pushState } = useEditorHistory()

  if (type === 'none') return null

  const runAlign = (axis: HorizontalAlign | VerticalAlign) => {
    const canvas = canvasRef.current
    if (!canvas) return
    alignObjects(canvas, activeObjects, axis)
    pushState()
  }

  const runDistribute = (direction: 'horizontal' | 'vertical') => {
    const canvas = canvasRef.current
    if (!canvas) return
    distributeObjects(canvas, activeObjects, direction)
    pushState()
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Align</h3>
      <div className="flex items-center gap-1">
        {HORIZONTAL.map(({ value, icon: Icon, label }) => (
          <IconButton key={value} icon={<Icon className="h-4 w-4" />} label={label} onClick={() => runAlign(value)} />
        ))}
        <div className="mx-1 h-5 w-px bg-surface-border" />
        {VERTICAL.map(({ value, icon: Icon, label }) => (
          <IconButton key={value} icon={<Icon className="h-4 w-4" />} label={label} onClick={() => runAlign(value)} />
        ))}
      </div>
      {activeObjects.length >= 3 && (
        <div className="flex items-center gap-1">
          <IconButton
            icon={<AlignHorizontalSpaceAround className="h-4 w-4" />}
            label="Distribute horizontally"
            onClick={() => runDistribute('horizontal')}
          />
          <IconButton
            icon={<AlignVerticalSpaceAround className="h-4 w-4" />}
            label="Distribute vertically"
            onClick={() => runDistribute('vertical')}
          />
        </div>
      )}
    </div>
  )
}
