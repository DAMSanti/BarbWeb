import { GoogleGenerativeAI } from '@google/generative-ai'

// Validar que la API key esté configurada
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️  WARNING: GEMINI_API_KEY not configured. AI features will be disabled.')
}

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

export interface FilteredQuestion {
  category: string
  hasAutoResponse: boolean
  autoResponse?: string
  reasoning: string
  confidence: number
}

const LEGAL_CATEGORIES = ['Civil', 'Penal', 'Laboral', 'Administrativo', 'Mercantil', 'Familia']

const SYSTEM_PROMPT = `Eres un experto en derecho español. Tu tarea es analizar preguntas legales y:

1. Detectar la categoría legal correcta
2. Determinar si hay una respuesta automática disponible en la base de datos
3. Proporcionar razonamiento claro

Categorías disponibles: ${LEGAL_CATEGORIES.join(', ')}

Responde SIEMPRE en formato JSON válido como este:
{
  "category": "Civil|Penal|Laboral|Administrativo|Mercantil|Familia",
  "hasAutoResponse": true|false,
  "autoResponse": "respuesta si existe, null si no",
  "reasoning": "explicación breve de por qué",
  "confidence": 0.0-1.0
}

IMPORTANTE: 
- Si no estás seguro de la categoría (confianza < 0.6), devuelve confidence bajo
- Las respuestas automáticas deben ser solo para preguntas MUY comunes
- Sé conservador: si hay duda, hasAutoResponse = false
`

export async function filterQuestionWithAI(question: string): Promise<FilteredQuestion> {
  try {
    if (!genAI) {
      throw new Error('Gemini AI is not configured. Please set GEMINI_API_KEY environment variable.')
    }

    if (!question || question.trim().length === 0) {
      throw new Error('Question cannot be empty')
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `${SYSTEM_PROMPT}\n\nAnaliza esta pregunta legal: "${question}"`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()

    if (!content) {
      throw new Error('No response from Gemini AI')
    }

    // Extraer JSON de la respuesta
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const parsedResult = JSON.parse(jsonMatch[0]) as FilteredQuestion

    // Validar respuesta
    if (!LEGAL_CATEGORIES.includes(parsedResult.category)) {
      parsedResult.category = 'Civil' // Default
    }

    if (parsedResult.confidence < 0.5) {
      parsedResult.hasAutoResponse = false
    }

    return parsedResult
  } catch (error) {
    console.error('Error filtering question with AI:', error)
    throw new Error('Failed to process question with AI')
  }
}

export async function generateDetailedResponse(
  question: string,
  category: string,
): Promise<string> {
  try {
    if (!genAI) {
      throw new Error('Gemini AI is not configured. Please set GEMINI_API_KEY environment variable.')
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `Eres un abogado experto en derecho ${category}.
Proporciona una respuesta clara, concisa y útil (máximo 300 palabras) a la siguiente pregunta legal.
Sé profesional pero accesible para el público general.

Pregunta: ${question}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    
    return response.text() || 'No response generated'
  } catch (error) {
    console.error('Error generating detailed response:', error)
    throw new Error('Failed to generate response')
  }
}
