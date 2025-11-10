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
    briefAnswer: string
    needsProfessionalConsultation: boolean
    reasoning: string
    confidence: number
    complexity: 'simple' | 'medium' | 'complex'
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

    // Paso 1: Usar el agente IA para analizar y responder
    const aiResult = await filterQuestionWithAI(question)

    // Paso 2: Buscar FAQ en base de datos local (opcional, como complemento)
    const localFAQ = findSimilarFAQ(question, aiResult.category as any)

    // Paso 3: Priorizar respuesta local si existe, si no usar la del agente IA
    const finalAnswer = localFAQ ? localFAQ.answer : aiResult.briefAnswer

    const response: FilterQuestionResponse = {
      success: true,
      data: {
        question,
        category: aiResult.category,
        briefAnswer: finalAnswer,
        needsProfessionalConsultation: aiResult.needsProfessionalConsultation,
        reasoning: aiResult.reasoning,
        confidence: aiResult.confidence,
        complexity: aiResult.complexity,
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

/**
 * GET /api/list-models
 * List available Gemini models
 */
router.get('/list-models', async (req: Request, res: Response) => {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    
    if (!process.env.GEMINI_API_KEY) {
      res.status(400).json({
        success: false,
        error: 'GEMINI_API_KEY not configured',
      })
      return
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    
    // Intentar listar modelos
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY)
    const data: any = await response.json()
    
    res.json({
      success: true,
      models: data.models || data,
    })
  } catch (error) {
    console.error('Error listing models:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list models',
    })
  }
})

export default router
