import { useEffect, useState } from 'react'
import { LayoutGrid, List, LoaderCircle, Menu, Pencil, Plus, RefreshCw, Sparkles, Trash2 } from 'lucide-react'
import { getProducts, type Product } from '../api/products'
import { DeleteProductDialog } from '../components/DeleteProductDialog'
import { ProductDetailsDialog } from '../components/ProductDetailsDialog'
import { ProductDialog } from '../components/ProductDialog'
import { ProductCard } from '../components/ProductCard'

type ProductsPageProps = {
  onOpenMenu: () => void
}

export function ProductsPage({ onOpenMenu }: ProductsPageProps) {
  const [view, setView] = useState<'cards' | 'list'>('cards')
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

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
          <button onClick={() => setIsAddingProduct(true)} className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-700 active:scale-[0.98] sm:px-6">
            <Plus size={17} />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </button>
        </header>

        <div className="mb-4 flex shrink-0 justify-end">
          <div className="flex rounded-xl border border-zinc-200 bg-white p-1" aria-label="Product layout">
            <button type="button" aria-label="Card view" title="Card view" aria-pressed={view === 'cards'} onClick={() => setView('cards')} className={`rounded-lg p-2 transition ${view === 'cards' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700'}`}><LayoutGrid size={17} /></button>
            <button type="button" aria-label="List view" title="List view" aria-pressed={view === 'list'} onClick={() => setView('list')} className={`rounded-lg p-2 transition ${view === 'list' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700'}`}><List size={17} /></button>
          </div>
        </div>

        <section className={`min-h-0 flex-1 overflow-y-auto ${view === 'list' ? 'rounded-2xl border border-zinc-200 bg-white' : ''}`}>
          {view === 'list' && (
            <div className="sticky top-0 z-10 grid grid-cols-[1fr_70px_84px] border-b border-zinc-100 bg-white px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400 sm:grid-cols-[1fr_120px_90px_96px] sm:px-7">
              <span>Product</span>
              <span className="hidden sm:block">Price</span>
              <span className="text-right sm:text-left">Stock</span><span className="sr-only">Actions</span>
            </div>
          )}

            {isLoading && (
              <div className="grid h-48 place-items-center rounded-2xl border border-zinc-200 bg-white text-sm text-zinc-400">
                <span className="flex items-center gap-2"><LoaderCircle size={18} className="animate-spin" /> Loading products...</span>
              </div>
            )}

            {!isLoading && error && (
              <div className="grid h-48 place-items-center rounded-2xl border border-zinc-200 bg-white px-6 text-center">
                <div>
                  <p className="text-sm text-red-600">{error}</p>
                  <button onClick={() => void loadProducts()} className="mx-auto mt-4 flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                    <RefreshCw size={15} /> Try again
                  </button>
                </div>
              </div>
            )}

            {!isLoading && !error && products.length === 0 && (
              <div className="grid h-48 place-items-center rounded-2xl border border-zinc-200 bg-white text-sm text-zinc-400">No products found.</div>
            )}

            {!isLoading && !error && view === 'cards' && (
              <div className="grid gap-5 pb-2 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} onEdit={setEditingProduct} onDelete={setDeletingProduct} />
                ))}
              </div>
            )}

            {!isLoading && !error && view === 'list' && products.map((product) => (
              <article
                key={product.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedProduct(product)}
                onKeyDown={(event) => {
                  if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault()
                    setSelectedProduct(product)
                  }
                }}
                className="grid cursor-pointer grid-cols-[1fr_70px_84px] items-center gap-3 border-b border-zinc-100 px-5 py-4 transition last:border-0 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 sm:grid-cols-[1fr_120px_90px_96px] sm:px-7"
              >
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
                <div className="flex justify-end gap-2">
                  <button onClick={(event) => { event.stopPropagation(); setEditingProduct(product) }} aria-label={`Edit ${product.name}`} className="rounded-lg border border-zinc-200 p-2 text-zinc-500 transition hover:bg-white hover:text-zinc-900"><Pencil size={15} /></button>
                  <button onClick={(event) => { event.stopPropagation(); setDeletingProduct(product) }} aria-label={`Delete ${product.name}`} className="rounded-lg border border-zinc-200 p-2 text-zinc-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
                </div>
              </article>
            ))}
        </section>
      </div>

      {notice && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm text-white shadow-xl">
          <Sparkles size={16} className="text-indigo-400" /> {notice}
        </div>
      )}

      {editingProduct && (
        <ProductDialog
          product={editingProduct}
          onCancel={() => setEditingProduct(null)}
          onUpdated={(updatedProduct) => {
            setProducts((current) => current.map((product) => product.id === updatedProduct.id ? updatedProduct : product))
            setEditingProduct(null)
            setNotice('Product updated successfully.')
            window.setTimeout(() => setNotice(''), 2200)
          }}
        />
      )}

      {isAddingProduct && (
        <ProductDialog
          onCancel={() => setIsAddingProduct(false)}
          onSaved={(newProduct) => {
            setProducts((current) => [newProduct, ...current])
            setIsAddingProduct(false)
            setNotice('Product added successfully.')
            window.setTimeout(() => setNotice(''), 2200)
          }}
        />
      )}

      {deletingProduct && (
        <DeleteProductDialog
          product={deletingProduct}
          onCancel={() => setDeletingProduct(null)}
          onDeleted={(productId) => {
            setProducts((current) => current.filter((product) => product.id !== productId))
            setDeletingProduct(null)
            setNotice('Product deleted successfully.')
            window.setTimeout(() => setNotice(''), 2200)
          }}
        />
      )}

      {selectedProduct && (
        <ProductDetailsDialog product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </>
  )
}

function getInitials(name: string) {
  return name.split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase()
}
