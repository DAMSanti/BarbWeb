import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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
    if (!question || question.trim().length === 0) {
      throw new Error('Question cannot be empty')
    }

    const message = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Analiza esta pregunta legal: "${question}"`,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    })

    const content = message.choices[0].message.content

    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Extraer JSON de la respuesta
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const result = JSON.parse(jsonMatch[0]) as FilteredQuestion

    // Validar respuesta
    if (!LEGAL_CATEGORIES.includes(result.category)) {
      result.category = 'Civil' // Default
    }

    if (result.confidence < 0.5) {
      result.hasAutoResponse = false
    }

    return result
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
    const message = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Eres un abogado experto en derecho ${category}. 
Proporciona una respuesta clara, concisa y útil (máximo 300 palabras) a la siguiente pregunta legal.
Sé profesional pero accesible para el público general.`,
        },
        {
          role: 'user',
          content: question,
        },
      ],
      temperature: 0.5,
      max_tokens: 800,
    })

    return message.choices[0].message.content || 'No response generated'
  } catch (error) {
    console.error('Error generating detailed response:', error)
    throw new Error('Failed to generate response')
  }
}
