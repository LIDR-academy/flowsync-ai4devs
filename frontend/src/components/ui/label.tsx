import type { LabelHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Label({ children, className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn('ui-label', className)} {...props}>
      {children}
    </label>
  )
}
