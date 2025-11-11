import { Router, Request, Response, raw } from 'express'
import Stripe from 'stripe'
import prisma from '../db/init.js'
import { logger } from '../utils/logger.js'
import { ValidationError } from '../utils/errors.js'

const router = Router()

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Webhook signature verification
const verifyWebhookSignature = (
  body: Buffer,
  signature: string
): Stripe.Event => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new ValidationError('STRIPE_WEBHOOK_SECRET no configurado')
  }

  try {
    return stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    throw new ValidationError(
      `Webhook signature inválida: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

// POST /webhooks/stripe
// Escuchar eventos de Stripe
router.post(
  '/stripe',
  raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string

    if (!signature) {
      logger.warn('Webhook stripe sin firma')
      return res.status(400).json({ error: 'Sin firma de webhook' })
    }

    try {
      const event = verifyWebhookSignature(req.body, signature)

      logger.info('Webhook evento recibido', {
        eventType: event.type,
        eventId: event.id,
      })

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
          break

        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
          break

        case 'charge.refunded':
          await handleChargeRefunded(event.data.object as Stripe.Charge)
          break

        default:
          logger.info('Webhook evento ignorado', { eventType: event.type })
      }

      res.json({ received: true })
    } catch (error) {
      logger.error('Error procesando webhook', {
        error: error instanceof Error ? error.message : String(error),
      })
      res.status(400).json({ error: 'Webhook error' })
    }
  }
)

// Handle payment_intent.succeeded
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const userId = paymentIntent.metadata?.userId
    const consultationId = paymentIntent.metadata?.consultationId

    if (!userId) {
      logger.warn('PaymentIntent sin userId', {
        paymentIntentId: paymentIntent.id,
      })
      return
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findFirst({
      where: { stripePaymentId: paymentIntent.id },
    })

    if (existingPayment) {
      logger.info('Pago ya registrado, ignorando duplicado', {
        paymentIntentId: paymentIntent.id,
      })
      return
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        stripePaymentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        status: 'completed',
        consultationDetails: 'Consulta legal - Pago procesado vía Stripe',
      },
    })

    logger.info('Pago registrado desde webhook', {
      paymentId: payment.id,
      paymentIntentId: paymentIntent.id,
      userId,
      amount: paymentIntent.amount / 100,
    })

    // TODO: Enviar email de confirmación
    // TODO: Notificar al abogado sobre la nueva consulta pagada
  } catch (error) {
    logger.error('Error registrando pago completado', {
      error: error instanceof Error ? error.message : String(error),
      paymentIntentId: paymentIntent.id,
    })
  }
}

// Handle payment_intent.payment_failed
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata?.userId

  logger.warn('Pago fallido', {
    paymentIntentId: paymentIntent.id,
    userId,
    lastPaymentError: paymentIntent.last_payment_error?.message,
  })

  // TODO: Enviar email notificando fallo del pago
}

// Handle charge.refunded
async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    if (charge.payment_intent && typeof charge.payment_intent === 'string') {
      const payment = await prisma.payment.findFirst({
        where: { stripePaymentId: charge.payment_intent },
      })

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'refunded',
          },
        })

        logger.info('Pago marcado como reembolsado', {
          paymentId: payment.id,
          chargeId: charge.id,
          refundedAmount: charge.amount_refunded / 100,
        })

        // TODO: Enviar email de reembolso confirmado
      }
    }
  } catch (error) {
    logger.error('Error procesando reembolso', {
      error: error instanceof Error ? error.message : String(error),
      chargeId: charge.id,
    })
  }
}

export default router
