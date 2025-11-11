/**
 * Retry Logic - Reintentos automáticos con backoff exponencial
 */

export interface RetryConfig {
  /** Número máximo de intentos (default: 3) */
  maxAttempts?: number
  /** Delay inicial en ms (default: 1000) */
  delayMs?: number
  /** Multiplicador para backoff exponencial (default: 2) */
  backoffMultiplier?: number
  /** Función para determinar si se debe reintentar (default: reintenta en 5xx y network errors) */
  shouldRetry?: (error: any) => boolean
  /** Función de callback cuando se reintenta */
  onRetry?: (attempt: number, delay: number) => void
}

/**
 * Reintenta una operación async con backoff exponencial
 *
 * @example
 * const data = await retryAsync(
 *   () => api.filterQuestion(question),
 *   { maxAttempts: 3, delayMs: 1000 }
 * )
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    shouldRetry = defaultShouldRetry,
    onRetry,
  } = config

  let lastError: any
  let delay = delayMs

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Si es el último intento, lanzar el error
      if (attempt === maxAttempts) {
        break
      }

      // Si no debe reintentarse, lanzar inmediatamente
      if (!shouldRetry(error)) {
        throw error
      }

      // Esperar antes del próximo intento
      if (onRetry) {
        onRetry(attempt, delay)
      }

      console.warn(
        `Intento ${attempt} de ${maxAttempts} falló. Reintentando en ${delay}ms...`,
      )

      await new Promise((resolve) => setTimeout(resolve, delay))
      delay *= backoffMultiplier
    }
  }

  // Si llegamos aquí, todos los intentos fallaron
  throw lastError
}

/**
 * Lógica por defecto: reintenta en errores 5xx, network errors y 429 (rate limit)
 */
function defaultShouldRetry(error: any): boolean {
  // Si no hay información de error, no reintentes
  if (!error) {
    return false
  }

  // Errores de red
  if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
    return true
  }

  // Si no hay respuesta HTTP, probablemente sea error de red
  if (!error.response) {
    return true
  }

  const { status } = error.response

  // Reintenta en errores 5xx (server errors)
  if (status >= 500) {
    return true
  }

  // Reintenta en 429 (Too Many Requests)
  if (status === 429) {
    return true
  }

  // No reintentes errores 4xx (bad request, validation, etc)
  return false
}

/**
 * Helper: Reintenta una función sync que puede lanzar errores
 */
export async function retrySync<T>(
  fn: () => T,
  config: RetryConfig = {},
): Promise<T> {
  return retryAsync(() => Promise.resolve(fn()), config)
}

/**
 * Helper: Reintenta con configuración predeterminada para AI (más intentos, delay más largo)
 */
export async function retryAI<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  return retryAsync(fn, {
    maxAttempts: 3,
    delayMs: 1500,
    backoffMultiplier: 2,
    ...config,
  })
}

/**
 * Helper: Reintenta con configuración predeterminada para auth (más conservador)
 */
export async function retryAuth<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  return retryAsync(fn, {
    maxAttempts: 2,
    delayMs: 500,
    backoffMultiplier: 1.5,
    ...config,
  })
}
