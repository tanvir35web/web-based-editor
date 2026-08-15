import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/utils/cn'
import { Tooltip } from './Tooltip'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  label: string
  active?: boolean
  size?: 'sm' | 'md'
  showTooltip?: boolean
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, active, size = 'md', showTooltip = true, className, disabled, ...props }, ref) => {
    const button = (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        aria-pressed={active}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-text-secondary transition-colors',
          'hover:bg-surface-2 hover:text-text-primary',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent',
          active && 'bg-accent/15 text-accent hover:bg-accent/20 hover:text-accent',
          size === 'sm' ? 'h-7 w-7' : 'h-9 w-9',
          className,
        )}
        {...props}
      >
        {icon}
      </button>
    )

    if (!showTooltip) return button
    return <Tooltip content={label}>{button}</Tooltip>
  },
)
IconButton.displayName = 'IconButton'
