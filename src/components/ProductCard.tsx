import { Package, Pencil, Trash2 } from 'lucide-react'
import type { KeyboardEvent, MouseEvent } from 'react'
import type { Product } from '../api/products'

type ProductCardProps = {
  product: Product
  onSelect: (product: Product) => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductCard({ product, onSelect, onEdit, onDelete }: ProductCardProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onSelect(product)
    }
  }

  function handleAction(event: MouseEvent<HTMLButtonElement>, action: (product: Product) => void) {
    event.stopPropagation()
    action(product)
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(product)}
      onKeyDown={handleKeyDown}
      className="group flex min-h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <div className="relative h-52 overflow-hidden bg-zinc-100 sm:h-56">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-[1.02]" />
        ) : (
          <div className="grid h-full place-items-center bg-indigo-50 text-indigo-500"><Package size={38} /></div>
        )}
        <span className={`absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur ${stockColor(product.stock)}`}>
          {product.stock} in stock
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="line-clamp-1 text-base font-semibold text-zinc-900">{product.name}</h2>
        <p className="mt-1.5 line-clamp-2 min-h-10 text-sm leading-5 text-zinc-400">{product.description ?? 'No description'}</p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="font-mono text-lg font-semibold text-zinc-900">${product.price.toFixed(2)}</span>
          <div className="flex gap-2">
            <button type="button" onClick={(event) => handleAction(event, onEdit)} aria-label={`Edit ${product.name}`} className="rounded-lg border border-zinc-200 p-2 text-zinc-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"><Pencil size={15} /></button>
            <button type="button" onClick={(event) => handleAction(event, onDelete)} aria-label={`Delete ${product.name}`} className="rounded-lg border border-zinc-200 p-2 text-zinc-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
          </div>
        </div>
      </div>
    </article>
  )
}

function stockColor(stock: number) {
  if (stock <= 3) return 'text-red-600'
  if (stock <= 10) return 'text-amber-600'
  return 'text-emerald-600'
}
