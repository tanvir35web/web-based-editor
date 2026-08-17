import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Magnet } from 'lucide-react'
import { IconButton } from '../../common/IconButton'
import { Slider } from '../../common/Slider'
import { useCanvasStore } from '../../../stores/editor/canvasStore'

export function SnappingControls() {
  const snapping = useCanvasStore((s) => s.snapping)
  const setSnapping = useCanvasStore((s) => s.setSnapping)

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <IconButton
          icon={<Magnet className="h-4 w-4" />}
          label="Snapping settings"
          size="sm"
          active={snapping.enabled}
        />
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          sideOffset={8}
          className="z-50 w-[220px] rounded-lg border border-surface-border bg-surface-2 p-3 shadow-xl"
        >
          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between text-xs text-text-secondary">
              Enable snapping
              <input
                type="checkbox"
                checked={snapping.enabled}
                onChange={(event) => setSnapping({ enabled: event.target.checked })}
                className="h-4 w-4 accent-[var(--color-accent)]"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-text-secondary">
              Snap to objects
              <input
                type="checkbox"
                checked={snapping.snapToObjects}
                disabled={!snapping.enabled}
                onChange={(event) => setSnapping({ snapToObjects: event.target.checked })}
                className="h-4 w-4 accent-[var(--color-accent)]"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-text-secondary">
              Snap to grid
              <input
                type="checkbox"
                checked={snapping.snapToGrid}
                disabled={!snapping.enabled}
                onChange={(event) => setSnapping({ snapToGrid: event.target.checked })}
                className="h-4 w-4 accent-[var(--color-accent)]"
              />
            </label>
            {snapping.enabled && snapping.snapToGrid && (
              <Slider
                label="Grid size"
                value={snapping.gridSize}
                min={5}
                max={100}
                onChange={(gridSize) => setSnapping({ gridSize })}
                formatValue={(v) => `${v}px`}
              />
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
