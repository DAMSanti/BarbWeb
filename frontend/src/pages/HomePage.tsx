import { SEO, schemaPresets } from '../components/SEO'
import MinimalistLayout from '../layouts/MinimalistLayout'

export default function HomePage() {
  return (
    <>
      <SEO
        title="Consultas Legales Online - Respuestas Inmediatas"
        description="Obtén respuestas de abogados expertos en 5 minutos. Consultas legales online seguras y confidenciales."
        image="https://damsanti.app/og-home.png"
        url="https://damsanti.app"
        schema={schemaPresets.localBusiness}
      />
      <MinimalistLayout />
    </>
  )
}
