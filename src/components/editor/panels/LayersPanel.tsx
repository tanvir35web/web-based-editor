import { Eye, EyeOff, Lock, Unlock, ChevronUp, ChevronDown, Trash2, Image as ImageIcon, Type, Square, Circle as CircleIcon, Triangle as TriangleIcon, PenTool } from 'lucide-react'
import { useLayers } from '../../../hooks/editor/useLayers'
import { useSelectedObject } from '../../../hooks/editor/useSelectedObject'
import { IconButton } from '../../common/IconButton'
import { cn } from '../../../lib/utils/cn'
import type { EditorObjectType } from '../../../types/objects'

const TYPE_ICON: Record<EditorObjectType, typeof ImageIcon> = {
  image: ImageIcon,
  textbox: Type,
  rect: Square,
  circle: CircleIcon,
  triangle: TriangleIcon,
  path: PenTool,
}

export function LayersPanel() {
  const { layers, selectLayer, toggleVisibility, toggleLock, reorder, deleteLayer } = useLayers()
  const { ids: selectedIds } = useSelectedObject()

  if (layers.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Layers</h3>
        <p className="text-xs text-text-muted">No objects on the canvas yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Layers</h3>
      <ul className="flex flex-col gap-1">
        {layers.map((layer) => {
          const Icon = TYPE_ICON[layer.type]
          const isSelected = selectedIds.includes(layer.id)
          return (
            <li
              key={layer.id}
              className={cn(
                'group flex items-center gap-1.5 rounded-md px-2 py-1.5',
                isSelected ? 'bg-accent/15' : 'hover:bg-surface-2',
              )}
            >
              <button
                type="button"
                onClick={() => selectLayer(layer.id)}
                className="flex flex-1 items-center gap-2 overflow-hidden text-left"
              >
                <Icon className={cn('h-3.5 w-3.5 shrink-0', isSelected ? 'text-accent' : 'text-text-secondary')} />
                <span className={cn('truncate text-xs', isSelected ? 'text-accent' : 'text-text-primary')}>
                  {layer.name}
                </span>
              </button>
              <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100">
                <IconButton
                  size="sm"
                  showTooltip={false}
                  label="Move forward"
                  icon={<ChevronUp className="h-3.5 w-3.5" />}
                  onClick={() => reorder(layer.id, 'forward')}
                />
                <IconButton
                  size="sm"
                  showTooltip={false}
                  label="Move backward"
                  icon={<ChevronDown className="h-3.5 w-3.5" />}
                  onClick={() => reorder(layer.id, 'backward')}
                />
                <IconButton
                  size="sm"
                  showTooltip={false}
                  label={layer.locked ? 'Unlock layer' : 'Lock layer'}
                  icon={layer.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                  active={layer.locked}
                  onClick={() => toggleLock(layer.id)}
                />
                <IconButton
                  size="sm"
                  showTooltip={false}
                  label={layer.visible ? 'Hide layer' : 'Show layer'}
                  icon={layer.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  onClick={() => toggleVisibility(layer.id)}
                />
                <IconButton
                  size="sm"
                  showTooltip={false}
                  label="Delete layer"
                  icon={<Trash2 className="h-3.5 w-3.5" />}
                  onClick={() => deleteLayer(layer.id)}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
