import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { ColorPicker } from './ColorPicker'
import { IconButton } from './IconButton'
import { cn } from '../../lib/utils/cn'
import type { GradientStop } from '../../types/fill'

interface GradientStopEditorProps {
  stops: GradientStop[]
  onChange: (stops: GradientStop[]) => void
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function gradientPreviewCss(stops: GradientStop[]): string {
  const stopList = [...stops]
    .sort((a, b) => a.offset - b.offset)
    .map((stop) => `${stop.color} ${Math.round(stop.offset * 100)}%`)
    .join(', ')
  return `linear-gradient(to right, ${stopList})`
}

/**
 * Assumes `stops` is always kept sorted ascending by offset by the caller —
 * dragging clamps a stop between its immediate neighbors rather than
 * resorting mid-drag, so the array order never needs to change.
 */
export function GradientStopEditor({ stops, onChange }: GradientStopEditorProps) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = stops[Math.min(selectedIndex, stops.length - 1)]

  const offsetFromClientX = (clientX: number): number => {
    const track = trackRef.current
    if (!track) return 0
    const rect = track.getBoundingClientRect()
    return clamp((clientX - rect.left) / rect.width, 0, 1)
  }

  const handleHandlePointerDown = (index: number) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setSelectedIndex(index)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleHandlePointerMove = (index: number) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.buttons !== 1) return
    const prevOffset = index > 0 ? stops[index - 1].offset + 0.001 : 0
    const nextOffset = index < stops.length - 1 ? stops[index + 1].offset - 0.001 : 1
    const offset = clamp(offsetFromClientX(event.clientX), prevOffset, nextOffset)
    onChange(stops.map((stop, i) => (i === index ? { ...stop, offset } : stop)))
  }

  const addStopAt = (clientX: number) => {
    const offset = offsetFromClientX(clientX)
    const sorted = [...stops].sort((a, b) => a.offset - b.offset)
    const insertAt = sorted.findIndex((stop) => stop.offset > offset)
    const before = insertAt === -1 ? sorted[sorted.length - 1] : sorted[Math.max(0, insertAt - 1)]
    const color = before?.color ?? '#ffffff'
    const next = insertAt === -1 ? [...sorted, { offset, color }] : sorted.toSpliced(insertAt, 0, { offset, color })
    onChange(next)
    setSelectedIndex(insertAt === -1 ? next.length - 1 : insertAt)
  }

  const removeSelected = () => {
    if (stops.length <= 2) return
    const next = stops.filter((_, i) => i !== selectedIndex)
    onChange(next)
    setSelectedIndex(Math.max(0, selectedIndex - 1))
  }

  const updateSelectedColor = (color: string) => {
    onChange(stops.map((stop, i) => (i === selectedIndex ? { ...stop, color } : stop)))
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={trackRef}
        onPointerDown={(event) => addStopAt(event.clientX)}
        className="relative h-6 w-full cursor-copy rounded-md border border-surface-border"
        style={{ background: gradientPreviewCss(stops) }}
      >
        {stops.map((stop, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Gradient stop at ${Math.round(stop.offset * 100)}%`}
            onPointerDown={handleHandlePointerDown(index)}
            onPointerMove={handleHandlePointerMove(index)}
            className={cn(
              'absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow',
              index === selectedIndex ? 'z-10 border-accent' : 'border-white',
            )}
            style={{ left: `${stop.offset * 100}%`, backgroundColor: stop.color }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary">Stop at {Math.round((selected?.offset ?? 0) * 100)}%</span>
        <IconButton
          size="sm"
          icon={<Trash2 className="h-3.5 w-3.5" />}
          label="Remove stop"
          disabled={stops.length <= 2}
          onClick={removeSelected}
        />
      </div>

      {selected && <ColorPicker label="Stop Color" value={selected.color} onChange={updateSelectedColor} />}

      <p className="flex items-center gap-1 text-[11px] text-text-muted">
        <Plus className="h-3 w-3" /> Click the gradient bar to add a stop.
      </p>
    </div>
  )
}
