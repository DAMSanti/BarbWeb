import { ArrowRight, Shield, Zap, Lock, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import ChessboardBackground from '../components/ChessboardBackground'

export default function ClassicLayout() {
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
    <div className="w-full relative">
      <ChessboardBackground
        imageUrl="https://t3.ftcdn.net/jpg/04/29/98/02/360_F_429980259_3jA8o7Zw4UVIRrWQxRKf3sZrnQTIX4ZR.jpg"
        opacity={0.25}
        blurAmount={12}
        parallaxIntensity={0.5}
      />
      
      <section className="hero-section relative overflow-hidden py-20 lg:py-32 transition-colors duration-500">
        <div className="hero-accent hero-accent-a" aria-hidden="true" />
        <div className="hero-accent hero-accent-b" style={{ animationDelay: '2s' }} aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hero-content text-center mt-10 lg:mt-16">
            <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Consultas Legales <span className="hero-highlight">Profesionales</span>
            </h1>
            <p className="hero-paragraph text-lg sm:text-xl max-w-3xl mx-auto mb-8">
              Barbara & Abogados te ofrece respuestas legales inmediatas o asesoramiento profesional personalizado. Nuestro sistema inteligente filtra tus dudas y las resuelve automáticamente cuando es posible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/faq" className="primary-button inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold group">
                Hacer Consulta
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <a href="#features" className="secondary-button inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold">
                Conocer Más
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features-section py-20 lg:py-28 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="features-heading text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              ¿Por qué elegirnos?
            </h2>
            <p className="features-subheading text-lg max-w-2xl mx-auto">
              Combinamos tecnología inteligente con experiencia legal para ofrecerte la mejor solución.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="feature-card card-hover">
                  <div className="feature-card-icon w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon size={24} />
                  </div>
                  <h3 className="feature-card-title text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="feature-card-text text-sm sm:text-base leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="services-section py-20 lg:py-28 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="services-heading text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Nuestras Áreas de Especialización
            </h2>
            <p className="services-subheading text-lg max-w-2xl mx-auto">
              Contamos con expertos en todas las ramas del derecho para ayudarte.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="service-card rounded-xl transition-all">
                <h3 className="service-card-title text-xl font-bold mb-2">{service.name}</h3>
                <p className="service-card-text text-sm sm:text-base mb-4">{service.description}</p>
                <Link to="/faq" className="service-card-link inline-flex items-center font-semibold group">
                  Consultar
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section py-20 lg:py-28 transition-colors duration-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="cta-title text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            ¿Tienes una pregunta legal?
          </h2>
          <p className="cta-text text-lg mb-8">
            Comienza ahora a filtrar tus dudas y obtén respuestas inmediatas o solicita una consulta profesional.
          </p>
          <Link to="/faq" className="cta-button inline-flex items-center px-8 py-4 rounded-lg font-bold group">
            Empezar Consulta Gratuita
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
          </Link>
        </div>
      </section>

      <section id="contacto" className="about-section py-20 lg:py-28 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="about-title text-3xl sm:text-4xl font-bold mb-6">
                Sobre Barbara & Abogados
              </h2>
              <p className="about-text text-lg mb-4">
                Dña. Bárbara Blasco García lidera un equipo de abogados especializados comprometidos con hacer la justicia más accesible. Con amplia experiencia en diversas áreas del derecho, combinamos nuestro conocimiento legal con tecnología innovadora.
              </p>
              <p className="about-text text-lg mb-6">
                Nuestro sistema inteligente de filtrado de preguntas permite que muchas consultas se resuelvan de forma automática, lo que nos permite ofrecer servicios más rápidos y personalizados.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="about-checklist-icon flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
                    <span className="font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="about-checklist-title font-bold">Expertos Certificados</h4>
                    <p className="about-checklist-text">Todos nuestros abogados cuentan con certificaciones profesionales</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="about-checklist-icon flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
                    <span className="font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="about-checklist-title font-bold">Disponibilidad 24/7</h4>
                    <p className="about-checklist-text">Accede a respuestas en cualquier momento del día</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="about-checklist-icon flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
                    <span className="font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="about-checklist-title font-bold">Privacidad Garantizada</h4>
                    <p className="about-checklist-text">Confidencialidad asegurada en todas tus consultas</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="commitment-card rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold mb-6">Nuestro Compromiso</h3>
              <div className="space-y-6">
                <div>
                  <div className="commitment-number text-4xl font-bold mb-2">500+</div>
                  <p className="commitment-label">Consultas resueltas mensualmente</p>
                </div>
                <div>
                  <div className="commitment-number text-4xl font-bold mb-2">95%</div>
                  <p className="commitment-label">Satisfacción de clientes</p>
                </div>
                <div>
                  <div className="commitment-number text-4xl font-bold mb-2">Profesional</div>
                  <p className="commitment-label">Atención personalizada y experta</p>
                </div>
                <div>
                  <div className="commitment-number text-4xl font-bold mb-2">6</div>
                  <p className="commitment-label">Áreas de especialización</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
