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
      return res.status(400).json({
        success: false,
        error: 'Question is required and must be a string',
      } as FilterQuestionResponse)
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
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
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
      return res.status(400).json({
        success: false,
        error: 'Question and category are required',
      })
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
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
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
