import type { ReactNode } from 'react'

type BadgeProps = {
  children: ReactNode
  className: string
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span className={`w-fit rounded-lg border px-2 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  )
}
