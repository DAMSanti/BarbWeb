import axios, { AxiosInstance, AxiosError } from 'axios'
import { parseBackendError } from './errorHandler.js'
import { retryAsync, retryAuth, retryAI } from '../utils/retry.js'
import { useAppStore } from '../store/appStore.js'

// En producción, el frontend se sirve desde /barbweb2/ en el mismo dominio que la API
// Usar una URL relativa (sin dominio) para que funcione tanto en local como en producción
// LAZY EVALUATION: No evaluar import.meta.env en el scope global
export const getApiUrl = (): string => {
  try {
    return import.meta.env.VITE_API_URL || (
      typeof window !== 'undefined' && window.location.origin.includes('ondigitalocean.app')
        ? window.location.origin
        : 'http://localhost:3000'
    )
  } catch (e) {
    // Fallback si import.meta.env no está disponible (esbuild en producción)
    return typeof window !== 'undefined' && window.location.origin.includes('ondigitalocean.app')
      ? window.location.origin
      : 'http://localhost:3000'
  }
}

// Crear instancia de Axios (usa función lazy para obtener la URL)
const apiClient: AxiosInstance = axios.create({
  get baseURL() {
    return getApiUrl()
  },
  headers: {
    'Content-Type': 'application/json',
  },
})

// Flag para evitar loops infinitos de refresh
let isRefreshing = false
let refreshSubscribers: Array<() => void> = []

const onRefreshed = (callback: () => void) => {
  refreshSubscribers.push(callback)
}

const refreshTokenAndRetry = async () => {
  const store = useAppStore.getState()
  const { refreshToken } = store.tokens || {}

  if (!refreshToken) {
    store.logout()
    return null
  }

  try {
    const response = await axios.post(`${getApiUrl()}/auth/refresh`, {
      refreshToken,
    })
    const newAccessToken = response.data.accessToken

    // Update store with new token
    store.setTokens({
      accessToken: newAccessToken,
      refreshToken,
    })

    // Ejecutar todas las peticiones que estaban esperando
    refreshSubscribers.forEach((callback) => callback())
    refreshSubscribers = []

    return newAccessToken
  } catch (error) {
    store.logout()
    return null
  }
}

// Interceptor de respuesta para manejar 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    // Si es 401 y no ya hemos intentado refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si ya estamos refrescando, esperar y reintentar
        return new Promise((resolve) => {
          onRefreshed(() => {
            const store = useAppStore.getState()
            if (store.tokens?.accessToken) {
              originalRequest.headers.Authorization = `Bearer ${store.tokens.accessToken}`
              resolve(apiClient(originalRequest))
            }
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newAccessToken = await refreshTokenAndRetry()
        isRefreshing = false

        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        isRefreshing = false
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// Cliente API con métodos de autenticación y retry automático
export const backendApi = {
  // Auth endpoints con retry conservador (2 intentos)
  async register(email: string, password: string, confirmPassword: string, name: string) {
    return retryAuth(async () => {
      const { data } = await apiClient.post('/auth/register', {
        email,
        password,
        confirmPassword,
        name,
      })
      return data
    })
  },

  async login(email: string, password: string) {
    return retryAuth(async () => {
      const { data } = await apiClient.post('/auth/login', {
        email,
        password,
      })
      return data
    })
  },

  async refreshToken(refreshToken: string) {
    return retryAuth(async () => {
      const { data } = await apiClient.post('/auth/refresh', {
        refreshToken,
      })
      return data
    })
  },

  async logout(refreshToken: string) {
    return retryAuth(async () => {
      const { data } = await apiClient.post('/auth/logout', {
        refreshToken,
      })
      return data
    })
  },

  async getMe(accessToken: string) {
    return retryAuth(async () => {
      const { data } = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      return data
    })
  },
}

export interface FilteredQuestionResponse {
  success: boolean
  data?: {
    question: string
    category: string
    briefAnswer: string
    needsProfessionalConsultation: boolean
    reasoning: string
    confidence: number
    complexity: 'simple' | 'medium' | 'complex'
  }
  error?: string
}

/**
 * Filtra una pregunta legal usando el backend con OpenAI
 * Incluye retry automático para AI (3 intentos, 1500ms delay)
 */
export async function filterQuestionWithBackend(
  question: string,
): Promise<FilteredQuestionResponse> {
  console.log('[filterQuestionWithBackend] Starting with question:', question.substring(0, 50))
  console.log('[filterQuestionWithBackend] API_URL:', getApiUrl())
  
  try {
    const result = await retryAI(async () => {
      console.log('[filterQuestionWithBackend] Making POST to /api/filter-question')
      const response = await apiClient.post('/api/filter-question', {
        question,
      })
      console.log('[filterQuestionWithBackend] Full response:', response.data)
      
      // Backend devuelve {success: true, data: {...}}
      // Extraer el data correctamente
      const { data: responseData } = response
      console.log('[filterQuestionWithBackend] ResponseData:', responseData)
      
      return {
        success: responseData.success,
        data: responseData.data,
      }
    })
    console.log('[filterQuestionWithBackend] Final result:', result)
    return result
  } catch (error) {
    console.error('[filterQuestionWithBackend] Error caught:', error)
    const frontendError = parseBackendError(error)
    console.error('[filterQuestionWithBackend] Parsed error:', frontendError)
    return {
      success: false,
      error: frontendError.userMessage,
    }
  }
}

/**
 * Genera una respuesta detallada para una pregunta
 * Incluye retry automático para AI (3 intentos, 1500ms delay)
 */
export async function generateDetailedResponse(
  question: string,
  category: string,
): Promise<string | null> {
  try {
    return await retryAI(async () => {
      const { data } = await apiClient.post('/api/generate-response', {
        question,
        category,
      })
      return data.data?.response || null
    })
  } catch (error) {
    const frontendError = parseBackendError(error)
    console.error('Error generating response:', frontendError)
    return null
  }
}

/**
 * Verifica la salud del backend
 * Incluye retry automático (3 intentos, 1000ms delay)
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const result = await retryAsync(async () => {
      const { data } = await apiClient.get('/api/health')
      console.log('[checkBackendHealth] Response:', data)
      return data.success === true
    })
    console.log('[checkBackendHealth] Final result:', result)
    return result
  } catch (error) {
    console.error('Backend health check failed:', parseBackendError(error))
    return false
  }
}
