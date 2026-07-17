/** Create/edit form modal for catalogue products. */
import { useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import { LoaderCircle, X } from 'lucide-react'
import { createProduct, updateProduct, type Product } from '../api/products'

type ProductDialogProps = {
  product?: Product
  onCancel: () => void
  onSaved?: (product: Product) => void
  onUpdated?: (product: Product) => void
}

/**
 * Uses the optional `product` prop to switch between create and edit mode.
 * @param product - Existing product to edit; omitted when creating.
 * @param onCancel - Closes the dialog without saving.
 * @param onSaved - Receives a newly created product.
 * @param onUpdated - Receives an updated existing product.
 */
export function ProductDialog({ product, onCancel, onSaved, onUpdated }: ProductDialogProps) {
  const isEditing = Boolean(product)
  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product ? String(product.price) : '')
  const [stock, setStock] = useState(product ? String(product.stock) : '')
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    /** Handles keyboard dismissal while no save request is running. */
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSaving) onCancel()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isSaving, onCancel])

  /** Validates form values, calls the correct product API, and reports success. */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsedPrice = Number(price)
    const parsedStock = Number(stock)

    if (!name.trim()) return setError('Name is required.')
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) return setError('Price must be zero or greater.')
    if (!Number.isInteger(parsedStock) || parsedStock < 0) return setError('Stock must be a whole number of zero or greater.')

    setIsSaving(true)
    setError('')
    try {
      const productInput = {
        name: name.trim(), description: description.trim() || null, price: parsedPrice,
        stock: parsedStock, imageUrl: imageUrl.trim() || null,
      }
      const savedProduct = product
        ? await updateProduct(product.id, productInput)
        : await createProduct(productInput)
      if (product) onUpdated?.(savedProduct)
      else onSaved?.(savedProduct)
    } catch (requestError) {
      setError(axios.isAxiosError(requestError) && typeof requestError.response?.data?.message === 'string'
        ? requestError.response.data.message
        : `Could not ${isEditing ? 'update' : 'add'} the product. Please try again.`)
    } finally {
      setIsSaving(false)
    }
  }

  const inputClass = 'mt-1.5 w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-zinc-950/45 p-4" onMouseDown={(event) => event.target === event.currentTarget && !isSaving && onCancel()}>
      <div role="dialog" aria-modal="true" aria-labelledby="product-dialog-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div><h2 id="product-dialog-title" className="text-xl font-semibold text-zinc-950">{isEditing ? 'Edit product' : 'Add product'}</h2><p className="mt-1 text-sm text-zinc-400">{isEditing ? 'Update the listing details below.' : 'Enter the details for the new listing.'}</p></div>
          <button type="button" aria-label="Close" disabled={isSaving} onClick={onCancel} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-zinc-700">Name<input autoFocus required value={name} onChange={(event) => setName(event.target.value)} className={inputClass} /></label>
          <label className="block text-sm font-medium text-zinc-700">Description<textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className={`${inputClass} resize-none`} /></label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-medium text-zinc-700">Price<input type="number" min="0" step="0.01" required value={price} onChange={(event) => setPrice(event.target.value)} className={inputClass} /></label>
            <label className="block text-sm font-medium text-zinc-700">Stock<input type="number" min="0" step="1" required value={stock} onChange={(event) => setStock(event.target.value)} className={inputClass} /></label>
          </div>
          <label className="block text-sm font-medium text-zinc-700">Image URL<input type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." className={inputClass} /></label>
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
