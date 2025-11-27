import { SEO } from '../components/SEO'

export default function PrivacyPage() {
  return (
    <>
      <SEO
        title="Política de Privacidad"
        description="Lee nuestra política de privacidad. Cómo protegemos tus datos personales en Barbara & Abogados."
        image="https://damsanti.app/og-default.png"
        url="https://damsanti.app/privacy"
      />

      <div className="min-h-screen bg-black py-12 px-4">
        <div className="max-w-3xl mx-auto text-white">
          <h1 className="text-4xl font-bold mb-8 text-gold">Política de Privacidad</h1>
          <p className="text-gray-400 mb-4">Última actualización: Noviembre 2025</p>

          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-gold mb-3">1. Información que Recopilamos</h2>
              <p>Recopilamos información que nos proporcionas directamente, como:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Nombre, email y número de teléfono</li>
                <li>Información de consultas legales</li>
                <li>Datos de pago (procesados por Stripe)</li>
                <li>Información de cuenta y preferencias</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gold mb-3">2. Cómo Utilizamos tu Información</h2>
              <p>Utilizamos tu información para:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Proporcionar servicios de consultoría legal</li>
                <li>Procesamiento de pagos</li>
                <li>Comunicaciones sobre tu cuenta</li>
                <li>Mejora de nuestros servicios</li>
                <li>Cumplimiento legal y regulatorio</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gold mb-3">3. Protección de Datos</h2>
              <p>
                Utilizamos encriptación SSL/TLS y otras medidas de seguridad para proteger tus datos personales.
                Toda la información sensible es almacenada de forma segura en bases de datos protegidas.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gold mb-3">4. Compartir Información</h2>
              <p>
                No compartimos tu información personal con terceros sin tu consentimiento, excepto cuando es
                requerido por ley o para proporcionar nuestros servicios (ej: Stripe para pagos).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gold mb-3">5. Tus Derechos</h2>
              <p>Tienes derecho a:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Acceder a tus datos personales</li>
                <li>Solicitar correcciones</li>
                <li>Solicitar la eliminación de datos</li>
                <li>Retractarte de comunicaciones de marketing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gold mb-3">6. Contacto</h2>
              <p>Para preguntas sobre privacidad, contacta a: info@damsanti.app</p>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
