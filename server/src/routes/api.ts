import { Router, Request, Response } from 'express'
import { filterQuestionWithAI, generateDetailedResponse } from '../services/openaiService.js'
import { findSimilarFAQ } from '../utils/faqDatabase.js'

const router = Router()

interface FilterQuestionRequest {
  question: string
}

interface FilterQuestionResponse {
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
 * POST /api/filter-question
 * Filtra una pregunta legal usando OpenAI
 */
router.post('/filter-question', async (req: Request, res: Response) => {
  try {
    const { question } = req.body as FilterQuestionRequest

    if (!question || typeof question !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Question is required and must be a string',
      } as FilterQuestionResponse)
      return
    }

    // Paso 1: Usar OpenAI para analizar la pregunta
    const aiResult = await filterQuestionWithAI(question)

    // Paso 2: Buscar FAQ en base de datos local
    const localFAQ = findSimilarFAQ(question, aiResult.category as any)

    // Paso 3: Si hay FAQ, usar esa respuesta; si no, OpenAI genera una
    let autoResponse: string | undefined

    if (localFAQ) {
      autoResponse = localFAQ.answer
    } else if (aiResult.hasAutoResponse) {
      // Generar respuesta detallada con OpenAI
      autoResponse = await generateDetailedResponse(question, aiResult.category)
    }

    const response: FilterQuestionResponse = {
      success: true,
      data: {
        question,
        category: aiResult.category,
        hasAutoResponse: !!autoResponse,
        autoResponse,
        reasoning: aiResult.reasoning,
        confidence: aiResult.confidence,
      },
    }

    res.json(response)
  } catch (error) {
    console.error('Error in filter-question endpoint:', error)
    
    // Capturar errores específicos de Gemini
    let errorMessage = 'Error al procesar la consulta. Por favor, intenta de nuevo.'
    
    if (error instanceof Error) {
      if (error.message.includes('overloaded') || error.message.includes('503')) {
        errorMessage = 'El servicio de IA está temporalmente sobrecargado. Por favor, intenta de nuevo en unos segundos.'
      } else if (error.message.includes('not configured') || error.message.includes('API key')) {
        errorMessage = 'El servicio de IA no está disponible en este momento. Por favor, contacta al administrador.'
      } else if (error.message.includes('404')) {
        errorMessage = 'El modelo de IA no está disponible. Por favor, contacta al administrador.'
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorMessage = 'Se ha alcanzado el límite de consultas. Por favor, intenta más tarde.'
      } else {
        errorMessage = `Error: ${error.message}`
      }
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage,
    } as FilterQuestionResponse)
  }
})

/**
 * POST /api/generate-response
 * Genera una respuesta detallada para una pregunta específica
 */
router.post('/generate-response', async (req: Request, res: Response) => {
  try {
    const { question, category } = req.body as { question: string; category: string }

    if (!question || !category) {
      res.status(400).json({
        success: false,
        error: 'Question and category are required',
      })
      return
    }

    const response = await generateDetailedResponse(question, category)

    res.json({
      success: true,
      data: {
        question,
        category,
        response,
      },
    })
  } catch (error) {
    console.error('Error in generate-response endpoint:', error)
    
    // Capturar errores específicos de Gemini
    let errorMessage = 'Error al generar la respuesta. Por favor, intenta de nuevo.'
    
    if (error instanceof Error) {
      if (error.message.includes('overloaded') || error.message.includes('503')) {
        errorMessage = 'El servicio de IA está temporalmente sobrecargado. Por favor, intenta de nuevo en unos segundos.'
      } else if (error.message.includes('not configured') || error.message.includes('API key')) {
        errorMessage = 'El servicio de IA no está disponible en este momento.'
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorMessage = 'Se ha alcanzado el límite de consultas. Por favor, intenta más tarde.'
      }
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage,
    })
  }
})

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})

export default router
