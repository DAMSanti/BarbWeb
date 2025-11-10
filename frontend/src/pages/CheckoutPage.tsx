import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { CreditCard, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import StyleSwitcher from '../components/StyleSwitcher'
import ChessboardBackground from '../components/ChessboardBackground'
import { useAppStore } from '../store/appStore'

export default function CheckoutPage() {
  const { consultationId } = useParams<{ consultationId: string }>()
  const navigate = useNavigate()
  const { layout, consultations, updateConsultation } = useAppStore()

  const consultation = consultations.find((c) => c.id === consultationId)
  const [clientName, setClientName] = useState(consultation?.clientName || '')
  const [clientEmail, setClientEmail] = useState(consultation?.clientEmail || '')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (!consultation) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--body-bg)' }}>
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#dc2626' }} />
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Consulta no encontrada</h1>
          <button
            onClick={() => navigate('/faq')}
            className="font-semibold hover:opacity-80 transition-opacity"
            style={{ color: 'var(--accent-color)' }}
          >
            ← Volver a Consultas
          </button>
        </div>
      </div>
    )
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!clientName.trim() || !clientEmail.trim()) {
      setErrorMessage('Por favor, completa todos los campos.')
      return
    }

    if (!clientEmail.includes('@')) {
      setErrorMessage('Por favor, ingresa un email válido.')
      return
    }

    setIsProcessing(true)

    try {
      // Aquí irá la integración real con Stripe
      // Por ahora, simulamos un pago exitoso
      await new Promise((resolve) => setTimeout(resolve, 2000))

      updateConsultation(consultationId!, {
        clientName,
        clientEmail,
        isPaid: true,
      })

      setPaymentSuccess(true)
    } catch (error) {
      setErrorMessage('Error al procesar el pago. Por favor, intenta de nuevo.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ background: 'var(--body-bg)' }}>
        <div className="max-w-md w-full rounded-2xl shadow-lg p-8 text-center" style={{ backgroundColor: 'var(--card-bg)' }}>
          <CheckCircle className="w-16 h-16 mx-auto mb-6" style={{ color: '#22c55e' }} />
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>¡Pago Completado!</h1>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Tu consulta ha sido registrada exitosamente. Nos pondremos en contacto pronto en:
          </p>
          <div className="rounded-lg p-4 mb-6 text-left" style={{ backgroundColor: 'var(--surface-muted)', borderColor: 'var(--border-color)', borderWidth: '1px' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <strong>Nombre:</strong> {clientName}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <strong>Email:</strong> {clientEmail}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <strong>Categoría:</strong> {consultation.category}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <strong>Monto pagado:</strong> ${consultation.price}
            </p>
          </div>
          <p className="mb-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Recibirás un email de confirmación y la respuesta de nuestros abogados en máximo 48 horas.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    )
  }

  // Estilos según diseño
  const containerMaxWidth = layout === 'minimalist' ? 'max-w-3xl' : 'max-w-2xl'
  const gridLayout = layout === 'minimalist' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'

  return (
    <div className="min-h-screen py-12" style={{ background: 'var(--body-bg)' }}>
      {layout === 'minimalist' && (
        <ChessboardBackground
          imageUrl="https://t3.ftcdn.net/jpg/04/29/98/02/360_F_429980259_3jA8o7Zw4UVIRrWQxRKf3sZrnQTIX4ZR.jpg"
          opacity={0.1}
          blurAmount={15}
          parallaxIntensity={0.4}
        />
      )}
      <StyleSwitcher />
      <div className={`${containerMaxWidth} mx-auto px-4 sm:px-6 lg:px-8`}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/faq')}
          className="flex items-center font-semibold mb-8 hover:opacity-80 transition-opacity"
          style={{ color: 'var(--accent-color)' }}
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver a Consultas
        </button>

        <div className={`grid ${gridLayout} gap-8`}>
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl shadow-lg p-6 sticky top-6" style={{ backgroundColor: 'var(--card-bg)' }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Resumen</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Categoría Legal</p>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{consultation.category}</p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Tu Pregunta</p>
                  <p className="font-semibold line-clamp-3" style={{ color: 'var(--text-primary)' }}>{consultation.question}</p>
                </div>
              </div>

              <div className="pt-4 mb-6" style={{ borderColor: 'var(--border-color)', borderTopWidth: '1px' }}>
                <div className="flex justify-between items-center mb-4">
                  <span style={{ color: 'var(--text-secondary)' }}>Consulta Profesional</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>${consultation.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-secondary)' }}>Impuestos (IVA)</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>${(consultation.price * 0.21).toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4" style={{ borderColor: 'var(--border-color)', borderTopWidth: '2px' }}>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Total</span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--accent-color)' }}>
                    ${(consultation.price * 1.21).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  ✓ Garantía de privacidad <br />
                  ✓ Consulta segura <br />
                  ✓ Respuesta en 48 horas
                </p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Formulario de Pago</h1>

              <form onSubmit={handlePayment} className="space-y-6">
                {/* Client Info */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Información de Contacto</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre Completo
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Juan García"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Correo Electrónico
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="juan@example.com"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <CreditCard size={20} className="text-primary-600" />
                    <span>Información de Pago</span>
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Número de Tarjeta
                      </label>
                      <input
                        type="text"
                        placeholder="4111 1111 1111 1111"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Vencimiento
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          CVC
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-red-700">{errorMessage}</p>
                  </div>
                )}

                {/* Terms and Conditions */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="mt-1 w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      He leído y acepto los{' '}
                      <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold">
                        términos y condiciones
                      </a>{' '}
                      y la{' '}
                      <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold">
                        política de privacidad
                      </a>
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-primary-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <CreditCard size={20} />
                  <span>{isProcessing ? 'Procesando...' : `Pagar $${(consultation.price * 1.21).toFixed(2)}`}</span>
                </button>

                {/* Security Note */}
                <p className="text-center text-sm text-gray-600">
                  🔒 Tus datos de pago están seguros. Usamos encriptación SSL de 256 bits.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
