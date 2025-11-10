import { GoogleGenerativeAI } from '@google/generative-ai'

// Validar que la API key esté configurada
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️  WARNING: GEMINI_API_KEY not configured. AI features will be disabled.')
}

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

export interface FilteredQuestion {
  category: string
  briefAnswer: string
  needsProfessionalConsultation: boolean
  reasoning: string
  confidence: number
  complexity: 'simple' | 'medium' | 'complex'
}

const LEGAL_CATEGORIES = ['Civil', 'Penal', 'Laboral', 'Administrativo', 'Mercantil', 'Familia', 'Tributario']

const LEGAL_AGENT_PROMPT = `Eres el asistente legal virtual del bufete "Bárbara & Abogados", especializado en derecho español.

TU MISIÓN:
- Proporcionar una orientación legal básica inicial
- Identificar correctamente la categoría legal
- Evaluar si el caso necesita consulta profesional personalizada
- Motivar al cliente a contratar el servicio profesional del bufete

CATEGORÍAS DISPONIBLES: ${LEGAL_CATEGORIES.join(', ')}

CRITERIOS PARA RECOMENDAR CONSULTA PROFESIONAL:
- ✅ Casos que involucren cantidades de dinero
- ✅ Situaciones con plazos legales (prescripción, recursos, etc.)
- ✅ Conflictos interpersonales (divorcios, herencias, despidos)
- ✅ Trámites que requieran documentación legal
- ✅ Cualquier caso donde haya riesgo legal o económico
- ⚠️ Solo responder gratis: preguntas teóricas generales muy simples

FORMATO DE RESPUESTA JSON (OBLIGATORIO):
{
  "category": "Civil|Penal|Laboral|Administrativo|Mercantil|Familia",
  "briefAnswer": "Respuesta orientativa breve (máx 150 palabras). Menciona que para su caso específico necesita consulta personalizada.",
  "needsProfessionalConsultation": true,
  "reasoning": "Por qué este caso requiere un abogado profesional",
  "confidence": 0.0-1.0,
  "complexity": "simple|medium|complex"
}

IMPORTANTE:
- Sé CONSERVADOR: la mayoría de casos deben ir a consulta profesional
- La respuesta breve es solo una orientación, NO asesoramiento legal completo
- Menciona siempre la importancia de consultar con un abogado
- needsProfessionalConsultation debe ser TRUE en el 80% de los casos
`

export async function filterQuestionWithAI(question: string): Promise<FilteredQuestion> {
  try {
    if (!genAI) {
      throw new Error('Gemini AI is not configured. Please set GEMINI_API_KEY environment variable.')
    }

    if (!question || question.trim().length === 0) {
      throw new Error('Question cannot be empty')
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

    const prompt = `${LEGAL_AGENT_PROMPT}\n\nPregunta del cliente: "${question}"\n\nAnaliza y responde en formato JSON:`

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

    // Asegurar que briefAnswer siempre exista
    if (!parsedResult.briefAnswer || parsedResult.briefAnswer.trim().length === 0) {
      parsedResult.briefAnswer = 'Para evaluar correctamente su situación, necesitamos analizar los detalles específicos de su caso en una consulta personalizada.'
      parsedResult.needsProfessionalConsultation = true
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

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

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
