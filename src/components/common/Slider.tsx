import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '../../lib/utils/cn'

interface SliderProps {
  label?: string
  value: number
  min?: number
  max?: number
  step?: number
  formatValue?: (value: number) => string
  onChange: (value: number) => void
  onCommit?: (value: number) => void
  className?: string
  disabled?: boolean
}

export function Slider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  formatValue,
  onChange,
  onCommit,
  className,
  disabled,
}: SliderProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>{label}</span>
          <span className="text-text-primary tabular-nums">{formatValue ? formatValue(value) : value}</span>
        </div>
      )}
      <SliderPrimitive.Root
        className="relative flex h-4 w-full touch-none select-none items-center"
        min={min}
        max={max}
        step={step}
        value={[value]}
        disabled={disabled}
        aria-label={label}
        onValueChange={([next]) => onChange(next)}
        onValueCommit={([next]) => onCommit?.(next)}
      >
        <SliderPrimitive.Track className="relative h-1 grow rounded-full bg-surface-3">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-accent" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            'block h-3.5 w-3.5 rounded-full bg-white shadow',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1',
            disabled && 'opacity-40',
          )}
        />
      </SliderPrimitive.Root>
    </div>
  )
}
