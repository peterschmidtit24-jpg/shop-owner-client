import { useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import { LoaderCircle, X } from 'lucide-react'
import { updateCustomer, type Customer } from '../api/customers'

type CustomerDialogProps = {
  customer: Customer
  onCancel: () => void
  onUpdated: (customer: Customer) => void
}

export function CustomerDialog({ customer, onCancel, onUpdated }: CustomerDialogProps) {
  const [name, setName] = useState(customer.name)
  const [email, setEmail] = useState(customer.email ?? '')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSaving) onCancel()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isSaving, onCancel])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) return setError('Name is required.')

    setIsSaving(true)
    setError('')
    try {
      onUpdated(await updateCustomer(customer.id, {
        name: name.trim(),
        email: email.trim() || null,
      }))
    } catch (requestError) {
      setError(axios.isAxiosError(requestError) && typeof requestError.response?.data?.message === 'string'
        ? requestError.response.data.message
        : 'Could not update the customer. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const inputClass = 'mt-1.5 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-zinc-950/45 p-4" onMouseDown={(event) => event.target === event.currentTarget && !isSaving && onCancel()}>
      <div role="dialog" aria-modal="true" aria-labelledby="customer-dialog-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="customer-dialog-title" className="text-xl font-semibold text-zinc-950">Edit customer</h2>
            <p className="mt-1 text-sm text-zinc-400">Update the customer's contact information.</p>
          </div>
          <button type="button" aria-label="Close" disabled={isSaving} onClick={onCancel} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-zinc-700">
            Name
            <input autoFocus required value={name} onChange={(event) => setName(event.target.value)} className={inputClass} />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="customer@example.com" className={inputClass} />
          </label>

          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" disabled={isSaving} onClick={onCancel} className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex min-w-24 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60">
              {isSaving && <LoaderCircle size={16} className="animate-spin" />}{isSaving ? 'Saving...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
