import { Router, Request, Response } from 'express'
import Stripe from 'stripe'
import { verifyToken } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { paymentLimiter } from '../middleware/security.js'
import { getPrismaClient } from '../db/init.js'
import { logger } from '../utils/logger.js'
import { ValidationError, PaymentError } from '../utils/errors.js'
import { z } from 'zod'

const router = Router()

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Validation schemas
const createPaymentIntentSchema = z.object({
  amount: z.number().min(10, 'Monto mínimo es 10 USD'),
  currency: z.string().default('usd'),
  consultationId: z.string().optional(),
  description: z.string().optional(),
})

const confirmPaymentSchema = z.object({
  paymentIntentId: z.string(),
  consultationId: z.string().optional(),
})

/**
 * @swagger
 * /api/payments/create-payment-intent:
 *   post:
 *     summary: Crear intención de pago
 *     description: Crear un PaymentIntent de Stripe para procesar un pago
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentIntentRequest'
 *     responses:
 *       200:
 *         description: PaymentIntent creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 clientSecret: { type: string, description: Client secret para Stripe.js }
 *                 paymentIntentId: { type: string }
 *       400:
 *         description: Datos de pago inválidos
 *       401:
 *         description: No autenticado
 *       429:
 *         description: Rate limit excedido
 */
// POST /api/payments/create-payment-intent
// Crear un PaymentIntent para cobrar
router.post(
  '/create-payment-intent',
  paymentLimiter,
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const validation = createPaymentIntentSchema.safeParse(req.body)

    if (!validation.success) {
      const fields: Record<string, string> = {}
      validation.error.issues.forEach((e: any) => {
        const path = e.path.join('.')
        fields[path] = e.message
      })
      throw new ValidationError('Datos de pago inválidos', fields)
    }

    const { amount, currency, consultationId, description } = validation.data
    const userId = (req as any).user.userId

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        description: description || 'Consulta Legal - Barbara & Abogados',
        metadata: {
          userId,
          consultationId: consultationId || 'new',
        },
      })

      logger.info('PaymentIntent created', {
        paymentIntentId: paymentIntent.id,
        userId,
        amount,
      })

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      })
    } catch (error) {
      logger.error('Stripe error creating PaymentIntent', {
        error: error instanceof Error ? error.message : String(error),
        userId,
      })
      throw new PaymentError('No se pudo crear la intención de pago')
    }
  })
)

/**
 * @swagger
 * /api/payments/confirm-payment:
 *   post:
 *     summary: Confirmar pago
 *     description: Verificar que un pago fue completado exitosamente en Stripe
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paymentIntentId]
 *             properties:
 *               paymentIntentId: { type: string }
 *               consultationId: { type: string }
 *     responses:
 *       200:
 *         description: Pago confirmado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 paymentIntentId: { type: string }
 *                 amount: { type: number }
 *       400:
 *         description: Estado de pago inválido
 *       401:
 *         description: No autenticado o pago no pertenece al usuario
 */
// POST /api/payments/confirm-payment
// Confirmar un pago (backend verification)
// NOTE: El pago se guarda en la BD solo a través del webhook de Stripe
router.post(
  '/confirm-payment',
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const validation = confirmPaymentSchema.safeParse(req.body)

    if (!validation.success) {
      const fields: Record<string, string> = {}
      validation.error.issues.forEach((e: any) => {
        const path = e.path.join('.')
        fields[path] = e.message
      })
      throw new ValidationError('Datos de confirmación inválidos', fields)
    }

    const { paymentIntentId, consultationId } = validation.data
    const userId = (req as any).user.userId

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

      if (paymentIntent.metadata.userId !== userId) {
        throw new PaymentError('Este pago no pertenece a tu cuenta')
      }

      if (paymentIntent.status !== 'succeeded') {
        throw new PaymentError(
          `Estado de pago inválido: ${paymentIntent.status}. Intenta de nuevo.`
        )
      }

      // Simply confirm the payment was successful
      // Payment record will be created by the Stripe webhook
      logger.info('Payment confirmed by client', {
        paymentIntentId,
        userId,
        amount: paymentIntent.amount / 100,
      })

      res.json({
        success: true,
        message: 'Pago confirmado exitosamente',
        paymentIntentId,
        amount: paymentIntent.amount / 100,
      })
    } catch (error) {
      logger.error('Stripe error confirming payment', {
        error: error instanceof Error ? error.message : String(error),
        paymentIntentId,
      })
      throw error instanceof PaymentError
        ? error
        : new PaymentError('No se pudo confirmar el pago')
    }
  })
)

/**
 * @swagger
 * /api/payments/history:
 *   get:
 *     summary: Historial de pagos
 *     description: Obtener el historial de pagos del usuario autenticado
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pagos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 payments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *       401:
 *         description: No autenticado
 */
// GET /api/payments/history
// Obtener historial de pagos del usuario
router.get(
  '/history',
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId

      if (!userId) {
        throw new ValidationError('Usuario no identificado')
      }

      logger.info('Obteniendo historial de pagos', { userId })

  const payments = await getPrismaClient().payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })

      logger.info('Historial de pagos obtenido', {
        userId,
        paymentCount: payments.length,
      })

      res.json({
        success: true,
        payments: payments.map((p) => ({
          id: p.id,
          amount: p.amount,
          status: p.status,
          consultationSummary: p.consultationSummary,
          createdAt: p.createdAt,
        })),
      })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      logger.error('Error obteniendo historial de pagos', {
        error: errorMsg,
        stack: error instanceof Error ? error.stack : undefined,
        userId: (req as any).user?.userId,
      })
      throw error instanceof ValidationError
        ? error
        : new PaymentError(`No se pudo obtener el historial de pagos: ${errorMsg}`)
    }
  })
)

/**
 * @swagger
 * /api/payments/{paymentId}/refund:
 *   post:
 *     summary: Solicitar reembolso
 *     description: Solicitar reembolso de un pago completado
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pago a reembolsar
 *     responses:
 *       200:
 *         description: Reembolso procesado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 refundId: { type: string }
 *                 amount: { type: number }
 *       400:
 *         description: Pago no encontrado o no elegible para reembolso
 *       401:
 *         description: No autenticado o sin permiso
 */
// POST /api/payments/:id/refund
// Refundar un pago (solo pagos completados)
router.post(
  '/:paymentId/refund',
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { paymentId } = req.params
    const userId = (req as any).user.userId

  const payment = await getPrismaClient().payment.findUnique({
      where: { id: paymentId },
    })

    if (!payment) {
      throw new ValidationError('Pago no encontrado')
    }

    if (payment.userId !== userId) {
      throw new PaymentError('No tienes permiso para refundar este pago')
    }

    if (payment.status !== 'completed') {
      throw new PaymentError(
        'Solo se pueden refundar pagos completados'
      )
    }

    try {
      if (!payment.stripeSessionId) {
        throw new PaymentError('Este pago no tiene un ID de Stripe válido')
      }

      const refund = await stripe.refunds.create({
        payment_intent: payment.stripeSessionId,
      })

          await getPrismaClient().payment.update({
        where: { id: paymentId },
        data: {
          status: 'refunded',
        },
      })

      logger.info('Refund created', {
        refundId: refund.id,
        paymentId,
        userId,
        amount: payment.amount,
      })

      res.json({
        success: true,
        message: 'Reembolso procesado exitosamente',
        refundId: refund.id,
        amount: payment.amount,
      })
    } catch (error) {
      logger.error('Stripe error creating refund', {
        error: error instanceof Error ? error.message : String(error),
        paymentId,
      })
      throw new PaymentError('No se pudo procesar el reembolso')
    }
  })
)

export default router
