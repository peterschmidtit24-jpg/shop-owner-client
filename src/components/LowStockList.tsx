/** Dashboard list highlighting products that may need replenishment. */
import { AlertTriangle } from 'lucide-react'

export type LowStockProduct = {
  id: string
  name: string
  price: number
  stock: number
  imageUrl: string | null
}

/** @param products - Products selected by the dashboard's low-stock threshold. */
export function LowStockList({ products }: { products: LowStockProduct[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white xl:col-span-2">
      <div className="flex h-14 items-center justify-between border-b border-zinc-100 px-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><AlertTriangle size={16} className="text-amber-500" /> Low Stock Alerts</h2>
        <span className="font-mono text-xs text-zinc-400">≤ 10 units</span>
      </div>
      <div>
        {products.length === 0 && <p className="px-6 py-12 text-center text-sm text-zinc-400">No low-stock products.</p>}
        {products.map((product) => (
          <div key={product.id} className="flex items-center gap-4 border-b border-zinc-100 px-6 py-4 last:border-0">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt="" className="h-11 w-11 shrink-0 rounded-xl bg-zinc-100 object-cover" />
            ) : (
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-zinc-100 text-xs font-bold text-zinc-600">{getInitials(product.name)}</div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-900">{product.name}</p>
              <p className="mt-0.5 text-xs text-zinc-400">${product.price.toFixed(2)}</p>
            </div>
            <span className={`text-sm font-semibold ${product.stock <= 3 ? 'text-red-500' : 'text-amber-600'}`}>{product.stock}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** @param name - Product name. @returns A two-letter image fallback. */
function getInitials(name: string) {
  return name.split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase()
}
