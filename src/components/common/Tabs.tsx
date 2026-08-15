/* eslint-disable react-refresh/only-export-components -- thin Radix re-exports, not plain constants */
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '../../lib/utils/cn'

export const Tabs = TabsPrimitive.Root

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn('inline-flex items-center gap-1 rounded-md bg-surface-2 p-1', className)}
      {...props}
    />
  )
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'rounded-sm px-2.5 py-1 text-xs font-medium text-text-secondary transition-colors',
        'data-[state=active]:bg-surface-1 data-[state=active]:text-text-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        className,
      )}
      {...props}
    />
  )
}

export const TabsContent = TabsPrimitive.Content
