import { useState } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import { Menu, X, BarChart3, Users, CreditCard, TrendingUp, LogOut } from 'lucide-react'
import { useAppStore } from '../store/appStore'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const { logout } = useAppStore()

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: BarChart3 },
    { path: '/admin/users', label: 'Usuarios', icon: Users },
    { path: '/admin/payments', label: 'Pagos', icon: CreditCard },
    { path: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
  ]

  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className={`font-bold text-xl ${sidebarOpen ? 'block' : 'hidden'}`} style={{ color: 'var(--accent-color)' }}>
              ADMIN
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                style={
                  isActive(item.path)
                    ? { backgroundColor: 'var(--accent-color)' }
                    : undefined
                }
              >
                <Icon size={20} />
                <span className={sidebarOpen ? 'block' : 'hidden'}>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors"
          >
            <LogOut size={20} />
            <span className={sidebarOpen ? 'block' : 'hidden'}>Salir</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {menuItems.find((m) => isActive(m.path))?.label || 'Admin Panel'}
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
