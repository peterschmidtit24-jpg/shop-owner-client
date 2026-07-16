import { useEffect, useState } from 'react'
import axios from 'axios'
import { LoaderCircle, TriangleAlert, X } from 'lucide-react'
import { deleteProduct, type Product } from '../api/products'

type DeleteProductDialogProps = {
  product: Product
  onCancel: () => void
  onDeleted: (productId: string) => void
}

export function DeleteProductDialog({ product, onCancel, onDeleted }: DeleteProductDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isDeleting) onCancel()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isDeleting, onCancel])

  async function handleDelete() {
    setIsDeleting(true)
    setError('')
    try {
      await deleteProduct(product.id)
      onDeleted(product.id)
    } catch (requestError) {
      setError(axios.isAxiosError(requestError) && typeof requestError.response?.data?.message === 'string'
        ? requestError.response.data.message
        : 'Could not delete the product. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-zinc-950/45 p-4" onMouseDown={(event) => event.target === event.currentTarget && !isDeleting && onCancel()}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="delete-product-title" aria-describedby="delete-product-description" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-50 text-red-600"><TriangleAlert size={21} /></div>
          <button type="button" aria-label="Close" disabled={isDeleting} onClick={onCancel} className="ml-auto rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed"><X size={18} /></button>
        </div>
        <h2 id="delete-product-title" className="mt-5 text-xl font-semibold text-zinc-950">Delete product?</h2>
        <p id="delete-product-description" className="mt-2 text-sm leading-6 text-zinc-500">
          Are you sure you want to delete <span className="font-semibold text-zinc-800">{product.name}</span>? This action cannot be undone.
        </p>
        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" disabled={isDeleting} onClick={onCancel} className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed">Cancel</button>
          <button type="button" disabled={isDeleting} onClick={() => void handleDelete()} className="flex min-w-32 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">
            {isDeleting && <LoaderCircle size={16} className="animate-spin" />}{isDeleting ? 'Deleting...' : 'Delete product'}
          </button>
        </div>
      </div>
    </div>
  )
}
