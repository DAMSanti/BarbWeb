/**
 * Hook: useErrorHandler - Manejo centralizado de errores en componentes
 */

import { useState } from 'react'
import { FrontendError, parseBackendError, logError } from '../services/errorHandler'

export interface UseErrorHandlerReturn {
  /** Error actual (null si no hay) */
  error: FrontendError | null
  /** Mensaje de error formateado para mostrar al usuario */
  errorMessage: string
  /** Manejar un error (parsea y lo almacena) */
  handleError: (error: any, context?: string) => void
  /** Limpiar error actual */
  clearError: () => void
  /** ¿Hay error actualmente? */
  isError: boolean
}

/**
 * Hook para manejar errores de forma centralizada
 *
 * @example
 * const { error, handleError, clearError } = useErrorHandler()
 *
 * try {
 *   await api.login(...)
 * } catch (err) {
 *   handleError(err, 'Login')
 * }
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<FrontendError | null>(null)

  const handleError = (err: any, context: string = 'Error') => {
    const frontendError = parseBackendError(err)
    logError(context, frontendError)
    setError(frontendError)
    
    // DEBUG: Log que el error fue seteado
    console.log('[useErrorHandler] Error establecido:', frontendError.message, frontendError.userMessage)
  }

  const clearError = () => {
    setError(null)
  }

  return {
    error,
    errorMessage: error?.userMessage || '',
    handleError,
    clearError,
    isError: error !== null,
  }
}
