import { SEO } from '../components/SEO'

export default function AboutPage() {
  return (
    <>
      <SEO
        title="Sobre Barbara & Abogados - Consultas Legales Online"
        description="Conoce nuestro equipo de abogados expertos. 15+ años de experiencia en consultas legales online con respuestas inmediatas."
        image="https://damsanti.app/og-about.png"
        url="https://damsanti.app/about"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Barbara & Abogados',
          description: 'Plataforma de consultas legales online con respuestas inmediatas',
          url: 'https://damsanti.app',
          foundingDate: '2010',
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Support',
            email: 'info@damsanti.app'
          }
        }}
      />

      <div className="min-h-screen bg-black py-12 px-4">
        <div className="max-w-3xl mx-auto text-white">
          <h1 className="text-4xl font-bold mb-8 text-gold">Sobre Barbara & Abogados</h1>

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-gold mb-3">Nuestra Misión</h2>
              <p>
                Democratizar el acceso a consultas legales de calidad. Queremos que cualquier persona, sin importar su
                ubicación o presupuesto, pueda obtener respuestas legales inmediatas de profesionales calificados.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gold mb-3">Quiénes Somos</h2>
              <p>
                Barbara & Abogados es una plataforma innovadora fundada en 2010 por un equipo de abogados con más de
                15 años de experiencia. Hemos ayudado a más de 50,000 personas a resolver sus consultas legales de
                manera rápida y eficiente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gold mb-3">Nuestro Equipo</h2>
              <p>
                Contamos con abogados especializados en diversas áreas del derecho:
              </p>
              <ul className="list-disc list-inside mt-3 space-y-2">
                <li>Derecho Civil y Penal</li>
                <li>Derecho Laboral y Seguridad Social</li>
                <li>Derecho Mercantil y Empresarial</li>
                <li>Derecho Administrativo</li>
                <li>Derecho Inmobiliario</li>
                <li>Derecho de Familia</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gold mb-3">Por Qué Elegirnos</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-gold">⚡ Respuestas Inmediatas</h3>
                  <p>Obtén respuestas en minutos, no en días.</p>
                </div>
                <div>
                  <h3 className="font-bold text-gold">👨‍⚖️ Abogados Calificados</h3>
                  <p>Todo nuestro equipo está colegiado y con experiencia verificada.</p>
                </div>
                <div>
                  <h3 className="font-bold text-gold">💰 Precios Competitivos</h3>
                  <p>Consultas desde €25, sin costos ocultos.</p>
                </div>
                <div>
                  <h3 className="font-bold text-gold">🔒 Confidencial</h3>
                  <p>Tu privacidad es nuestra prioridad. Cifrado end-to-end.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gold mb-3">Estadísticas</h2>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gold/10 p-4 rounded">
                  <p className="text-2xl font-bold text-gold">50K+</p>
                  <p className="text-sm">Consultas resueltas</p>
                </div>
                <div className="bg-gold/10 p-4 rounded">
                  <p className="text-2xl font-bold text-gold">15+</p>
                  <p className="text-sm">Años de experiencia</p>
                </div>
                <div className="bg-gold/10 p-4 rounded">
                  <p className="text-2xl font-bold text-gold">98%</p>
                  <p className="text-sm">Satisfacción cliente</p>
                </div>
                <div className="bg-gold/10 p-4 rounded">
                  <p className="text-2xl font-bold text-gold">20+</p>
                  <p className="text-sm">Abogados colegiados</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gold mb-3">Certificaciones</h2>
              <ul className="space-y-2">
                <li>✓ Colegio de Abogados de Madrid</li>
                <li>✓ Certificación ISO 27001 (Seguridad de datos)</li>
                <li>✓ Cumplimiento RGPD</li>
                <li>✓ Verificación PCI-DSS (Pagos seguros)</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
