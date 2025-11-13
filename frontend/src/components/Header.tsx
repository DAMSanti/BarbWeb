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
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="site-header-inner flex items-center justify-between h-16 relative">
            {/* Logo - Left */}
            <Link to="/" className="logo-link flex items-center space-x-3 flex-shrink-0 z-10">
              <div className="logo-mark w-10 h-10 rounded-lg flex items-center justify-center shadow-md">
                <Scale className="logo-mark-icon" size={24} />
              </div>
              <div className="hidden sm:block">
                <h1 className="logo-title text-xl font-bold">BARBARA & ABOGADOS</h1>
                <p className="logo-subtitle text-xs">Dña. Bárbara Blasco García</p>
              </div>
            </Link>

            {/* Navigation - Center (Absolutely Centered) */}
            <nav className="main-nav hidden md:flex space-x-8 absolute left-1/2 -translate-x-1/2">
              <Link to="/" className="header-link font-medium">
                Inicio
              </Link>
              <Link to="/faq" className="header-link font-medium">
                Consultas
              </Link>
            </nav>

            {/* Auth Actions - Right */}
            <div className="header-contact hidden lg:flex items-center space-x-6 flex-shrink-0 z-10">
              {isAuthenticated && user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{
                      background: 'linear-gradient(135deg, #d4af37, #8b2e1f)',
                      borderColor: '#6b1f12',
                      color: '#ffffff'
                    }}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:opacity-90 border transition-all duration-200"
                  >
                    <User size={18} style={{ color: '#ffffff' }} />
                    <span className="text-sm font-semibold" style={{ color: '#ffffff' }}>{user.name || user.email}</span>
                    <ChevronDown size={16} style={{ color: '#ffffff', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                  </button>

                  {/* Dropdown Menu - Dark Theme */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-black rounded-xl shadow-2xl border border-neutral-700 py-2 z-50 overflow-hidden">
                      {/* Header del dropdown */}
                      <div className="px-4 py-3 border-b border-neutral-700 bg-black">
                        <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Cuenta</p>
                      </div>

                      {/* Mi Cuenta */}
                      <button
                        onClick={handleSettings}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-neutral-800 text-neutral-200 hover:text-amber-400 transition-colors"
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
                            className="flex items-center space-x-3 px-4 py-3 hover:bg-neutral-800 text-neutral-200 hover:text-amber-400 transition-colors"
                          >
                            <Shield size={18} />
                            <span className="text-sm font-medium">Administración</span>
                          </Link>
                        </>
                      )}

                      {/* Divider */}
                      <div className="border-t border-neutral-800 my-2"></div>

                      {/* Salir */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-neutral-800 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <LogOut size={18} />
                        <span className="text-sm font-medium">Salir</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  to="/login" 
                  style={{
                    background: 'linear-gradient(135deg, #d4af37, #8b2e1f)',
                    color: '#ffffff'
                  }}
                  className="header-contact-link flex items-center space-x-2 hover:opacity-90 px-4 py-2 rounded-lg border border-transparent transition-all duration-200"
                >
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
            className="bg-gradient-to-br from-slate-950 to-black rounded-2xl shadow-2xl border border-amber-700 border-opacity-40 max-w-md w-full mx-4 p-0 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-black via-slate-900 to-black px-6 py-4 border-b border-amber-700 border-opacity-40">
              <h2 className="text-xl font-bold text-amber-400 flex items-center space-x-2">
                <Settings size={24} />
                <span>Mi Cuenta</span>
              </h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Usuario Info */}
              <div className="bg-black bg-opacity-50 rounded-lg p-4 border border-amber-700 border-opacity-30">
                <p className="text-xs text-amber-600 uppercase font-semibold mb-2 tracking-widest">Información</p>
                <div className="space-y-3">
                  <div>
                    <span className="text-amber-700 text-xs font-semibold">Nombre</span>
                    <p className="text-slate-100 font-medium mt-1">{user?.name || 'No especificado'}</p>
                  </div>
                  <div>
                    <span className="text-amber-700 text-xs font-semibold">Email</span>
                    <p className="text-slate-100 font-medium mt-1">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Opciones */}
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-black hover:bg-slate-950 border border-amber-700 border-opacity-40 hover:border-opacity-60 rounded-lg text-amber-400 font-medium transition-all text-sm">
                  Cambiar Contraseña
                </button>
                <button className="w-full px-4 py-2 bg-black hover:bg-slate-950 border border-amber-700 border-opacity-40 hover:border-opacity-60 rounded-lg text-amber-400 font-medium transition-all text-sm">
                  Actualizar Perfil
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-black bg-opacity-30 px-6 py-4 border-t border-amber-700 border-opacity-40 flex space-x-3">
              <button
                onClick={() => setSettingsOpen(false)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-black font-semibold rounded-lg transition-all text-sm"
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
