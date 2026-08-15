import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils/cn'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function Modal({ open, onOpenChange, title, description, children, footer, className }: ModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[min(90vw,480px)] -translate-x-1/2 -translate-y-1/2',
            'rounded-xl border border-surface-border bg-surface-1 p-5 shadow-2xl',
            'focus-visible:outline-none',
            className,
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <DialogPrimitive.Title className="text-sm font-semibold text-text-primary">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="mt-1 text-xs text-text-secondary">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="Close dialog"
                className="rounded-md p-1 text-text-secondary hover:bg-surface-2 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogPrimitive.Close>
          </div>
          <div>{children}</div>
          {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
