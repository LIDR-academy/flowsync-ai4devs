import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Alert({
  children,
  className,
  variant = 'default',
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'destructive' }) {
  return (
    <div
      className={cn('ui-alert', variant === 'destructive' ? 'ui-alert-destructive' : '', className)}
      role="alert"
      {...props}
    >
      {children}
    </div>
  )
}

export function AlertTitle({ children, className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('ui-alert-title', className)} {...props}>
      {children}
    </h3>
  )
}

export function AlertDescription({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('ui-alert-description', className)} {...props}>
      {children}
    </p>
  )
}
