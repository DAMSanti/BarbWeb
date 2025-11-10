import { Link } from 'react-router-dom'
import { Scale, Phone, Mail } from 'lucide-react'

export default function Header() {
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

          {/* Contact Info */}
          <div className="header-contact hidden lg:flex items-center space-x-6">
            <a href="tel:+34672722452" className="header-contact-link flex items-center space-x-2">
              <Phone size={18} />
              <span className="text-sm">+34 672 722 452</span>
            </a>
            <a href="mailto:bgarcia@icacantabria.es" className="header-contact-link flex items-center space-x-2">
              <Mail size={18} />
              <span className="text-sm">bgarcia@icacantabria.es</span>
            </a>
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
