import { Link } from 'react-router-dom'
import { Scale, Phone, Mail } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <Scale className="text-white" size={24} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">Bufete Jurídico</h1>
              <p className="text-xs text-gray-500">Consultas Legales Rápidas</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Inicio
            </Link>
            <Link to="/faq" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Consultas
            </Link>
            <a href="#contacto" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Contacto
            </a>
          </nav>

          {/* Contact Info */}
          <div className="hidden lg:flex items-center space-x-6">
            <a
              href="tel:+34900000000"
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Phone size={18} />
              <span className="text-sm">+34 900 000 000</span>
            </a>
            <a
              href="mailto:info@bufete.es"
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Mail size={18} />
              <span className="text-sm">info@bufete.es</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
