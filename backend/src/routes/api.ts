import { Router, Request, Response } from 'express'
import { filterQuestionWithAI, generateDetailedResponse } from '../services/openaiService.js'
import { findSimilarFAQ } from '../utils/faqDatabase.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { validate } from '../middleware/validation.js'
import { apiRateLimit } from '../middleware/rateLimit.js'
import { FilterQuestionSchema, GenerateDetailedResponseSchema } from '../schemas/faq.schemas.js'
import { logger } from '../utils/logger.js'
import { sendPaymentConfirmationEmail } from '../services/emailService.js'

const router = Router()

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
 * Validaciones: pregunta 10-1000 caracteres
 */
router.post(
  '/filter-question',
  apiRateLimit,
  validate(FilterQuestionSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { question } = req.body

    logger.info(`[filter-question] Processing: "${question.substring(0, 50)}..."`)

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

    logger.info(`[filter-question] Success - Category: ${aiResult.category}`)
    res.json(response)
  }),
)

/**
 * POST /api/generate-response
 * Genera una respuesta detallada para una pregunta específica
 * Validaciones: pregunta 10-1000 chars, categoría 2-100 chars
 */
router.post(
  '/generate-response',
  apiRateLimit,
  validate(GenerateDetailedResponseSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { question, category } = req.body

    logger.info(`[generate-response] Processing: "${question.substring(0, 50)}..." in category: ${category}`)

    const response = await generateDetailedResponse(question, category)

    logger.info(`[generate-response] Success`)
    res.json({
      success: true,
      data: {
        question,
        category,
        response,
      },
    })
  }),
)

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})

/**
 * GET /api/list-models
 * List available Gemini models
 */
router.get(
  '/list-models',
  asyncHandler(async (req: Request, res: Response) => {
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    
    if (!process.env.GEMINI_API_KEY) {
      const err = new Error('GEMINI_API_KEY not configured')
      ;(err as any).statusCode = 500
      throw err
    }

    // Intentar listar modelos
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY)
    const data: any = await response.json()
    
    res.json({
      success: true,
      models: data.models || data,
    })
  }),
)

/**
 * POST /api/test-email
 * Test email service (development only)
 */
router.post(
  '/test-email',
  asyncHandler(async (req: Request, res: Response) => {
    const { to, clientName } = req.body

    if (!to || !clientName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, clientName',
      })
    }

    logger.info('Sending test email', { to, clientName })

    try {
      const result = await sendPaymentConfirmationEmail(to, {
        clientName,
        amount: 50.00,
        currency: 'usd',
        category: 'Derecho Laboral',
        consultationSummary: 'Esta es una consulta de prueba para verificar que el servicio de emails funciona correctamente.',
        paymentId: 'pi_test_' + Date.now(),
      })

      res.json({
        success: true,
        message: 'Test email sent successfully',
        emailId: result?.id,
      })
    } catch (error) {
      logger.error('Error sending test email', {
        error: error instanceof Error ? error.message : String(error),
      })
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      })
    }
  }),
)

export default router
