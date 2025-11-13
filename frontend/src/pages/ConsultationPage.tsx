import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import ChessboardBackground from '../components/ChessboardBackground'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAppStore } from '../store/appStore'

interface ConsultationFormData {
  subject: string
  details: string
}

const CONSULTATION_PRICE = 29.99

export default function ConsultationPage() {
  const navigate = useNavigate()
  const { user, addConsultation } = useAppStore()
  const [formData, setFormData] = useState<ConsultationFormData>({
    subject: '',
    details: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    // Validar campos
    if (!formData.subject.trim()) {
      setErrorMessage('Por favor, ingresa un asunto para tu consulta.')
      return
    }

    if (!formData.details.trim()) {
      setErrorMessage('Por favor, expone los detalles de tu consulta.')
      return
    }

    if (formData.details.trim().length < 20) {
      setErrorMessage('Por favor, proporciona más detalles en tu consulta (mínimo 20 caracteres).')
      return
    }

    setIsLoading(true)

    try {
      // Crear la consulta en el store local primero
      const consultation = {
        id: `consult-${Date.now()}`,
        clientName: user?.name || '',
        clientEmail: user?.email || '',
        question: formData.details,
        category: 'General',
        subject: formData.subject,
        price: CONSULTATION_PRICE,
        isPaid: false,
        createdAt: new Date(),
      }

      // Agregar al store
      addConsultation(consultation)

      // Enviar a la pasarela de pagos
      setSuccessMessage('¡Consulta creada correctamente! Redirigiendo a la pasarela de pagos...')
      setTimeout(() => {
        navigate(`/checkout/${consultation.id}`)
      }, 1500)
    } catch (error) {
      console.error('Error creating consultation:', error)
      setErrorMessage('Error al crear la consulta. Por favor, intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-900 text-gray-100">
      <ChessboardBackground
        imageUrl="https://t3.ftcdn.net/jpg/04/29/98/02/360_F_429980259_3jA8o7Zw4UVIRrWQxRKf3sZrnQTIX4ZR.jpg"
        opacity={0.1}
        blurAmount={15}
        parallaxIntensity={0.4}
      />

      <Header />

      <main className="flex-grow flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-2xl">
          {/* Header con botón atrás */}
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Volver</span>
            </button>
            <h1 className="text-3xl md:text-4xl font-bold">Consulta Profesional</h1>
            <div className="w-20" /> {/* Spacer para centrar el título */}
          </div>

          {/* Tarjeta del formulario */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-100 mb-2">
                Expone tu caso legal
              </h2>
              <p className="text-gray-400">
                Completa el formulario con los detalles de tu consulta. Un abogado profesional revisará tu caso.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-start space-x-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-400">{errorMessage}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-900/20 border border-green-700 rounded-lg flex items-start space-x-3">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-green-400">{successMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Asunto */}
              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-100 mb-2">
                  Asunto
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Ej: Herencia familiar, contrato laboral, etc."
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-primary-500 transition-colors text-gray-100 placeholder-gray-500"
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Máximo 100 caracteres
                </p>
              </div>

              {/* Detalles de la consulta */}
              <div>
                <label htmlFor="details" className="block text-sm font-semibold text-gray-100 mb-2">
                  Detalles de tu consulta
                </label>
                <textarea
                  id="details"
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  placeholder="Describe en detalle tu situación legal, circunstancias relevantes, y qué tipo de ayuda necesitas..."
                  rows={8}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-primary-500 transition-colors text-gray-100 placeholder-gray-500 resize-vertical"
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Mínimo 20 caracteres - Máximo 5000 caracteres ({formData.details.length}/5000)
                </p>
              </div>

              {/* Info del cliente */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-100 mb-3">Información del Cliente</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>
                    <strong className="text-gray-300">Nombre:</strong> {user?.name || 'No disponible'}
                  </p>
                  <p>
                    <strong className="text-gray-300">Email:</strong> {user?.email || 'No disponible'}
                  </p>
                </div>
              </div>

              {/* Precio y términos */}
              <div className="bg-gradient-to-r from-primary-600/20 to-accent-600/20 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 font-semibold">Precio de consulta:</span>
                  <span className="text-2xl font-bold text-primary-400">
                    ${CONSULTATION_PRICE.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Después de enviar tu consulta, serás redirigido a la pasarela de pagos segura.
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  disabled={isLoading}
                  className="flex-1 border-2 border-gray-600 text-gray-300 font-bold py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    background: 'linear-gradient(135deg, #d4af37, #8b2e1f)',
                  }}
                  className="flex-1 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>Enviar Consulta</span>
                    </>
                  )}
                </button>
              </div>

              {/* Footer info */}
              <div className="mt-6 pt-6 border-t border-gray-700 text-center">
                <p className="text-xs text-gray-500">
                  Tu información es segura y solo será utilizada para processar tu consulta legal.
                </p>
              </div>
            </form>
          </div>

          {/* Info adicional */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
              <h3 className="font-semibold text-gray-100 mb-2">⚡ Rápido</h3>
              <p className="text-sm text-gray-400">Respuesta en 24-48 horas</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
              <h3 className="font-semibold text-gray-100 mb-2">🔒 Seguro</h3>
              <p className="text-sm text-gray-400">Comunicación confidencial</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
              <h3 className="font-semibold text-gray-100 mb-2">👨‍⚖️ Expertos</h3>
              <p className="text-sm text-gray-400">Abogados certificados</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
