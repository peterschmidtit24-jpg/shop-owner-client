/** Dashboard summary card for one business metric. */
import type { ComponentType, ReactNode } from 'react'

type MetricCardProps = {
  title: string
  value: string
  note?: string
  icon: ComponentType<{ size?: number }>
  iconStyle: string
  children?: ReactNode
}

/**
 * Displays a metric title, value, icon, optional note, and detail content.
 * Props supply the visible values and the icon styling for this metric.
 */
export function MetricCard({
  title,
  value,
  note,
  icon: Icon,
  iconStyle,
  children,
}: MetricCardProps) {
  return (
    <article className="min-h-48 rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
          {title}
        </p>
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${iconStyle}`}>
          <Icon size={19} />
        </span>
      </div>
      <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-zinc-950">
        {value}
      </p>
      <div className="mt-3">
        {children ?? <p className="text-xs text-zinc-400">{note}</p>}
      </div>
    </article>
  )
}
