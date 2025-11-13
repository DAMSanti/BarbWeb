import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { CreditCard, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import ChessboardBackground from '../components/ChessboardBackground'
import { useAppStore } from '../store/appStore'

// Inicializar Stripe con la clave pública
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
  const { consultationId } = useParams<{ consultationId: string }>()
  const navigate = useNavigate()
  const { consultations, tokens } = useAppStore()

  const consultation = consultations.find((c) => c.id === consultationId)
  const [clientSecret, setClientSecret] = useState<string>('')
  const [isLoadingIntent, setIsLoadingIntent] = useState(true)
  const [globalError, setGlobalError] = useState<string>('')

  // Crear PaymentIntent al montar el componente
  useEffect(() => {
    if (!consultation) return

    const createPaymentIntent = async () => {
      try {
        setIsLoadingIntent(true)
        setGlobalError('')

        console.log('[Checkout] Creating payment intent', {
          consultationId,
          amount: consultation.price * 1.21,
          apiUrl: import.meta.env.VITE_API_URL,
        })

        const token = tokens?.accessToken
        if (!token) {
          setGlobalError('Por favor, inicia sesión para continuar con el pago')
          setIsLoadingIntent(false)
          return
        }

        console.log('[Checkout] Token found:', token?.substring(0, 20) + '...')

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: consultation.price * 1.21,
            currency: 'usd',
            consultationId,
            description: `Consulta Legal - ${consultation.category}`,
          }),
        })

        console.log('[Checkout] Response status:', response.status)
        const data = await response.json()
        console.log('[Checkout] Response data:', data)

        if (!response.ok) {
          if (response.status === 401) {
            setGlobalError('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.')
            setTimeout(() => navigate('/login'), 2000)
            return
          }
          throw new Error(data.error || 'Error al crear la intención de pago')
        }

        if (data.success && data.clientSecret) {
          setClientSecret(data.clientSecret)
          console.log('[Checkout] Payment intent created', { paymentIntentId: data.paymentIntentId })
        } else {
          throw new Error('No se recibió client secret del servidor')
        }
      } catch (err: any) {
        console.error('[Checkout] Error creating payment intent', err)
        setGlobalError(err.message || 'Error al cargar el formulario de pago')
      } finally {
        setIsLoadingIntent(false)
      }
    }

    createPaymentIntent()
  }, [consultation, consultationId])

  const [clientName, setClientName] = useState(consultation?.clientName || '')
  const [clientEmail, setClientEmail] = useState(consultation?.clientEmail || '')
  const [paymentSuccess, setPaymentSuccess] = useState(false)

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

  // Success Screen
  if (paymentSuccess) {
    return (
      <div className="relative min-h-screen flex items-center justify-center py-12 px-4">
        <ChessboardBackground
          imageUrl="https://t3.ftcdn.net/jpg/04/29/98/02/360_F_429980259_3jA8o7Zw4UVIRrWQxRKf3sZrnQTIX4ZR.jpg"
          opacity={0.1}
          blurAmount={15}
          parallaxIntensity={0.4}
          cleanMode={true}
        />
        <div className="relative z-10 max-w-md w-full rounded-2xl shadow-lg p-8 text-center" style={{ backgroundColor: 'var(--card-bg)' }}>
          <CheckCircle className="w-20 h-20 mx-auto mb-6 text-green-500" />
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>¡Pago Completado!</h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Tu consulta ha sido registrada exitosamente. Nos pondremos en contacto pronto en:
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-700">
              <strong>Nombre:</strong> {clientName}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Email:</strong> {clientEmail}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Categoría:</strong> {consultation.category}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Monto pagado:</strong> ${(consultation.price * 1.21).toFixed(2)}
            </p>
          </div>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            Recibirás un email de confirmación y la respuesta de nuestros abogados en máximo 48 horas.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity text-white"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    )
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0369a1',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#dc2626',
      fontFamily: 'system-ui, sans-serif',
      borderRadius: '8px',
    },
  }

  // Estilos según diseño
  const containerMaxWidth = 'max-w-3xl'

  return (
    <div className="min-h-screen py-12">
      <ChessboardBackground
        imageUrl="https://t3.ftcdn.net/jpg/04/29/98/02/360_F_429980259_3jA8o7Zw4UVIRrWQxRKf3sZrnQTIX4ZR.jpg"
        opacity={0.1}
        blurAmount={15}
        parallaxIntensity={0.4}
        cleanMode={true}
      />
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-700">
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
              <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center space-x-2">
                <CreditCard size={28} className="text-primary-600" />
                <span>Pago Seguro</span>
              </h1>

              {/* Global Error */}
              {globalError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-red-700 font-semibold">Error al procesar el pago</p>
                    <p className="text-red-600 text-sm mt-1">{globalError}</p>
                  </div>
                </div>
              )}

              {/* Loading Payment Intent */}
              {isLoadingIntent && !globalError && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600">Preparando formulario de pago...</p>
                </div>
              )}

              {/* Stripe Elements */}
              {!isLoadingIntent && clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                  <CheckoutForm
                    consultation={consultation}
                    consultationId={consultationId!}
                    clientName={clientName}
                    clientEmail={clientEmail}
                    setClientName={setClientName}
                    setClientEmail={setClientEmail}
                    setPaymentSuccess={setPaymentSuccess}
                  />
                </Elements>
              )}

              {/* Failed to load */}
              {!isLoadingIntent && !clientSecret && (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
                  <p className="text-gray-700 mb-4">No se pudo cargar el formulario de pago</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                  >
                    Reintentar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente interno para el formulario de pago
function CheckoutForm({
  consultation,
  consultationId,
  clientName,
  clientEmail,
  setClientName,
  setClientEmail,
  setPaymentSuccess,
}: {
  consultation: any
  consultationId: string
  clientName: string
  clientEmail: string
  setClientName: (name: string) => void
  setClientEmail: (email: string) => void
  setPaymentSuccess: (success: boolean) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const { updateConsultation, tokens } = useAppStore()

  const [isProcessing, setIsProcessing] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(true)
  const [error, setError] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validaciones básicas
    if (!clientName.trim() || !clientEmail.trim()) {
      setError('Por favor, completa todos los campos.')
      return
    }

    if (!clientEmail.includes('@')) {
      setError('Por favor, ingresa un email válido.')
      return
    }

    if (!termsAccepted) {
      setError('Debes aceptar los términos y condiciones.')
      return
    }

    if (!stripe || !elements) {
      setError('Stripe no está listo. Por favor, recarga la página.')
      return
    }

    setIsProcessing(true)

    try {
      console.log('[CheckoutForm] Submitting payment', { consultationId, clientEmail })

      // Confirmar el pago con Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?consultationId=${consultationId}`,
          receipt_email: clientEmail,
        },
        redirect: 'if_required',
      })

      if (stripeError) {
        console.error('[CheckoutForm] Stripe payment error', {
          error: stripeError.message,
          code: stripeError.code,
        })
        throw new Error(stripeError.message || 'Error al procesar el pago')
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('[CheckoutForm] Payment succeeded', {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
        })

        // Confirmar el pago en el backend
        try {
          const token = tokens?.accessToken
          await fetch(`${import.meta.env.VITE_API_URL}/api/payments/confirm-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id,
              consultationId,
            }),
          })
        } catch (backendError) {
          console.warn('[CheckoutForm] Backend confirmation failed', { error: backendError })
          // No bloqueamos el flujo si falla el backend
        }

        // Actualizar el estado local
        updateConsultation(consultationId, {
          clientName,
          clientEmail,
          isPaid: true,
        })

        setPaymentSuccess(true)
      } else {
        throw new Error('El pago no se completó correctamente')
      }
    } catch (err: any) {
      console.error('[CheckoutForm] Payment submission error', {
        error: err.message,
        consultationId,
      })
      setError(err.message || 'Error al procesar el pago. Por favor, intenta de nuevo.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-gray-900 placeholder-gray-400"
              required
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-gray-900 placeholder-gray-400"
              required
            />
          </div>
        </div>
      </div>

      {/* Payment Element */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <CreditCard size={20} className="text-primary-600" />
          <span>Información de Pago</span>
        </h2>
        <div className="border-2 border-gray-200 rounded-lg p-4">
          <PaymentElement />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Terms and Conditions */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
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
        disabled={isProcessing || !stripe}
        className="w-full bg-primary-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Procesando pago...</span>
          </>
        ) : (
          <>
            <CreditCard size={20} />
            <span>Pagar ${(consultation.price * 1.21).toFixed(2)}</span>
          </>
        )}
      </button>

      {/* Security Note */}
      <p className="text-center text-sm text-gray-600">
        🔒 Tus datos de pago están seguros. Procesado por Stripe con encriptación SSL de 256 bits.
      </p>
    </form>
  )
}
