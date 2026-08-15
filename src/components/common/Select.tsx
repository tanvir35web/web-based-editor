import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils/cn'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  className?: string
  optionClassName?: (option: SelectOption) => string | undefined
}

export function Select({ label, value, options, onChange, className, optionClassName }: SelectProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <span className="text-xs text-text-secondary">{label}</span>}
      <SelectPrimitive.Root value={value} onValueChange={onChange}>
        <SelectPrimitive.Trigger
          aria-label={label}
          className="flex h-8 items-center justify-between gap-2 rounded-md border border-surface-border bg-surface-1 px-2.5 text-xs text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <SelectPrimitive.Value />
          <SelectPrimitive.Icon>
            <ChevronDown className="h-3.5 w-3.5 text-text-secondary" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content className="z-50 max-h-64 overflow-hidden rounded-md border border-surface-border bg-surface-2 shadow-xl">
            <SelectPrimitive.Viewport className="p-1">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-xs text-text-primary outline-none data-[highlighted]:bg-accent/15 data-[highlighted]:text-accent',
                    optionClassName?.(option),
                  )}
                >
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator>
                    <Check className="h-3.5 w-3.5" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  )
}
