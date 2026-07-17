/** Customer-management page for reviewing and editing customer profiles. */
import { useEffect, useState } from 'react'
import { LoaderCircle, Mail, Menu, Pencil, RefreshCw, UserRound } from 'lucide-react'
import { getCustomers, type Customer } from '../api/customers'
import { CustomerDialog } from '../components/CustomerDialog'

type CustomersPageProps = {
  onOpenMenu: () => void
}

/** @param onOpenMenu - Opens the application sidebar on small screens. */
export function CustomersPage({ onOpenMenu }: CustomersPageProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  /** Reloads customers and maintains request feedback state. */
  async function loadCustomers() {
    setIsLoading(true)
    setError('')

    try {
      setCustomers(await getCustomers())
    } catch (requestError) {
      console.error('Could not load customers:', requestError)
      setError('Could not load customers. Check that the server is running.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()

    getCustomers(controller.signal)
      .then(setCustomers)
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return
        console.error('Could not load customers:', requestError)
        setError('Could not load customers. Check that the server is running.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [])

  return (
    <div className="mx-auto flex h-screen max-w-[1320px] flex-col overflow-hidden px-5 py-7 sm:px-8 lg:px-12 lg:py-11">
      <header className="mb-9 flex shrink-0 items-start gap-3">
        <button aria-label="Open navigation" className="mt-1 rounded-lg border border-zinc-200 bg-white p-2 md:hidden" onClick={onOpenMenu}>
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Customers</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {isLoading ? 'Loading customers...' : `${customers.length} total customers`}
          </p>
        </div>
      </header>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="min-h-0 flex-1 overflow-auto">
          <div className="min-w-[680px]">
            <div className="sticky top-0 z-10 grid grid-cols-[1.4fr_1.8fr_100px_150px_48px] gap-5 border-b border-zinc-100 bg-white px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
              <span>Customer</span>
              <span>Email</span>
              <span className="text-center">Orders</span>
              <span>Customer since</span>
              <span className="sr-only">Actions</span>
            </div>

            {isLoading && (
              <div className="grid h-48 place-items-center text-sm text-zinc-400">
                <span className="flex items-center gap-2"><LoaderCircle size={18} className="animate-spin" /> Loading customers...</span>
              </div>
            )}

            {!isLoading && error && (
              <div className="grid h-48 place-items-center px-6 text-center">
                <div>
                  <p className="text-sm text-red-600">{error}</p>
                  <button onClick={() => void loadCustomers()} className="mx-auto mt-4 flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                    <RefreshCw size={15} /> Try again
                  </button>
                </div>
              </div>
            )}

            {!isLoading && !error && customers.map((customer) => (
              <article key={customer.id} className="grid grid-cols-[1.4fr_1.8fr_100px_150px_48px] items-center gap-5 border-b border-zinc-100 px-6 py-4 last:border-0">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-50 text-indigo-600">
                    <UserRound size={18} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-zinc-900">{customer.name}</h2>
                    <p className="mt-0.5 truncate text-xs text-zinc-400">#{customer.id.slice(0, 8)}</p>
                  </div>
                </div>
                <div className="flex min-w-0 items-center gap-2 text-sm text-zinc-600">
                  <Mail size={15} className="shrink-0 text-zinc-400" />
                  <span className="truncate">{customer.email ?? 'No email provided'}</span>
                </div>
                <span className="text-center text-sm font-semibold text-zinc-700">{customer._count.orders}</span>
                <span className="text-xs text-zinc-400">{formatDate(customer.createdAt)}</span>
                <button type="button" aria-label={`Edit ${customer.name}`} title="Edit customer" onClick={() => setEditingCustomer(customer)} className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600">
                  <Pencil size={15} />
                </button>
              </article>
            ))}

            {!isLoading && !error && customers.length === 0 && (
              <div className="px-6 py-16 text-center text-sm text-zinc-400">No customers available.</div>
            )}
          </div>
        </div>
      </section>

      {editingCustomer && (
        <CustomerDialog
          customer={editingCustomer}
          onCancel={() => setEditingCustomer(null)}
          onUpdated={(updatedCustomer) => {
            setCustomers((current) => current.map((customer) => customer.id === updatedCustomer.id ? updatedCustomer : customer))
            setEditingCustomer(null)
          }}
        />
      )}
    </div>
  )
}

/** @param date - ISO date string. @returns Localized customer-since date. */
function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date))
}
