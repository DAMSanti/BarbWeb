import { SEO } from '../components/SEO'

export default function TermsPage() {
  return (
    <>
      <SEO
        title="Términos y Condiciones"
        description="Lee nuestros términos y condiciones de uso. Acuerdo legal para usar Barbara & Abogados."
        image="https://damsanti.app/og-default.png"
        url="https://damsanti.app/terms"
      />

      <div className="min-h-screen bg-black py-12 px-4">
        <div className="max-w-3xl mx-auto text-white">
          <h1 className="text-4xl font-bold mb-8 text-gold">Términos y Condiciones</h1>
          <p className="text-gray-400 mb-4">Última actualización: Noviembre 2025</p>

          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-gold mb-3">1. Aceptación de Términos</h2>
              <p>
                Al acceder y usar Barbara & Abogados, aceptas estar vinculado por estos términos. Si no estás de
                acuerdo, no uses este servicio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gold mb-3">2. Descripción del Servicio</h2>
              <p>
                Barbara & Abogados proporciona una plataforma de consultas legales en línea. Las respuestas son
                generadas por abogados califomados o sistemas de IA. No constituye relación abogado-cliente legal.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gold mb-3">3. Limitaciones de Responsabilidad</h2>
              <p>
                Las consultas proporcionadas son de naturaleza general e informativa. No reemplazan el asesoramiento
                legal profesional. Barbara & Abogados no es responsable por:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Inexactitud o incompletitud de respuestas</li>
                <li>Pérdida de datos o interrupciones de servicio</li>
                <li>Daños indirectos derivados del uso del servicio</li>
                <li>Acciones tomadas basadas en nuestras respuestas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gold mb-3">4. Conducta del Usuario</h2>
              <p>Te comprometes a:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Usar el servicio solo para propósitos legales</li>
                <li>No violar derechos de terceros</li>
                <li>No enviar información falsa o engañosa</li>
                <li>No intentar acceso no autorizado</li>
                <li>No usar bots o automatización sin permiso</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gold mb-3">5. Pagos y Reembolsos</h2>
              <p>
                Los pagos se procesan a través de Stripe. Las consultas son no reembolsables una vez completadas. Los
                reembolsos por pagos fallidos se procesarán automáticamente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gold mb-3">6. Propiedad Intelectual</h2>
              <p>
                Todo contenido en Barbara & Abogados (textos, diseños, logotipos) es propiedad de Barbara & Abogados.
                No puedes reproducir o distribuir sin permiso.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gold mb-3">7. Modificaciones del Servicio</h2>
              <p>
                Nos reservamos el derecho de modificar o discontinuar el servicio en cualquier momento con aviso
                previo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gold mb-3">8. Ley Aplicable</h2>
              <p>Estos términos se rigen por las leyes de España.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gold mb-3">9. Contacto</h2>
              <p>Para preguntas sobre estos términos, contacta a: info@damsanti.app</p>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
