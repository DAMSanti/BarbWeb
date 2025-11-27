import { useState } from 'react'
import { captureException, captureMessage } from '../utils/sentry'

/**
 * Página de prueba para verificar que Sentry funciona en el frontend
 * Acceder via: /test-sentry
 * 
 * ELIMINAR DESPUÉS DE VERIFICAR QUE FUNCIONA
 */
export default function TestSentryPage() {
  const [status, setStatus] = useState<string>('')

  const handleTestError = () => {
    try {
      // Esto lanzará un error que Sentry capturará
      throw new Error('🧪 Frontend Test Error - ' + new Date().toISOString())
    } catch (error) {
      captureException(error as Error, { 
        source: 'TestSentryPage',
        userAction: 'clicked test button'
      })
      setStatus('✅ Error enviado a Sentry! Revisa tu dashboard.')
    }
  }

  const handleTestMessage = () => {
    captureMessage('🧪 Frontend Test Message - ' + new Date().toISOString(), 'info')
    setStatus('✅ Mensaje enviado a Sentry! Revisa tu dashboard.')
  }

  const handleUnhandledError = () => {
    setStatus('⚠️ Se lanzará un error no manejado...')
    // Esto lanzará un error no capturado que Sentry debería capturar automáticamente
    setTimeout(() => {
      // @ts-expect-error - Intentional error for testing
      nonExistentFunction()
    }, 100)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="max-w-md w-full p-8 bg-gray-800 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-center">🧪 Test Sentry Frontend</h1>
        
        <div className="space-y-4">
          <button
            onClick={handleTestError}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Enviar Error de Prueba
          </button>
          
          <button
            onClick={handleTestMessage}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
          >
            Enviar Mensaje de Prueba
          </button>
          
          <button
            onClick={handleUnhandledError}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
          >
            Lanzar Error No Manejado
          </button>
        </div>

        {status && (
          <div className="mt-6 p-4 bg-gray-700 rounded-lg text-center">
            {status}
          </div>
        )}

        <p className="mt-6 text-sm text-gray-400 text-center">
          Después de hacer clic, revisa tu dashboard de Sentry para ver los errores/mensajes.
        </p>
      </div>
    </div>
  )
}
