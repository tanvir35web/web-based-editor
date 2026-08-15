import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-accent hover:bg-accent-hover text-accent-fg',
  secondary: 'bg-surface-3 hover:bg-surface-3/80 text-text-primary border border-surface-border',
  ghost: 'bg-transparent hover:bg-surface-2 text-text-secondary hover:text-text-primary',
  danger: 'bg-danger hover:bg-danger-hover text-white',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className,
        )}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
