import { Link } from 'react-router-dom'
import { Scale, LogIn, LogOut, User, Settings, Shield } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { useState, useRef, useEffect } from 'react'

export default function Header() {
  const { user, isAuthenticated, logout } = useAppStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
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

  return (
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
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-primary-color bg-opacity-10 hover:bg-opacity-20 transition-all"
                >
                  <User size={18} />
                  <span className="text-sm font-semibold">{user.name || user.email}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* Mi Cuenta */}
                    <Link
                      to="/account"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-gray-700"
                    >
                      <Settings size={16} />
                      <span className="text-sm">Mi Cuenta</span>
                    </Link>

                    {/* Admin Panel - Solo si es admin */}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-gray-700"
                      >
                        <Shield size={16} />
                        <span className="text-sm">Administración</span>
                      </Link>
                    )}

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-2"></div>

                    {/* Salir */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-red-50 text-red-600 text-left"
                    >
                      <LogOut size={16} />
                      <span className="text-sm">Salir</span>
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
  )
}
