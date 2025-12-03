import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Linkedin, Twitter } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer mt-auto pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="footer-heading text-lg font-bold mb-4">BARBARA & ABOGADOS</h3>
            <p className="footer-text text-sm leading-relaxed mb-3">
              Dña. Bárbara Blasco García
            </p>
            <p className="footer-text-muted text-sm leading-relaxed">
              Ofrecemos consultas legales rápidas, seguras y profesionales. Accede a respuestas inmediatas o solicita asesoramiento especializado.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="footer-heading text-lg font-bold mb-4">Áreas de Práctica</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/faq" className="footer-link">Derecho Civil</Link></li>
              <li><Link to="/faq" className="footer-link">Derecho Penal</Link></li>
              <li><Link to="/faq" className="footer-link">Derecho Laboral</Link></li>
              <li><Link to="/faq" className="footer-link">Derecho Administrativo</Link></li>
              <li><Link to="/faq" className="footer-link">Derecho Mercantil</Link></li>
              <li><Link to="/faq" className="footer-link">Derecho de Familia</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="footer-heading text-lg font-bold mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2 footer-text">
                <MapPin size={16} className="footer-icon" aria-hidden="true" />
                <span>Blv. Demetrio Herrero 1, Entlo A<br />Torrelabega, Cantabria<br />España</span>
              </li>
              <li className="flex items-center space-x-2 footer-text">
                <Phone size={16} className="footer-icon" aria-hidden="true" />
                <a href="tel:+34672722452" className="footer-link">+34 672 722 452</a>
              </li>
              <li className="flex items-center space-x-2 footer-text">
                <Mail size={16} className="footer-icon" aria-hidden="true" />
                <a href="mailto:abogados.bgarcia@gmail.com" className="footer-link">abogados.bgarcia@gmail.com</a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="footer-heading text-lg font-bold mb-4">Síguenos</h4>
            <div className="flex space-x-4">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-link text-base" aria-label="LinkedIn">
                <Linkedin size={20} aria-hidden="true" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-link text-base" aria-label="Twitter">
                <Twitter size={20} aria-hidden="true" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-link text-base" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="footer-copy">&copy; {currentYear} Barbara & Abogados. Todos los derechos reservados.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="footer-link">Política de Privacidad</Link>
              <Link to="/terms" className="footer-link">Términos de Servicio</Link>
              <Link to="/terms" className="footer-link">Aviso Legal</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
