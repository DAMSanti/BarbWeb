import axios, { AxiosInstance } from 'axios'
import { parseBackendError } from './errorHandler.js'
import { retryAsync, retryAuth, retryAI } from '../utils/retry.js'

// En producción, el frontend se sirve desde /barbweb2/ en el mismo dominio que la API
// Usar una URL relativa (sin dominio) para que funcione tanto en local como en producción
const API_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.origin.includes('ondigitalocean.app')
    ? window.location.origin
    : 'http://localhost:3000'
)

// Crear instancia de Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

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
  try {
    return await retryAI(async () => {
      const { data } = await apiClient.post('/api/filter-question', {
        question,
      })
      return {
        success: true,
        data,
      }
    })
  } catch (error) {
    const frontendError = parseBackendError(error)
    console.error('Error filtering question:', frontendError)
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
    return await retryAsync(async () => {
      const { data } = await apiClient.get('/api/health')
      return data.success === true
    })
  } catch (error) {
    console.error('Backend health check failed:', parseBackendError(error))
    return false
  }
}
