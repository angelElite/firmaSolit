import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Clientes', href: '/clients' },
  { name: 'Pedidos', href: '/orders' },
]

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-primary-900 text-white flex flex-col">
        <div className="flex h-16 items-center px-6 border-b border-primary-700">
          <span className="text-xl font-bold tracking-tight">SGPC</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive =
              item.href === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-primary-700 p-4">
          <div className="mb-2 text-sm text-primary-200 truncate">{user?.nombre}</div>
          <div className="mb-3 text-xs text-primary-300 truncate">{user?.email}</div>
          <button
            onClick={handleLogout}
            className="w-full rounded-md bg-primary-700 px-3 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
