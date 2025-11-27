import { SEO } from '../components/SEO'

export default function ContactPage() {
  return (
    <>
      <SEO
        title="Contacto - Barbara & Abogados"
        description="¿Preguntas sobre nuestros servicios? Contacta con nosotros. Respuesta garantizada en 24h."
        image="https://damsanti.app/og-default.png"
        url="https://damsanti.app/contact"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'Barbara & Abogados',
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            telephone: '+34-900-123-456',
            email: 'info@damsanti.app'
          }
        }}
      />

      <div className="min-h-screen bg-black py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-gold text-center">Contacto</h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-gray-900 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-gold mb-4">Envíanos tu mensaje</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:border-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:border-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Teléfono (opcional)</label>
                  <input
                    type="tel"
                    placeholder="+34 600 000 000"
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:border-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Asunto</label>
                  <select className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:border-gold outline-none">
                    <option>Pregunta general</option>
                    <option>Soporte técnico</option>
                    <option>Solicitud de empresa</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Mensaje</label>
                  <textarea
                    placeholder="Cuéntanos cómo podemos ayudarte..."
                    rows={5}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:border-gold outline-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gold text-black font-bold py-2 rounded hover:bg-gold/90 transition"
                >
                  Enviar mensaje
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6 text-gray-300">
              <div>
                <h2 className="text-xl font-bold text-gold mb-4">Información de contacto</h2>
              </div>

              <div>
                <h3 className="font-bold text-gold mb-2">📧 Email</h3>
                <p>info@damsanti.app</p>
                <p className="text-sm text-gray-400 mt-1">Respuesta en 24h garantizada</p>
              </div>

              <div>
                <h3 className="font-bold text-gold mb-2">📱 Teléfono</h3>
                <p>+34 900 123 456</p>
                <p className="text-sm text-gray-400 mt-1">Lunes a Viernes, 9h-20h</p>
              </div>

              <div>
                <h3 className="font-bold text-gold mb-2">📍 Oficinas</h3>
                <p>Calle Principal, 123</p>
                <p>28001 Madrid, España</p>
                <p className="text-sm text-gray-400 mt-1">Atención presencial: Martes a Jueves, 10h-18h</p>
              </div>

              <div>
                <h3 className="font-bold text-gold mb-2">⏱️ Horario</h3>
                <ul className="space-y-1 text-sm">
                  <li>Chat 24/7</li>
                  <li>Email: Respuesta en 24h</li>
                  <li>Teléfono: 9h-20h</li>
                  <li>Oficina: Mar-Jue 10h-18h</li>
                </ul>
              </div>

              <div className="bg-gray-900 p-4 rounded mt-6">
                <h3 className="font-bold text-gold mb-2">¿Eres abogado/a?</h3>
                <p className="text-sm">Si quieres unirte a nuestro equipo, envíanos tu CV a careers@damsanti.app</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
