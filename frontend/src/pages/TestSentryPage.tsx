import { useState } from 'react'
import { captureException, captureMessage } from '../utils/sentry'

// Safe check for Sentry DSN
const getSentryDsn = (): boolean => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return !!import.meta.env.VITE_SENTRY_DSN
    }
  } catch {
    // Fallback
  }
  return false
}

/**
 * Página de prueba para verificar que Sentry funciona en el frontend
 * Acceder via: /test-sentry
 * 
 * ELIMINAR DESPUÉS DE VERIFICAR QUE FUNCIONA
 */
export default function TestSentryPage() {
  const [status, setStatus] = useState<string>('')
  const hasSentryDsn = getSentryDsn()

  const handleTestError = () => {
    try {
      throw new Error('🧪 Frontend Test Error - ' + new Date().toISOString())
    } catch (error) {
      captureException(error as Error, { 
        source: 'TestSentryPage',
        userAction: 'clicked test button'
      })
      if (hasSentryDsn) {
        setStatus('✅ Error enviado a Sentry! Revisa tu dashboard.')
      } else {
        setStatus('⚠️ Error capturado pero Sentry no está configurado (VITE_SENTRY_DSN no definido)')
      }
    }
  }

  const handleTestMessage = () => {
    captureMessage('🧪 Frontend Test Message - ' + new Date().toISOString(), 'info')
    if (hasSentryDsn) {
      setStatus('✅ Mensaje enviado a Sentry! Revisa tu dashboard.')
    } else {
      setStatus('⚠️ Mensaje capturado pero Sentry no está configurado')
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="max-w-md w-full p-8 bg-gray-800 rounded-lg shadow-xl mx-4">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">🧪 Test Sentry Frontend</h1>
        
        <div className="space-y-4">
          <button
            onClick={handleTestError}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors text-white"
          >
            Enviar Error de Prueba
          </button>
          
          <button
            onClick={handleTestMessage}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors text-white"
          >
            Enviar Mensaje de Prueba
          </button>
        </div>

        {status && (
          <div className="mt-6 p-4 bg-gray-700 rounded-lg text-center text-white">
            {status}
          </div>
        )}

        <p className="mt-6 text-sm text-gray-400 text-center">
          Después de hacer clic, revisa tu dashboard de Sentry para ver los errores/mensajes.
        </p>
        
        <p className="mt-2 text-xs text-gray-500 text-center">
          VITE_SENTRY_DSN: {hasSentryDsn ? '✅ Configurado' : '❌ No configurado'}
        </p>
      </div>
    </div>
  )
}
