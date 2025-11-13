import { Link } from 'react-router-dom'
import { Scale, LogIn, LogOut, User, Settings, Shield, ChevronDown } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { useState, useRef, useEffect } from 'react'

export default function Header() {
  const { user, isAuthenticated, logout } = useAppStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isAdmin = user?.role === 'admin'

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
  }

  const handleSettings = () => {
    setSettingsOpen(true)
    setDropdownOpen(false)
  }

  return (
    <>
      <header className="site-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="site-header-inner flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="logo-link flex items-center space-x-3">
              <div className="logo-mark w-10 h-10 rounded-lg flex items-center justify-center shadow-md">
                <Scale className="logo-mark-icon" size={24} />
              </div>
              <div className="hidden sm:block">
                <h1 className="logo-title text-xl font-bold">BARBARA & ABOGADOS</h1>
                <p className="logo-subtitle text-xs">Dña. Bárbara Blasco García</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="main-nav hidden md:flex space-x-8">
              <Link to="/" className="header-link font-medium">
                Inicio
              </Link>
              <Link to="/faq" className="header-link font-medium">
                Consultas
              </Link>
            </nav>

            {/* Auth Actions */}
            <div className="header-contact hidden lg:flex items-center space-x-6">
              {isAuthenticated && user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 border border-slate-600 transition-all duration-200"
                  >
                    <User size={18} className="text-amber-400" />
                    <span className="text-sm font-semibold text-slate-100">{user.name || user.email}</span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu - Dark Theme */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl shadow-2xl border border-slate-700 py-2 z-50 overflow-hidden">
                      {/* Header del dropdown */}
                      <div className="px-4 py-3 border-b border-slate-700 bg-slate-800 bg-opacity-50">
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Cuenta</p>
                      </div>

                      {/* Mi Cuenta */}
                      <button
                        onClick={handleSettings}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-800 text-slate-200 hover:text-amber-400 transition-colors"
                      >
                        <Settings size={18} />
                        <span className="text-sm font-medium">Mi Cuenta</span>
                      </button>

                      {/* Admin Panel - Solo si es admin */}
                      {isAdmin && (
                        <>
                          <Link
                            to="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 hover:bg-slate-800 text-slate-200 hover:text-amber-400 transition-colors"
                          >
                            <Shield size={18} />
                            <span className="text-sm font-medium">Administración</span>
                          </Link>
                        </>
                      )}

                      {/* Divider */}
                      <div className="border-t border-slate-700 my-2"></div>

                      {/* Salir */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-950 hover:bg-opacity-50 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <LogOut size={18} />
                        <span className="text-sm font-medium">Salir</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="header-contact-link flex items-center space-x-2 bg-accent-color text-accent-contrast hover:opacity-90">
                  <LogIn size={18} />
                  <span className="text-sm font-semibold">Login</span>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button className="header-mobile-btn md:hidden p-2 rounded-lg">
              <svg className="header-mobile-icon w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Settings Dialog */}
      {settingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSettingsOpen(false)}>
          <div
            className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl shadow-2xl border border-slate-700 max-w-md w-full mx-4 p-0 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
                <Settings size={24} className="text-amber-400" />
                <span>Mi Cuenta</span>
              </h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Usuario Info */}
              <div className="bg-slate-800 bg-opacity-50 rounded-lg p-4 border border-slate-700">
                <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Información</p>
                <div className="space-y-2">
                  <div>
                    <span className="text-slate-400 text-sm">Nombre:</span>
                    <p className="text-slate-100 font-medium">{user?.name || 'No especificado'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm">Email:</span>
                    <p className="text-slate-100 font-medium">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Opciones */}
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-100 font-medium transition-colors text-sm">
                  Cambiar Contraseña
                </button>
                <button className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-100 font-medium transition-colors text-sm">
                  Actualizar Perfil
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-800 bg-opacity-30 px-6 py-4 border-t border-slate-700 flex space-x-3">
              <button
                onClick={() => setSettingsOpen(false)}
                className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
