import { useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import { LoaderCircle, X } from 'lucide-react'
import { getCustomers, type Customer } from '../api/customers'
import { createOrder, type Order } from '../api/orders'
import { getProducts, type Product } from '../api/products'

type OrderDialogProps = {
  onCancel: () => void
  onSaved: (order: Order) => void
}

export function OrderDialog({ onCancel, onSaved }: OrderDialogProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [productId, setProductId] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    Promise.all([getProducts(controller.signal), getCustomers(controller.signal)])
      .then(([loadedProducts, loadedCustomers]) => {
        setProducts(loadedProducts)
        setCustomers(loadedCustomers)
        setProductId(loadedProducts.find((product) => product.stock > 0)?.id ?? '')
        setCustomerId(loadedCustomers[0]?.id ?? '')
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return
        console.error('Could not load order options:', requestError)
        setError('Could not load products and customers.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSaving) onCancel()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isSaving, onCancel])

  const selectedProduct = products.find((product) => product.id === productId)
  const parsedQuantity = Number(quantity)
  const estimatedTotal = selectedProduct && Number.isInteger(parsedQuantity) && parsedQuantity > 0
    ? selectedProduct.price * parsedQuantity
    : 0

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!productId) return setError('Select an available product.')
    if (customerMode === 'existing' && !customerId) return setError('Select a customer.')
    if (customerMode === 'new' && !customerName.trim()) return setError('Enter the new customer’s name.')
    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) return setError('Quantity must be a positive whole number.')
    if (selectedProduct && parsedQuantity > selectedProduct.stock) return setError(`Only ${selectedProduct.stock} units are available.`)

    setIsSaving(true)
    setError('')
    try {
      const customerInput = customerMode === 'existing'
        ? { customerId }
        : { customerName: customerName.trim(), customerEmail: customerEmail.trim() || null }
      onSaved(await createOrder({ productId, quantity: parsedQuantity, ...customerInput }))
    } catch (requestError) {
      setError(axios.isAxiosError(requestError) && typeof requestError.response?.data?.message === 'string'
        ? requestError.response.data.message
        : 'Could not create the order. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const inputClass = 'mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-zinc-50 disabled:text-zinc-400'

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-zinc-950/45 p-4" onMouseDown={(event) => event.target === event.currentTarget && !isSaving && onCancel()}>
      <div role="dialog" aria-modal="true" aria-labelledby="order-dialog-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="order-dialog-title" className="text-xl font-semibold text-zinc-950">Add order</h2>
            <p className="mt-1 text-sm text-zinc-400">Select a customer, product, and quantity.</p>
          </div>
          <button type="button" aria-label="Close" disabled={isSaving} onClick={onCancel} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <span className="block text-sm font-medium text-zinc-700">Customer</span>
            <div className="mt-1.5 grid grid-cols-2 rounded-xl border border-zinc-200 bg-zinc-100/70 p-1">
              <button type="button" onClick={() => setCustomerMode('existing')} className={`rounded-lg px-3 py-2 text-sm font-medium transition ${customerMode === 'existing' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}>Existing customer</button>
              <button type="button" onClick={() => setCustomerMode('new')} className={`rounded-lg px-3 py-2 text-sm font-medium transition ${customerMode === 'new' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}>New customer</button>
            </div>
          </div>

          {customerMode === 'existing' ? (
            <label className="block text-sm font-medium text-zinc-700">
              Select customer
              <select autoFocus required disabled={isLoading || customers.length === 0} value={customerId} onChange={(event) => setCustomerId(event.target.value)} className={inputClass}>
                {customers.length === 0 && <option value="">No customers available — choose New customer</option>}
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}{customer.email ? ` — ${customer.email}` : ''}</option>)}
              </select>
            </label>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-zinc-700">
                Customer name
                <input autoFocus required value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Full name" className={inputClass} />
              </label>
              <label className="block text-sm font-medium text-zinc-700">
                Email <span className="font-normal text-zinc-400">(optional)</span>
                <input type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} placeholder="customer@example.com" className={inputClass} />
              </label>
            </div>
          )}

          <label className="block text-sm font-medium text-zinc-700">
            Product
            <select required disabled={isLoading || products.every((product) => product.stock === 0)} value={productId} onChange={(event) => setProductId(event.target.value)} className={inputClass}>
              {products.every((product) => product.stock === 0) && <option value="">No products in stock</option>}
              {products.map((product) => <option key={product.id} value={product.id} disabled={product.stock === 0}>{product.name} — ${product.price.toFixed(2)} ({product.stock} in stock)</option>)}
            </select>
          </label>

          <label className="block text-sm font-medium text-zinc-700">
            Quantity
            <input type="number" min="1" max={selectedProduct?.stock} step="1" required disabled={!selectedProduct} value={quantity} onChange={(event) => setQuantity(event.target.value)} className={inputClass} />
          </label>

          <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 text-sm">
            <span className="text-zinc-500">Order total</span>
            <span className="font-mono font-semibold text-zinc-900">${estimatedTotal.toFixed(2)}</span>
          </div>

          {isLoading && <p className="flex items-center gap-2 text-sm text-zinc-400"><LoaderCircle size={16} className="animate-spin" /> Loading order options...</p>}
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" disabled={isSaving} onClick={onCancel} className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed">Cancel</button>
            <button type="submit" disabled={isLoading || isSaving || !productId || (customerMode === 'existing' ? !customerId : !customerName.trim())} className="flex min-w-28 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60">
              {isSaving && <LoaderCircle size={16} className="animate-spin" />}{isSaving ? 'Creating...' : 'Add order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
