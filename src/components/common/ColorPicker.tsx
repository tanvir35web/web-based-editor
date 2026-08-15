import { useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '../../lib/utils/cn'
import { isValidHexColor, normalizeHexColor } from '../../lib/utils/color'

interface ColorPickerProps {
  label?: string
  value: string
  onChange: (value: string) => void
  allowTransparent?: boolean
}

export function ColorPicker({ label, value, onChange, allowTransparent }: ColorPickerProps) {
  const [draft, setDraft] = useState(value)
  const isTransparent = value === 'transparent'

  const commitDraft = (next: string) => {
    setDraft(next)
    if (isValidHexColor(next)) onChange(normalizeHexColor(next))
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-xs text-text-secondary">{label}</span>}
      <div className="flex items-center gap-2">
        <PopoverPrimitive.Root
          onOpenChange={(open) => {
            if (open) setDraft(isTransparent ? '#ffffff' : value)
          }}
        >
          <PopoverPrimitive.Trigger asChild>
            <button
              type="button"
              aria-label={label ? `${label} color swatch` : 'Choose color'}
              className={cn(
                'h-8 w-8 shrink-0 rounded-md border border-surface-border',
                isTransparent && 'bg-transparency-grid',
              )}
              style={isTransparent ? undefined : { backgroundColor: value }}
            />
          </PopoverPrimitive.Trigger>
          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              sideOffset={8}
              className="z-50 w-[200px] rounded-lg border border-surface-border bg-surface-2 p-3 shadow-xl"
            >
              <HexColorPicker
                color={isTransparent ? '#ffffff' : value}
                onChange={commitDraft}
                style={{ width: '100%' }}
              />
              {allowTransparent && (
                <button
                  type="button"
                  onClick={() => onChange('transparent')}
                  className={cn(
                    'mt-2 w-full rounded-md border border-surface-border py-1 text-xs text-text-secondary hover:text-text-primary',
                    isTransparent && 'border-accent text-accent',
                  )}
                >
                  Transparent
                </button>
              )}
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
        <input
          type="text"
          value={isTransparent ? 'transparent' : draft}
          onChange={(event) => commitDraft(event.target.value)}
          aria-label={label ? `${label} hex value` : 'Hex color value'}
          className="h-8 flex-1 rounded-md border border-surface-border bg-surface-1 px-2 text-xs text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
      </div>
    </div>
  )
}
