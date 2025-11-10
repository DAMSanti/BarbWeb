const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface FilteredQuestionResponse {
  success: boolean
  data?: {
    question: string
    category: string
    hasAutoResponse: boolean
    autoResponse?: string
    reasoning: string
    confidence: number
  }
  error?: string
}

/**
 * Filtra una pregunta legal usando el backend con OpenAI
 */
export async function filterQuestionWithBackend(
  question: string,
): Promise<FilteredQuestionResponse> {
  try {
    const response = await fetch(`${API_URL}/api/filter-question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error calling backend:', error)
    return {
      success: false,
      error: 'Error al conectar con el servidor. Por favor, intenta de nuevo.',
    }
  }
}

/**
 * Genera una respuesta detallada para una pregunta
 */
export async function generateDetailedResponse(
  question: string,
  category: string,
): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/api/generate-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, category }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.data?.response || null
  } catch (error) {
    console.error('Error generating response:', error)
    return null
  }
}

/**
 * Verifica la salud del backend
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/health`)
    return response.ok
  } catch (error) {
    console.error('Backend health check failed:', error)
    return false
  }
}
