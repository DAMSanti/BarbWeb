import { Link } from 'react-router-dom'
import { Scale, Phone, Mail, LogIn, LogOut, User } from 'lucide-react'
import { useAppStore } from '../store/appStore'

export default function Header() {
  const { user, isAuthenticated, logout } = useAppStore()

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

          {/* Contact Info & Auth Actions */}
          <div className="header-contact hidden lg:flex items-center space-x-6">
            <a href="tel:+34672722452" className="header-contact-link flex items-center space-x-2">
              <Phone size={18} />
              <span className="text-sm">+34 672 722 452</span>
            </a>
            <a href="mailto:abogados.bgarcia@gmail.com" className="header-contact-link flex items-center space-x-2">
              <Mail size={18} />
              <span className="text-sm">abogados.bgarcia@gmail.com</span>
            </a>
            
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-primary-color bg-opacity-10">
                  <User size={18} />
                  <span className="text-sm font-semibold">{user.name || user.email}</span>
                </div>
                <button
                  onClick={logout}
                  className="header-contact-link flex items-center space-x-2 bg-red-600 text-white hover:bg-red-700"
                >
                  <LogOut size={18} />
                  <span className="text-sm font-semibold">Salir</span>
                </button>
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
