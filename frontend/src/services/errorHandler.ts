/**
 * Error Handler Service - Parsea y formatea errores del backend
 */

export class FrontendError extends Error {
  constructor(
    public message: string,
    public userMessage: string,
    public statusCode?: number,
    public originalError?: Error | any,
  ) {
    super(message)
    this.name = 'FrontendError'
  }
}

/**
 * Parsea errores de Axios/API y los convierte a FrontendError
 */
export const parseBackendError = (error: any): FrontendError => {
  console.error('[Error Parser]', error)

  // Si es un Error object simple (del cliente, no del servidor)
  // y NO tiene propiedades de Axios (como 'response', 'code', 'isAxiosError')
  if (error instanceof Error && !('response' in error) && !('code' in error) && !('isAxiosError' in error)) {
    // Estos son errores del cliente (validación local)
    return new FrontendError(
      error.message,
      error.message,  // Usar el mensaje del cliente directamente
      400,
      error,
    )
  }

  // Error de respuesta HTTP del servidor
  if (error?.response) {
    const { status, data } = error.response
    const backendMessage = data?.error || data?.message || 'Error desconocido del servidor'
    const userMessage = getUserFriendlyMessage(status, backendMessage)

    return new FrontendError(
      backendMessage,
      userMessage,
      status,
      error,
    )
  }

  // Error de red (sin respuesta del servidor)
  // Verificar específicamente: Network Error, timeout, o axios sin response
  if (error?.code === 'ECONNABORTED' || error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
    return new FrontendError(
      'Error de conexión',
      'No se pudo conectar al servidor. Verifica tu conexión a internet.',
      0,
      error,
    )
  }

  // Si es un error de axios pero sin respuesta (probablemente network error)
  if (error?.isAxiosError && !error?.response) {
    return new FrontendError(
      'Error de conexión',
      'No se pudo conectar al servidor. Verifica tu conexión a internet.',
      0,
      error,
    )
  }

  // Error desconocido
  return new FrontendError(
    'Error inesperado',
    'Algo salió mal. Por favor intenta de nuevo.',
    500,
    error,
  )
}

/**
 * Convierte códigos HTTP a mensajes amigables para el usuario
 */
const getUserFriendlyMessage = (statusCode: number, backendMessage: string): string => {
  const messages: Record<number, string> = {
    400: 'Los datos enviados no son válidos. Por favor revisa tu información.',
    401: 'Tu sesión expiró. Por favor inicia sesión de nuevo.',
    403: 'No tienes permiso para hacer esto.',
    404: 'El recurso no fue encontrado.',
    409: 'Este elemento ya existe. Por favor intenta con otro valor.',
    422: `Validación fallida: ${backendMessage}`,
    429: 'Demasiadas solicitudes. Por favor espera un momento e intenta de nuevo.',
    500: 'Error del servidor. Por favor intenta más tarde.',
    502: 'Servicio no disponible. Intenta de nuevo más tarde.',
    503: 'El servicio está temporalmente no disponible. Intenta de nuevo en unos momentos.',
  }

  return messages[statusCode] || 'Ocurrió un error inesperado. Por favor intenta de nuevo.'
}

/**
 * Valida errores de respuesta del backend
 */
export const isBackendError = (error: any): error is { response: { status: number; data: any } } => {
  return error && error.response && typeof error.response.status === 'number'
}

/**
 * Extrae el mensaje de error más relevante
 */
export const getErrorMessage = (error: any): string => {
  if (error instanceof FrontendError) {
    return error.userMessage
  }

  if (isBackendError(error)) {
    const parsed = parseBackendError(error)
    return parsed.userMessage
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Ocurrió un error desconocido'
}

/**
 * Helper para logging de errores en desarrollo
 */
export const logError = (context: string, error: any): void => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`❌ Error en ${context}`)
    console.error('Detalles:', error)
    if (error instanceof FrontendError) {
      console.error('Usuario ve:', error.userMessage)
    }
    console.groupEnd()
  }
}
