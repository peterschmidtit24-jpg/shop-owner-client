/** Read-only modal that presents the complete details of one product. */
import { useEffect } from 'react'
import { Package, X } from 'lucide-react'
import type { Product } from '../api/products'

type ProductDetailsDialogProps = {
  product: Product
  onClose: () => void
}

/**
 * @param product - Product to inspect.
 * @param onClose - Called by the close button, backdrop, or Escape key.
 */
export function ProductDetailsDialog({ product, onClose }: ProductDetailsDialogProps) {
  useEffect(() => {
    /** Handles keyboard dismissal while the dialog is mounted. */
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-zinc-950/45 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="product-details-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <h2 id="product-details-title" className="text-xl font-semibold text-zinc-950">Product details</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"><X size={18} /></button>
        </div>

        <div className="mt-6 flex items-center gap-4">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-20 w-20 shrink-0 rounded-2xl bg-zinc-100 object-cover" />
          ) : (
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><Package size={28} /></div>
          )}
          <div className="min-w-0">
            <h3 className="break-words text-lg font-semibold text-zinc-900">{product.name}</h3>
            <p className="mt-1 text-sm text-zinc-400">Added {new Date(product.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-zinc-50 p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Price</dt><dd className="mt-1 font-mono text-base font-semibold text-zinc-900">${product.price.toFixed(2)}</dd></div>
          <div className="rounded-xl bg-zinc-50 p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Stock</dt><dd className="mt-1 text-base font-semibold text-zinc-900">{product.stock}</dd></div>
          <div className="col-span-2 rounded-xl bg-zinc-50 p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Description</dt><dd className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-700">{product.description || 'No description'}</dd></div>
          {product.imageUrl && <div className="col-span-2 rounded-xl bg-zinc-50 p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Image URL</dt><dd className="mt-2 break-all text-sm text-zinc-700">{product.imageUrl}</dd></div>}
        </dl>

        <div className="mt-6 flex justify-end">
          <button type="button" autoFocus onClick={onClose} className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700">Close</button>
        </div>
      </div>
    </div>
  )
}
