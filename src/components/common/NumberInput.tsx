import { useState, type KeyboardEvent } from 'react'
import { cn } from '../../lib/utils/cn'

interface NumberInputProps {
  label?: string
  value: number
  min?: number
  max?: number
  step?: number
  suffix?: string
  onCommit: (value: number) => void
  className?: string
  disabled?: boolean
}

export function NumberInput({ label, value, min, max, step = 1, suffix, onCommit, className, disabled }: NumberInputProps) {
  const [draft, setDraft] = useState(String(Math.round(value)))
  // Reset the draft whenever `value` changes externally (undo/redo, another
  // control) — adjusted during render rather than in an effect, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevValue, setPrevValue] = useState(value)
  if (value !== prevValue) {
    setPrevValue(value)
    setDraft(String(Math.round(value)))
  }

  const commit = () => {
    const parsed = Number(draft)
    if (Number.isNaN(parsed)) {
      setDraft(String(Math.round(value)))
      return
    }
    const clamped = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, parsed))
    setDraft(String(clamped))
    onCommit(clamped)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') event.currentTarget.blur()
    if (event.key === 'Escape') setDraft(String(Math.round(value)))
  }

  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      {label && <span className="text-xs text-text-secondary">{label}</span>}
      <div className="flex h-8 items-center rounded-md border border-surface-border bg-surface-1 px-2 focus-within:ring-2 focus-within:ring-accent">
        <input
          type="number"
          value={draft}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent text-xs text-text-primary outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {suffix && <span className="text-xs text-text-muted">{suffix}</span>}
      </div>
    </label>
  )
}
