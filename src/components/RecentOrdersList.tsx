/** Dashboard table for the most recently created orders. */
import { ChevronRight } from 'lucide-react'
import { Badge } from './Badge'

export type OrderStatus = 'Delivered' | 'Shipped' | 'Pending' | 'Cancelled'
export type Order = { id: string; customer: string; product: string; amount: number; date: string; status: OrderStatus }

const statusStyles: Record<OrderStatus, string> = {
  Delivered: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Shipped: 'border-sky-200 bg-sky-50 text-sky-700',
  Pending: 'border-amber-200 bg-amber-50 text-amber-700',
  Cancelled: 'border-zinc-200 bg-zinc-100 text-zinc-500',
}

/**
 * @param orders - Formatted order rows to preview.
 * @param onViewAll - Callback that opens the full Orders page.
 */
export function RecentOrdersList({ orders, onViewAll }: { orders: Order[]; onViewAll: () => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white xl:col-span-3">
      <div className="flex h-14 items-center justify-between border-b border-zinc-100 px-6">
        <h2 className="text-sm font-semibold">Recent Orders</h2>
        <button onClick={onViewAll} className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800">View all <ChevronRight size={14} /></button>
      </div>
      <div>
        {orders.length === 0 && <p className="px-6 py-12 text-center text-sm text-zinc-400">No recent orders.</p>}
        {orders.map((order) => (
          <div key={order.id} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-zinc-100 px-6 py-3.5 last:border-0 sm:grid-cols-[1fr_100px_92px]">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-900">{order.customer}</p>
              <p className="mt-0.5 truncate text-xs text-zinc-400">{order.product}</p>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">${order.amount.toFixed(2)}</p>
              <p className="mt-0.5 text-xs text-zinc-400">{order.date}</p>
            </div>
            <Badge className={statusStyles[order.status]}>{order.status}</Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
