import { useState } from 'react'
import { Cuboid, Grid2X2, Package, ShoppingCart, X } from 'lucide-react'
import { Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { DashboardPage } from './pages/DashboardPage'
import { OrdersPage } from './pages/OrdersPage'
import { ProductsPage } from './pages/ProductsPage'
import './App.css'

const navItems = [
  { label: 'Dashboard', path: '/', icon: Grid2X2 },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Orders', path: '/orders', icon: ShoppingCart },
]

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const openMenu = () => setSidebarOpen(true)

  return (
    <div className="min-h-screen bg-[#f7f7f9]">
      {sidebarOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#09090b] text-white transition-transform duration-200 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-22 items-center justify-between border-b border-white/10 px-7">
          <div className="flex items-center gap-3 font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600">
              <Cuboid size={18} />
            </span>
            <span>StoreAdmin</span>
          </div>
          <button aria-label="Close navigation" className="text-zinc-400 md:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={22} />
          </button>
        </div>

        <nav className="space-y-2 p-4">
          {navItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={label}
              to={path}
              end={path === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200'}`}
            >
              {({ isActive }) => (
                <>
                  <Icon size={19} className={isActive ? 'text-indigo-400' : ''} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 px-7 py-6 text-xs text-zinc-600">
          v1.0&nbsp;&nbsp;·&nbsp;&nbsp;2026
        </div>
      </aside>

      <main className="min-h-screen md:ml-64">
        <Routes>
          <Route path="/" element={<DashboardPage onOpenMenu={openMenu} onNavigate={(page) => navigate(`/${page.toLowerCase()}`)} />} />
          <Route path="/products" element={<ProductsPage onOpenMenu={openMenu} />} />
          <Route path="/orders" element={<OrdersPage onOpenMenu={openMenu} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
