import { useEffect, useState } from 'react'
import { LoaderCircle, Menu, RefreshCw } from 'lucide-react'
import {
  getOrders,
  updateOrderStatus,
  type Order,
  type OrderStatus,
} from '../api/orders'

type OrdersPageProps = {
  onOpenMenu: () => void
}

type OrderFilter = 'ALL' | OrderStatus

const filters: OrderFilter[] = ['ALL', 'PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const statuses: OrderStatus[] = ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export function OrdersPage({ onOpenMenu }: OrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [activeFilter, setActiveFilter] = useState<OrderFilter>('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  async function loadOrders() {
    setIsLoading(true)
    setError('')

    try {
      setOrders(await getOrders())
    } catch (requestError) {
      console.error('Could not load orders:', requestError)
      setError('Could not load orders. Check that the server is running.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()

    getOrders(controller.signal)
      .then(setOrders)
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return
        console.error('Could not load orders:', requestError)
        setError('Could not load orders. Check that the server is running.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [])

  const counts = orders.reduce(
    (result, order) => ({ ...result, [order.status]: result[order.status] + 1 }),
    { PENDING: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 },
  )

  const visibleOrders = activeFilter === 'ALL'
    ? orders
    : orders.filter((order) => order.status === activeFilter)

  async function changeOrderStatus(orderId: string, status: OrderStatus) {
    setSavingOrderId(orderId)
    setNotice('')

    try {
      const updatedOrder = await updateOrderStatus(orderId, status)
      setOrders((currentOrders) =>
        currentOrders.map((order) => order.id === orderId ? updatedOrder : order),
      )
      setNotice('Order status updated.')
    } catch (requestError) {
      console.error('Could not update order status:', requestError)
      setNotice('The order status could not be updated.')
    } finally {
      setSavingOrderId(null)
      window.setTimeout(() => setNotice(''), 2500)
    }
  }

  function getFilterCount(filter: OrderFilter) {
    return filter === 'ALL' ? orders.length : counts[filter]
  }

  return (
    <div className="mx-auto flex h-screen max-w-[1320px] flex-col overflow-hidden px-5 py-7 sm:px-8 lg:px-12 lg:py-11">
      <header className="mb-9 flex shrink-0 items-start gap-3">
        <button aria-label="Open navigation" className="mt-1 rounded-lg border border-zinc-200 bg-white p-2 md:hidden" onClick={onOpenMenu}>
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Orders</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {isLoading ? 'Loading orders...' : `${orders.length} total orders`}
          </p>
        </div>
      </header>

      <div className="mb-7 shrink-0 overflow-x-auto">
        <div className="flex w-max rounded-xl border border-zinc-200 bg-zinc-100/70 p-1">
          {filters.map((filter) => (
            <button key={filter} onClick={() => setActiveFilter(filter)} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${activeFilter === filter ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}>
              {formatStatus(filter)} <span className="ml-1 text-xs text-zinc-400">{getFilterCount(filter)}</span>
            </button>
          ))}
        </div>
      </div>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="min-h-0 flex-1 overflow-auto">
          <div className="min-w-[900px]">
            <div className="sticky top-0 z-10 grid grid-cols-[1.2fr_1.9fr_70px_100px_140px_120px] gap-5 border-b border-zinc-100 bg-white px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
              <span>Customer</span><span>Product</span><span className="text-center">Qty</span><span className="text-right">Total</span><span>Status</span><span>Date</span>
            </div>

            {isLoading && (
              <div className="grid h-48 place-items-center text-sm text-zinc-400">
                <span className="flex items-center gap-2"><LoaderCircle size={18} className="animate-spin" /> Loading orders...</span>
              </div>
            )}

            {!isLoading && error && (
              <div className="grid h-48 place-items-center px-6 text-center">
                <div>
                  <p className="text-sm text-red-600">{error}</p>
                  <button onClick={() => void loadOrders()} className="mx-auto mt-4 flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                    <RefreshCw size={15} /> Try again
                  </button>
                </div>
              </div>
            )}

            {!isLoading && !error && visibleOrders.map((order, index) => (
              <article key={order.id} className="grid grid-cols-[1.2fr_1.9fr_70px_100px_140px_120px] items-center gap-5 border-b border-zinc-100 px-6 py-4 last:border-0">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-zinc-900">{order.customer.name}</h2>
                  <p className="mt-0.5 text-xs text-zinc-400">#{String(index + 1).padStart(2, '0')}</p>
                </div>
                <p className="truncate text-sm text-zinc-600">{order.product.name}</p>
                <span className="text-center text-sm text-zinc-600">{order.quantity}</span>
                <span className="text-right font-mono text-sm font-semibold text-zinc-900">${order.total.toFixed(2)}</span>
                <select aria-label={`Status for order ${order.id}`} value={order.status} disabled={savingOrderId === order.id || order.status === 'CANCELLED'} onChange={(event) => void changeOrderStatus(order.id, event.target.value as OrderStatus)} className="w-28 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400">
                  {statuses.map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}
                </select>
                <span className="text-xs text-zinc-400">{formatDate(order.createdAt)}</span>
              </article>
            ))}

            {!isLoading && !error && visibleOrders.length === 0 && (
              <div className="px-6 py-16 text-center text-sm text-zinc-400">No orders with this status.</div>
            )}
          </div>
        </div>
      </section>

      {notice && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-zinc-900 px-5 py-3 text-sm text-white shadow-xl">{notice}</div>
      )}
    </div>
  )
}

function formatStatus(status: OrderFilter) {
  return status.charAt(0) + status.slice(1).toLowerCase()
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date))
}
