import { ArrowRight, Shield, Zap, Lock, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const features = [
    {
      icon: Zap,
      title: 'Respuestas Inmediatas',
      description: 'Obtén soluciones automáticas a preguntas legales comunes en segundos.',
    },
    {
      icon: Lock,
      title: 'Seguridad Garantizada',
      description: 'Tus datos están protegidos con encriptación de nivel bancario.',
    },
    {
      icon: Shield,
      title: 'Asesoramiento Profesional',
      description: 'Accede a consultas de abogados experimentados cuando las necesites.',
    },
    {
      icon: Users,
      title: 'Equipo Especializado',
      description: 'Contamos con expertos en todas las áreas del derecho.',
    },
  ]

  const services = [
    { name: 'Derecho Civil', description: 'Daños, responsabilidad, contratos' },
    { name: 'Derecho Penal', description: 'Asesoramiento en procedimientos penales' },
    { name: 'Derecho Laboral', description: 'Conflictos laborales y despidos' },
    { name: 'Derecho Administrativo', description: 'Recursos administrativos' },
    { name: 'Derecho Mercantil', description: 'Contratos y operaciones comerciales' },
    { name: 'Derecho de Familia', description: 'Divorcios, custodia, herencias' },
  ]

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-dark-500 via-dark-600 to-dark-700 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full mix-blend-lighten filter blur-3xl animate-float"></div>
          <div className="absolute -bottom-8 right-10 w-72 h-72 bg-primary-600 rounded-full mix-blend-lighten filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Consultas Legales <span className="text-primary-500">Profesionales</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
              Barbara & Abogados te ofrece respuestas legales inmediatas o asesoramiento profesional personalizado. Nuestro sistema inteligente filtra tus dudas y las resuelve automáticamente cuando es posible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/faq"
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-primary-500 text-dark-500 font-semibold hover:bg-primary-600 transition-all shadow-lg hover:shadow-primary-500/50 group"
              >
                Hacer Consulta
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg border-2 border-primary-500 text-primary-500 font-semibold hover:bg-primary-500 hover:text-dark-500 transition-all"
              >
                Conocer Más
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              ¿Por qué elegirnos?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Combinamos tecnología inteligente con experiencia legal para ofrecerte la mejor solución.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="p-8 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all card-hover"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-primary-600" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Nuestras Áreas de Especialización
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Contamos con expertos en todas las ramas del derecho para ayudarte.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <Link
                  to="/faq"
                  className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 group"
                >
                  Consultar
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-dark-500 mb-6">
            ¿Tienes una pregunta legal?
          </h2>
          <p className="text-lg text-dark-600 mb-8">
            Comienza ahora a filtrar tus dudas y obtén respuestas inmediatas o solicita una consulta profesional.
          </p>
          <Link
            to="/faq"
            className="inline-flex items-center px-8 py-4 rounded-lg bg-dark-500 text-primary-500 font-bold hover:bg-dark-600 transition-all shadow-lg group"
          >
            Empezar Consulta Gratuita
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section id="contacto" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Sobre Barbara & Abogados
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Dña. Bárbara Rueda García lidera un equipo de abogados especializados comprometidos con hacer la justicia más accesible. Con amplia experiencia en diversas áreas del derecho, combinamos nuestro conocimiento legal con tecnología innovadora.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Nuestro sistema inteligente de filtrado de preguntas permite que muchas consultas se resuelvan de forma automática, lo que nos permite ofrecer servicios más rápidos y personalizados.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Expertos Certificados</h4>
                    <p className="text-gray-600">Todos nuestros abogados cuentan con certificaciones profesionales</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Disponibilidad 24/7</h4>
                    <p className="text-gray-600">Accede a respuestas en cualquier momento del día</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Privacidad Garantizada</h4>
                    <p className="text-gray-600">Confidencialidad asegurada en todas tus consultas</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-8 text-white shadow-2xl">
              <h3 className="text-2xl font-bold mb-6">Nuestro Compromiso</h3>
              <div className="space-y-6">
                <div>
                  <div className="text-4xl font-bold mb-2 text-dark-500">500+</div>
                  <p className="text-primary-100">Consultas resueltas mensualmente</p>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2 text-dark-500">95%</div>
                  <p className="text-primary-100">Satisfacción de clientes</p>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2 text-dark-500">Profesional</div>
                  <p className="text-primary-100">Atención personalizada y experta</p>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2 text-dark-500">6</div>
                  <p className="text-primary-100">Áreas de especialización</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
