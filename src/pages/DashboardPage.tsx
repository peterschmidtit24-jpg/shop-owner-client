/** Operational dashboard summarizing orders, revenue, stock, and activity. */
import { useEffect, useState } from 'react'
import axios from 'axios'
import { AlertTriangle, Boxes, CircleDollarSign, Menu, RefreshCw, ShoppingCart, Sparkles, Zap } from 'lucide-react'
import { getOrders, type Order as ApiOrder, type OrderStatus as ApiOrderStatus } from '../api/orders'
import { getProducts, type Product } from '../api/products'
import { Badge } from '../components/Badge'
import { LowStockList } from '../components/LowStockList'
import { MetricCard } from '../components/MetricCard'
import { RecentOrdersList, type Order as RecentOrder, type OrderStatus } from '../components/RecentOrdersList'

type DashboardPageProps = { onOpenMenu: () => void; onNavigate: (page: string) => void }

function dashboardErrorMessage(error: unknown) {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    return 'Your session has expired. Please sign out and sign in again.'
  }
  return 'Could not load dashboard data. Check your connection and try again.'
}

/** Aggregates product and order data into dashboard metrics and lists. */
export function DashboardPage({ onOpenMenu, onNavigate }: DashboardPageProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  /** Fetches dashboard source data together and refreshes displayed summaries. */
  async function loadDashboard() {
    setIsLoading(true)
    setError('')
    try {
      const [serverProducts, serverOrders] = await Promise.all([getProducts(), getOrders()])
      setProducts(serverProducts)
      setOrders(serverOrders)
    } catch (requestError) {
      console.error('Could not load dashboard:', requestError)
      setError(dashboardErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([getProducts(controller.signal), getOrders(controller.signal)])
      .then(([serverProducts, serverOrders]) => {
        setProducts(serverProducts)
        setOrders(serverOrders)
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return
        console.error('Could not load dashboard:', requestError)
        setError(dashboardErrorMessage(requestError))
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [])

  /** Shows temporary order guidance before navigating to the Orders page. */
  function showSimulateNotice() {
    setNotice('The order simulation form will be connected next.')
    window.setTimeout(() => setNotice(''), 2500)
  }

  const orderCounts = orders.reduce(
    (counts, order) => ({ ...counts, [order.status]: counts[order.status] + 1 }),
    { PENDING: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 },
  )
  const revenue = orders.filter((order) => order.status !== 'CANCELLED').reduce((total, order) => total + order.total, 0)
  const lowStockProducts = products.filter((product) => product.stock <= 10)
  const recentOrders: RecentOrder[] = orders.slice(0, 6).map((order) => ({
    id: order.id,
    customer: order.customer.name,
    product: order.product.name,
    amount: order.total,
    date: formatDate(order.createdAt),
    status: formatOrderStatus(order.status),
  }))

  return (
    <>
      <div className="mx-auto max-w-[1320px] px-5 py-7 sm:px-8 lg:px-12 lg:py-11">
        <header className="mb-10 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <button aria-label="Open navigation" className="mt-1 rounded-lg border border-zinc-200 bg-white p-2 md:hidden" onClick={onOpenMenu}><Menu size={20} /></button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Dashboard</h1>
              <p className="mt-1 text-sm text-zinc-400">{formatLongDate(new Date())}</p>
            </div>
          </div>
          <button onClick={showSimulateNotice} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] sm:px-6">
            <Zap size={17} /><span className="hidden sm:inline">Simulate Order</span><span className="sm:hidden">Simulate</span>
          </button>
        </header>

        {error && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button onClick={() => void loadDashboard()} className="flex items-center gap-2 font-semibold hover:text-red-900"><RefreshCw size={15} /> Try again</button>
          </div>
        )}

        <section className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-4 ${isLoading ? 'animate-pulse' : ''}`}>
          <MetricCard title="Total Revenue" value={isLoading ? '—' : formatCurrency(revenue)} note="Excl. cancelled orders" icon={CircleDollarSign} iconStyle="bg-emerald-50 text-emerald-600" />
          <MetricCard title="Orders by Status" value={isLoading ? '—' : String(orders.length)} icon={ShoppingCart} iconStyle="bg-sky-50 text-sky-500">
            <div className="flex flex-wrap gap-1.5 text-xs">
              <Badge className="border-amber-200 bg-amber-50 text-amber-700">{orderCounts.PENDING} Pend</Badge>
              <Badge className="border-sky-200 bg-sky-50 text-sky-700">{orderCounts.SHIPPED} Ship</Badge>
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">{orderCounts.DELIVERED} Deli</Badge>
              <Badge className="border-zinc-200 bg-zinc-100 text-zinc-500">{orderCounts.CANCELLED} Canc</Badge>
            </div>
          </MetricCard>
          <MetricCard title="Low Stock" value={isLoading ? '—' : String(lowStockProducts.length)} note="Products at or under 10 units" icon={AlertTriangle} iconStyle="bg-amber-50 text-amber-500" />
          <MetricCard title="Total Products" value={isLoading ? '—' : String(products.length)} note="Active listings" icon={Boxes} iconStyle="bg-violet-50 text-violet-600" />
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-5">
          <LowStockList products={isLoading ? [] : lowStockProducts} />
          <RecentOrdersList orders={isLoading ? [] : recentOrders} onViewAll={() => onNavigate('Orders')} />
        </section>
      </div>

      {notice && <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm text-white shadow-xl"><Sparkles size={16} className="text-indigo-400" /> {notice}</div>}
    </>
  )
}

/** @param status - Uppercase API status. @returns Dashboard display status. */
function formatOrderStatus(status: ApiOrderStatus): OrderStatus {
  return (status.charAt(0) + status.slice(1).toLowerCase()) as OrderStatus
}

/** @param value - Numeric amount. @returns USD currency text. */
function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

/** @param date - ISO date string. @returns Compact order date. */
function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date))
}

/** @param date - Date instance. @returns Long heading-friendly date. */
function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(date)
}
