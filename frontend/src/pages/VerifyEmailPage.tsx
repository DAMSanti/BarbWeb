import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Mail, CheckCircle, AlertCircle, Loader } from 'lucide-react'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')

      if (!token) {
        setState('error')
        setError('Token de verificación no encontrado. Por favor, revisa el enlace del email.')
        return
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (!response.ok) {
          setState('error')
          setError(data.message || 'Error al verificar el email. El token puede haber expirado.')
          return
        }

        setState('success')
        setMessage('¡Email verificado correctamente!')

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } catch (err) {
        setState('error')
        setError('Error al conectar con el servidor. Por favor, intenta más tarde.')
        console.error('Verification error:', err)
      }
    }

    verifyEmail()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <Mail className="w-12 h-12 text-primary-500" />
          </div>

          {/* Loading State */}
          {state === 'loading' && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verificando email...</h1>
              <p className="text-gray-600 mb-6">Por favor espera mientras verificamos tu dirección de correo.</p>
              <div className="flex justify-center">
                <Loader className="w-8 h-8 text-primary-500 animate-spin" />
              </div>
            </>
          )}

          {/* Success State */}
          {state === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Verificación Exitosa!</h1>
              <p className="text-gray-600 mb-2">{message}</p>
              <p className="text-sm text-gray-500">Serás redirigido a la página de inicio de sesión en 3 segundos...</p>
              <button
                onClick={() => navigate('/login')}
                className="mt-6 w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Ir al inicio de sesión
              </button>
            </>
          )}

          {/* Error State */}
          {state === 'error' && (
            <>
              <div className="flex justify-center mb-4">
                <AlertCircle className="w-16 h-16 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Error en la Verificación</h1>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Ir al inicio de sesión
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Registrarse de nuevo
                </button>
              </div>
            </>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>¿Necesitas ayuda? <a href="/contact" className="text-primary-500 hover:text-primary-600 font-semibold">Contáctanos</a></p>
        </div>
      </div>
    </div>
  )
}
