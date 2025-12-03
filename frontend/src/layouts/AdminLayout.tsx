import { useState } from 'react'
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom'
import { Menu, X, BarChart3, Users, CreditCard, TrendingUp, LogOut, AlertCircle } from 'lucide-react'
import { useAppStore } from '../store/appStore'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAppStore()

  // Verificar si el usuario es admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle size={64} className="mx-auto text-red-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">No tienes permisos para acceder al panel administrativo.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Ir al Inicio
          </button>
        </div>
      </div>
    )
  }

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: BarChart3 },
    { path: '/admin/users', label: 'Usuarios', icon: Users },
    { path: '/admin/payments', label: 'Pagos', icon: CreditCard },
    { path: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
  ]

  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/login')
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
            <h1 className={`font-bold text-xl text-gray-800 ${sidebarOpen ? 'block' : 'hidden'}`}>
              ADMIN
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={sidebarOpen ? 'Cerrar menú lateral' : 'Abrir menú lateral'}
              title={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
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
                    ? 'text-gray-900 font-semibold'
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
