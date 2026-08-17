import { X } from 'lucide-react'
import { cn } from '../../lib/utils/cn'

interface ColorSwatchGridProps {
  label?: string
  colors: string[]
  onSelect: (color: string) => void
  onRemove?: (color: string) => void
}

export function ColorSwatchGrid({ label, colors, onSelect, onRemove }: ColorSwatchGridProps) {
  if (colors.length === 0) return null

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-xs text-text-secondary">{label}</span>}
      <div className="grid grid-cols-8 gap-1">
        {colors.map((color) => (
          <div key={color} className="group relative">
            <button
              type="button"
              onClick={() => onSelect(color)}
              aria-label={`Use color ${color}`}
              className={cn(
                'h-5 w-5 rounded-sm border border-surface-border',
                color === 'transparent' && 'bg-transparency-grid',
              )}
              style={color === 'transparent' ? undefined : { backgroundColor: color }}
            />
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(color)}
                aria-label={`Remove color ${color}`}
                className="absolute -right-1 -top-1 hidden h-3 w-3 items-center justify-center rounded-full bg-surface-3 text-text-primary group-hover:flex"
              >
                <X className="h-2 w-2" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
