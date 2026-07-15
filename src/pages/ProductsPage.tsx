import { useEffect, useState } from 'react'
import { LoaderCircle, Menu, Plus, RefreshCw, Sparkles } from 'lucide-react'
import { getProducts, type Product } from '../api/products'

type ProductsPageProps = {
  onOpenMenu: () => void
}

export function ProductsPage({ onOpenMenu }: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function loadProducts() {
    setIsLoading(true)
    setError('')

    try {
      setProducts(await getProducts())
    } catch (requestError) {
      console.error('Could not load products:', requestError)
      setError('Could not load products. Check that the server is running.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()

    getProducts(controller.signal)
      .then(setProducts)
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return
        console.error('Could not load products:', requestError)
        setError('Could not load products. Check that the server is running.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [])

  function showAddProductNotice() {
    setNotice('Adding products will be connected next.')
    window.setTimeout(() => setNotice(''), 2200)
  }

  return (
    <>
      <div className="mx-auto flex h-screen max-w-[1320px] flex-col overflow-hidden px-5 py-7 sm:px-8 lg:px-12 lg:py-11">
        <header className="mb-10 flex shrink-0 items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <button aria-label="Open navigation" className="mt-1 rounded-lg border border-zinc-200 bg-white p-2 md:hidden" onClick={onOpenMenu}>
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Products</h1>
              <p className="mt-1 text-sm text-zinc-400">
                {isLoading ? 'Loading listings...' : `${products.length} listings`}
              </p>
            </div>
          </div>
          <button onClick={showAddProductNotice} className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-700 active:scale-[0.98] sm:px-6">
            <Plus size={17} />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </button>
        </header>

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="grid shrink-0 grid-cols-[1fr_90px] border-b border-zinc-100 px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400 sm:grid-cols-[1fr_120px_100px] sm:px-7">
            <span>Product</span>
            <span className="hidden sm:block">Price</span>
            <span className="text-right sm:text-left">Stock</span>
          </div>

          <div className="min-h-0 overflow-y-auto">
            {isLoading && (
              <div className="grid h-48 place-items-center text-sm text-zinc-400">
                <span className="flex items-center gap-2"><LoaderCircle size={18} className="animate-spin" /> Loading products...</span>
              </div>
            )}

            {!isLoading && error && (
              <div className="grid h-48 place-items-center px-6 text-center">
                <div>
                  <p className="text-sm text-red-600">{error}</p>
                  <button onClick={() => void loadProducts()} className="mx-auto mt-4 flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                    <RefreshCw size={15} /> Try again
                  </button>
                </div>
              </div>
            )}

            {!isLoading && !error && products.length === 0 && (
              <div className="grid h-48 place-items-center text-sm text-zinc-400">No products found.</div>
            )}

            {!isLoading && !error && products.map((product) => (
              <article key={product.id} className="grid grid-cols-[1fr_90px] items-center gap-3 border-b border-zinc-100 px-5 py-4 last:border-0 sm:grid-cols-[1fr_120px_100px] sm:px-7">
                <div className="flex min-w-0 items-center gap-4">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-xl bg-zinc-100 object-cover" />
                  ) : (
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-50 text-xs font-bold text-indigo-700">
                      {getInitials(product.name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-zinc-900">{product.name}</h2>
                    <p className="mt-1 truncate text-xs text-zinc-400">{product.description ?? 'No description'}</p>
                    <p className="mt-1 text-xs font-medium text-zinc-600 sm:hidden">${product.price.toFixed(2)}</p>
                  </div>
                </div>
                <span className="hidden font-mono text-sm text-zinc-700 sm:block">${product.price.toFixed(2)}</span>
                <span className={`text-right text-sm font-semibold sm:text-left ${product.stock <= 3 ? 'text-red-500' : product.stock <= 10 ? 'text-amber-600' : 'text-zinc-700'}`}>
                  {product.stock}
                </span>
              </article>
            ))}
          </div>
        </section>
      </div>

      {notice && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm text-white shadow-xl">
          <Sparkles size={16} className="text-indigo-400" /> {notice}
        </div>
      )}
    </>
  )
}

function getInitials(name: string) {
  return name.split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase()
}
