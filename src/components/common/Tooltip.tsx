import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import type { ReactNode } from 'react'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <TooltipPrimitive.Provider delayDuration={300}>{children}</TooltipPrimitive.Provider>
}

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className="z-50 rounded-md bg-surface-3 border border-surface-border px-2 py-1 text-xs text-text-primary shadow-lg"
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-surface-3" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
