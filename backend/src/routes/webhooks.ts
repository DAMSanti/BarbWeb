import { Router, Request, Response, raw } from 'express'
import Stripe from 'stripe'
import { getPrismaClient } from '../db/init.js'
import { logger } from '../utils/logger.js'
import { ValidationError } from '../utils/errors.js'
import {
  sendPaymentConfirmationEmail,
  sendLawyerNotificationEmail,
  sendPaymentFailedEmail,
  sendRefundConfirmationEmail,
  sendInvoiceEmail,
} from '../services/emailService.js'

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
    const existingPayment = await getPrismaClient().payment.findFirst({
      where: { stripeSessionId: paymentIntent.id },
    })

    let payment = existingPayment

    // Only create payment if it doesn't exist
    if (!existingPayment) {
      payment = await getPrismaClient().payment.create({
        data: {
          userId,
          stripeSessionId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          status: 'completed',
          consultationSummary: 'Consulta legal - Pago procesado vía Stripe',
          question: 'Consulta por pago directo',
          category: 'Otros',
        },
      })

      logger.info('Pago registrado desde webhook', {
        paymentId: payment.id,
        paymentIntentId: paymentIntent.id,
        userId,
        amount: paymentIntent.amount / 100,
      })
    } else {
      logger.info('Pago ya registrado, ignorando duplicado', {
        paymentIntentId: paymentIntent.id,
      })
    }

    // Always send emails (even if duplicate) because webhook fires after confirmation
    const user = await getPrismaClient().user.findUnique({
      where: { id: userId },
    })

    const clientEmail = paymentIntent.receipt_email || user?.email
    const clientName = paymentIntent.metadata?.clientName || user?.name || 'Cliente'
    const consultationSummary = paymentIntent.metadata?.consultationSummary || 'Consulta legal general'
    const category = paymentIntent.metadata?.category || 'General'

    // Send confirmation email to client
    if (clientEmail) {
      try {
        await sendPaymentConfirmationEmail(clientEmail, {
          clientName,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          category,
          consultationSummary,
          paymentId: paymentIntent.id,
        })
        logger.info('Email de confirmación enviado al cliente', { email: clientEmail })
      } catch (emailError) {
        logger.error('Error enviando email de confirmación', {
          error: emailError instanceof Error ? emailError.message : String(emailError),
          email: clientEmail,
        })
      }
    }

    // Send notification to lawyer
    if (clientEmail) {
      try {
        await sendLawyerNotificationEmail({
          clientName,
          clientEmail,
          amount: paymentIntent.amount / 100,
          category,
          consultationSummary,
          paymentId: paymentIntent.id,
        })
        logger.info('Notificación enviada al abogado')
      } catch (emailError) {
        logger.error('Error enviando notificación al abogado', {
          error: emailError instanceof Error ? emailError.message : String(emailError),
        })
      }
    }

    // Send invoice email to client
    if (clientEmail && payment) {
      try {
        const invoiceDate = new Date()
        const invoiceNumber = `INV-${invoiceDate.getFullYear()}${String(invoiceDate.getMonth() + 1).padStart(2, '0')}${String(invoiceDate.getDate()).padStart(2, '0')}-${payment.id.slice(-6).toUpperCase()}`
        const baseAmount = paymentIntent.amount / 100
        const taxRate = 0.21 // 21% IVA
        const taxAmount = baseAmount * taxRate
        const totalAmount = baseAmount + taxAmount

        await sendInvoiceEmail(clientEmail, {
          clientName,
          invoiceNumber,
          date: invoiceDate.toLocaleDateString('es-ES', { dateStyle: 'long' }),
          category,
          description: `Consulta legal profesional - ${category}`,
          amount: baseAmount,
          currency: paymentIntent.currency,
          taxAmount,
          totalAmount,
          paymentIntentId: paymentIntent.id,
        })
        logger.info('Factura enviada al cliente', { email: clientEmail, invoiceNumber })
      } catch (emailError) {
        logger.error('Error enviando factura', {
          error: emailError instanceof Error ? emailError.message : String(emailError),
          email: clientEmail,
        })
      }
    }
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

  // Get user data
  const user = userId
    ? await getPrismaClient().user.findUnique({ where: { id: userId } })
    : null

  const clientEmail = paymentIntent.receipt_email || user?.email
  const clientName = paymentIntent.metadata?.clientName || user?.name || 'Cliente'

  // Send payment failed email
  if (clientEmail) {
    try {
      await sendPaymentFailedEmail(clientEmail, {
        clientName,
        amount: paymentIntent.amount / 100,
        errorMessage: paymentIntent.last_payment_error?.message,
      })
      logger.info('Email de pago fallido enviado', { email: clientEmail })
    } catch (emailError) {
      logger.error('Error enviando email de pago fallido', {
        error: emailError instanceof Error ? emailError.message : String(emailError),
        email: clientEmail,
      })
    }
  }
}

// Handle charge.refunded
async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    if (charge.payment_intent && typeof charge.payment_intent === 'string') {
  const payment = await getPrismaClient().payment.findFirst({
        where: { stripeSessionId: charge.payment_intent },
      })

      if (payment) {
  await getPrismaClient().payment.update({
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

        // Get user and payment data
  const user = await getPrismaClient().user.findUnique({
          where: { id: payment.userId },
        })

        const clientEmail = charge.receipt_email || user?.email
        const clientName = user?.name || 'Cliente'

        // Send refund confirmation email
        if (clientEmail) {
          try {
            await sendRefundConfirmationEmail(clientEmail, {
              clientName,
              amount: charge.amount_refunded / 100,
              currency: charge.currency,
            })
            logger.info('Email de reembolso enviado', { email: clientEmail })
          } catch (emailError) {
            logger.error('Error enviando email de reembolso', {
              error: emailError instanceof Error ? emailError.message : String(emailError),
              email: clientEmail,
            })
          }
        }
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
