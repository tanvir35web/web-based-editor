import { useState } from 'react'
import { HexAlphaColorPicker } from 'react-colorful'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Pipette, Plus } from 'lucide-react'
import { cn } from '../../lib/utils/cn'
import { isValidHexColor, normalizeHexColor } from '../../lib/utils/color'
import { isEyeDropperSupported, pickColorFromScreen } from '../../lib/utils/eyedropper'
import { usePaletteStore } from '../../stores/editor/paletteStore'
import { ColorSwatchGrid } from './ColorSwatchGrid'
import { IconButton } from './IconButton'

interface ColorPickerProps {
  label?: string
  value: string
  onChange: (value: string) => void
  allowTransparent?: boolean
}

export function ColorPicker({ label, value, onChange, allowTransparent }: ColorPickerProps) {
  const [draft, setDraft] = useState(value)
  const isTransparent = value === 'transparent'
  const savedColors = usePaletteStore((s) => s.savedColors)
  const recentColors = usePaletteStore((s) => s.recentColors)
  const addSavedColor = usePaletteStore((s) => s.addSavedColor)
  const removeSavedColor = usePaletteStore((s) => s.removeSavedColor)
  const pushRecentColor = usePaletteStore((s) => s.pushRecentColor)

  const commitDraft = (next: string) => {
    setDraft(next)
    if (isValidHexColor(next)) {
      const normalized = normalizeHexColor(next)
      onChange(normalized)
      pushRecentColor(normalized)
    }
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
              <div className="flex flex-col gap-2">
                <HexAlphaColorPicker
                  color={isTransparent ? '#ffffff' : draft}
                  onChange={commitDraft}
                  style={{ width: '100%' }}
                />
                <div className="flex items-center gap-1.5">
                  {isEyeDropperSupported() && (
                    <IconButton
                      size="sm"
                      icon={<Pipette className="h-3.5 w-3.5" />}
                      label="Pick color from screen"
                      onClick={() => {
                        void pickColorFromScreen().then((picked) => {
                          if (picked) commitDraft(picked)
                        })
                      }}
                    />
                  )}
                  <IconButton
                    size="sm"
                    icon={<Plus className="h-3.5 w-3.5" />}
                    label="Save color to palette"
                    onClick={() => addSavedColor(isTransparent ? 'transparent' : normalizeHexColor(draft))}
                  />
                </div>
                <ColorSwatchGrid label="Saved" colors={savedColors} onSelect={commitDraft} onRemove={removeSavedColor} />
                <ColorSwatchGrid label="Recent" colors={recentColors} onSelect={commitDraft} />
              </div>
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
