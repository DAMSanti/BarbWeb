import { Link, useNavigate } from 'react-router-dom'
import { Scale, Phone, Mail, LogOut, Settings, User as UserIcon } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { useState } from 'react'

export default function Header() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAppStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  // Debug
  console.log('Header - isAuthenticated:', isAuthenticated, 'user:', user)

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    navigate('/')
  }

  const handleLoginClick = () => {
    navigate('/login')
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
            <a href="#contacto" className="header-link font-medium">
              Contacto
            </a>
          </nav>

          {/* Contact Info & Auth */}
          <div className="header-contact hidden lg:flex items-center space-x-6">
            <a href="tel:+34672722452" className="header-contact-link flex items-center space-x-2">
              <Phone size={18} />
              <span className="text-sm">+34 672 722 452</span>
            </a>
            <a href="mailto:bgarcia@icacantabria.es" className="header-contact-link flex items-center space-x-2">
              <Mail size={18} />
              <span className="text-sm">bgarcia@icacantabria.es</span>
            </a>

            {/* Auth Buttons or User Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-slate-700 transition"
                >
                  <UserIcon size={18} />
                  <span className="text-sm font-medium">{user.name || user.email}</span>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-slate-700">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                    <a href="#profile" className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-slate-700 transition">
                      <UserIcon size={16} />
                      <span>Mi Perfil</span>
                    </a>
                    <a href="#settings" className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-slate-700 transition">
                      <Settings size={16} />
                      <span>Configuración</span>
                    </a>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm hover:bg-slate-700 transition text-red-400 border-t border-slate-700"
                    >
                      <LogOut size={16} />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleLoginClick}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                Iniciar Sesión
              </button>
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
