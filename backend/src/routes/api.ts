import { Router, Request, Response } from 'express'
import { filterQuestionWithAI, generateDetailedResponse } from '../services/openaiService.js'
import { findSimilarFAQ } from '../utils/faqDatabase.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { validate } from '../middleware/validation.js'
import { apiRateLimit } from '../middleware/rateLimit.js'
import { FilterQuestionSchema, GenerateDetailedResponseSchema } from '../schemas/faq.schemas.js'
import { logger } from '../utils/logger.js'
import { sendPaymentConfirmationEmail } from '../services/emailService.js'
import { captureException } from '../config/sentry.js'

const router = Router()

/**
 * @swagger
 * /api/test-sentry:
 *   get:
 *     summary: Test Sentry integration
 *     description: Throws a test error to verify Sentry is working
 *     tags: [Health]
 *     responses:
 *       500:
 *         description: Test error thrown and captured by Sentry
 */
router.get('/test-sentry', (req: Request, res: Response) => {
  const testError = new Error('🧪 Test error from Sentry integration - ' + new Date().toISOString())
  captureException(testError, { test: true, timestamp: Date.now() })
  logger.error('Sentry test error triggered', { error: testError.message })
  res.status(500).json({
    success: false,
    error: 'Test error sent to Sentry',
    message: 'Check your Sentry dashboard for this error',
  })
})

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
 * @swagger
 * /api/filter-question:
 *   post:
 *     summary: Filtrar pregunta legal
 *     description: Analiza una pregunta legal usando IA (Gemini) para categorizarla y proporcionar una respuesta breve
 *     tags: [FAQ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FilterQuestionRequest'
 *     responses:
 *       200:
 *         description: Pregunta analizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FilterQuestionResponse'
 *       400:
 *         description: Pregunta inválida (muy corta o muy larga)
 *       429:
 *         description: Rate limit excedido
 *       500:
 *         description: Error en el servicio de IA
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
 * @swagger
 * /api/generate-response:
 *   post:
 *     summary: Generar respuesta detallada
 *     description: Genera una respuesta legal detallada para una pregunta específica usando IA
 *     tags: [FAQ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question, category]
 *             properties:
 *               question:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 example: '¿Cuántos días de vacaciones me corresponden?'
 *               category:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: 'Derecho Laboral'
 *     responses:
 *       200:
 *         description: Respuesta generada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     question: { type: string }
 *                     category: { type: string }
 *                     response: { type: string }
 *       400:
 *         description: Datos inválidos
 *       429:
 *         description: Rate limit excedido
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
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     description: Verificar que el servidor está funcionando
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servidor funcionando
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 status: { type: string, example: 'ok' }
 *                 timestamp: { type: string, format: date-time }
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})

/**
 * @swagger
 * /api/list-models:
 *   get:
 *     summary: Listar modelos de IA
 *     description: Listar los modelos de Gemini disponibles
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Lista de modelos
 *       500:
 *         description: API key no configurada
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
 * @swagger
 * /api/test-email:
 *   post:
 *     summary: Probar servicio de email
 *     description: Enviar un email de prueba (solo desarrollo)
 *     tags: [Health]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [to, clientName]
 *             properties:
 *               to: { type: string, format: email }
 *               clientName: { type: string }
 *     responses:
 *       200:
 *         description: Email enviado
 *       400:
 *         description: Campos faltantes
 *       500:
 *         description: Error enviando email
 */
router.post(
  '/test-email',
  asyncHandler(async (req: Request, res: Response) => {
    const { to, clientName } = req.body

    // Log environment variables (sin mostrar la key completa)
    logger.info('Environment check', {
      hasResendKey: !!process.env.RESEND_API_KEY,
      resendKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 8) || 'NOT_SET',
      emailFrom: process.env.EMAIL_FROM || 'NOT_SET',
    })

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

      logger.info('Email sent successfully', { emailId: result?.id })

      res.json({
        success: true,
        message: 'Test email sent successfully',
        emailId: result?.id,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorStack = error instanceof Error ? error.stack : undefined
      const errorDetails = JSON.stringify(error, Object.getOwnPropertyNames(error))
      
      logger.error('Error sending test email', {
        error: errorMessage,
        stack: errorStack,
        details: errorDetails,
      })
      
      res.status(500).json({
        success: false,
        error: errorMessage,
        stack: errorStack,
        details: errorDetails,
      })
    }
  }),
)

export default router
