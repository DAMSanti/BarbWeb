import { MapPin, Phone, Mail, Linkedin, Twitter } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">Bufete Jurídico</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Ofrecemos consultas legales rápidas, seguras y asequibles. Accede a respuestas inmediatas o solicita asesoramiento profesional.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-4">Áreas de Práctica</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Derecho Civil</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Derecho Penal</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Derecho Laboral</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Derecho Administrativo</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Derecho Mercantil</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Derecho de Familia</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center space-x-2">
                <MapPin size={16} className="text-primary-500" />
                <span>Calle Principal, 123<br />Madrid, España</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={16} className="text-primary-500" />
                <a href="tel:+34900000000" className="hover:text-white transition-colors">+34 900 000 000</a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={16} className="text-primary-500" />
                <a href="mailto:info@bufete.es" className="hover:text-white transition-colors">info@bufete.es</a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-lg font-bold mb-4">Síguenos</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22.5C6.2 22.5 1.5 17.8 1.5 12S6.2 1.5 12 1.5 22.5 6.2 22.5 12 17.8 22.5 12 22.5z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; {currentYear} Bufete Jurídico. Todos los derechos reservados.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Política de Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Términos de Servicio</a>
              <a href="#" className="hover:text-white transition-colors">Aviso Legal</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
