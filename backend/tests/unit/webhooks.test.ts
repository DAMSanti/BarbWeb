/**
 * Unit Tests - Webhooks Routes
 * Tests para manejo de webhooks de Stripe (pagos, reembolsos, fallos)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import request from 'supertest'
import express from 'express'

// Hoist mocks to be available in vi.mock() calls
const { mockPrisma, mockEmailService, mockLogger, mockStripeInstance, MockStripeConstructor } = vi.hoisted(() => {
  const mockStripeInstance = {
    webhooks: {
      constructEvent: vi.fn(),
    },
  }

  // Mock stripe - create a class that acts as constructor
  class MockStripeConstructor {
    webhooks = mockStripeInstance.webhooks
  }
  
  return {
    mockPrisma: {
      payment: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
    },
    mockEmailService: {
      sendPaymentConfirmationEmail: vi.fn(),
      sendLawyerNotificationEmail: vi.fn(),
      sendPaymentFailedEmail: vi.fn(),
      sendRefundConfirmationEmail: vi.fn(),
    },
    mockLogger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    mockStripeInstance,
    MockStripeConstructor,
  }
})

vi.mock('stripe', () => {
  return {
    default: MockStripeConstructor as any,
  }
})

vi.mock('../../src/db/init', () => ({
  getPrismaClient: () => mockPrisma,
}))

vi.mock('../../src/services/emailService', () => ({
  sendPaymentConfirmationEmail: mockEmailService.sendPaymentConfirmationEmail,
  sendLawyerNotificationEmail: mockEmailService.sendLawyerNotificationEmail,
  sendPaymentFailedEmail: mockEmailService.sendPaymentFailedEmail,
  sendRefundConfirmationEmail: mockEmailService.sendRefundConfirmationEmail,
}))

vi.mock('../../src/utils/logger', () => ({
  logger: mockLogger,
}))

// Import after mocking
import webhookRouter from '../../src/routes/webhooks'

describe('Webhooks Routes', () => {
  let app: express.Application

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup express app with webhook router
    app = express()
    app.use(express.raw({ type: 'application/json' }))
    app.use('/webhooks', webhookRouter)
    
    // Error handler for tests
    app.use((err: any, _req: any, res: any, _next: any) => {
      const status = err.statusCode || err.status || 500
      res.status(status).json({ success: false, error: err.message || 'Internal server error' })
    })
    
    process.env.STRIPE_SECRET_KEY = 'sk_test_123456789'
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123456789'
  })

  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY
    delete process.env.STRIPE_WEBHOOK_SECRET
  })

  describe('POST /stripe - Webhook handler', () => {
    it('should reject webhook without signature', async () => {
      const response = await request(app)
        .post('/webhooks/stripe')
        .send({ type: 'payment_intent.succeeded' })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })

    it('should verify webhook signature correctly', async () => {
      const body = Buffer.from(JSON.stringify({ type: 'payment_intent.succeeded' }))
      const signature = 'valid_signature_123'

      mockStripeInstance.webhooks.constructEvent.mockImplementation((receivedBody, receivedSignature, secret) => {
        if (receivedSignature === signature && secret === process.env.STRIPE_WEBHOOK_SECRET) {
          return {
            id: 'evt_test_001',
            type: 'payment_intent.succeeded',
            data: {
              object: {
                id: 'pi_test_001',
                amount: 10000,
                currency: 'eur',
                metadata: { userId: 'user_001' },
              },
            },
          }
        }
        throw new Error('Invalid signature')
      })

      mockPrisma.payment.findFirst.mockImplementation(async () => null)
      mockPrisma.payment.create.mockImplementation(async (args) => ({
        id: 'payment_created_001',
        ...args.data,
      }))
      mockPrisma.user.findUnique.mockImplementation(async () => ({
        id: 'user_001',
        email: 'user@example.com',
        name: 'John Doe',
      }))
      mockEmailService.sendPaymentConfirmationEmail.mockImplementation(async () => true)
      mockEmailService.sendLawyerNotificationEmail.mockImplementation(async () => true)

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', signature)
        .send(body)
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(200)
      expect(response.body.received).toBe(true)
    })

    it('should reject invalid webhook signature', async () => {
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Webhook signature verification failed')
      })

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'invalid_signature')
        .send({ type: 'payment_intent.succeeded' })
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(400)
      expect(mockLogger.error).toHaveBeenCalled()
    })
  })

  describe('payment_intent.succeeded event', () => {
    it('should create payment for new paymentIntent', async () => {
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => ({
        id: 'evt_new_payment_001',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_new_001',
            amount: 50000,
            currency: 'eur',
            metadata: {
              userId: 'user_new_001',
              clientName: 'Jane Smith',
              consultationSummary: 'Divorcio',
              category: 'Familia',
            },
            receipt_email: 'jane@example.com',
          },
        },
      }))

      mockPrisma.payment.findFirst.mockImplementation(async () => null)
      mockPrisma.payment.create.mockImplementation(async (args) => ({
        id: 'payment_new_001',
        ...args.data,
      }))
      mockPrisma.user.findUnique.mockImplementation(async () => ({
        id: 'user_new_001',
        email: 'jane@example.com',
        name: 'Jane Smith',
      }))
      mockEmailService.sendPaymentConfirmationEmail.mockImplementation(async () => true)
      mockEmailService.sendLawyerNotificationEmail.mockImplementation(async () => true)

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'sig_123')
        .send(Buffer.from(JSON.stringify({})))
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(200)
      expect(mockPrisma.payment.create).toHaveBeenCalled()
      expect(mockEmailService.sendPaymentConfirmationEmail).toHaveBeenCalled()
    })

    it('should not duplicate existing payments', async () => {
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => ({
        id: 'evt_duplicate_001',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_duplicate_001',
            amount: 30000,
            currency: 'eur',
            metadata: { userId: 'user_duplicate_001' },
            receipt_email: 'duplicate@example.com',
          },
        },
      }))

      mockPrisma.payment.findFirst.mockImplementation(async () => ({
        id: 'existing_payment_001',
        stripeSessionId: 'pi_duplicate_001',
        status: 'completed',
      }))
      mockPrisma.user.findUnique.mockImplementation(async () => ({
        id: 'user_duplicate_001',
        email: 'duplicate@example.com',
      }))
      mockEmailService.sendPaymentConfirmationEmail.mockImplementation(async () => true)
      mockEmailService.sendLawyerNotificationEmail.mockImplementation(async () => true)

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'sig_123')
        .send(Buffer.from(JSON.stringify({})))
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(200)
      expect(mockPrisma.payment.create).not.toHaveBeenCalled()
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Pago ya registrado, ignorando duplicado',
        expect.any(Object)
      )
    })

    it('should send confirmation emails to client and lawyer', async () => {
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => ({
        id: 'evt_email_001',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_email_001',
            amount: 25000,
            currency: 'eur',
            metadata: {
              userId: 'user_email_001',
              clientName: 'Carlos López',
              consultationSummary: 'Civil',
              category: 'Contrato',
            },
            receipt_email: 'carlos@example.com',
          },
        },
      }))

      mockPrisma.payment.findFirst.mockImplementation(async () => null)
      mockPrisma.payment.create.mockImplementation(async (args) => ({ id: 'payment_001' }))
      mockPrisma.user.findUnique.mockImplementation(async () => ({
        id: 'user_email_001',
        email: 'carlos@example.com',
        name: 'Carlos López',
      }))
      mockEmailService.sendPaymentConfirmationEmail.mockImplementation(async () => true)
      mockEmailService.sendLawyerNotificationEmail.mockImplementation(async () => true)

      await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'sig_123')
        .send(Buffer.from(JSON.stringify({})))
        .set('Content-Type', 'application/json')

      expect(mockEmailService.sendPaymentConfirmationEmail).toHaveBeenCalledWith(
        'carlos@example.com',
        expect.objectContaining({
          clientName: 'Carlos López',
          amount: 250,
        })
      )
      expect(mockEmailService.sendLawyerNotificationEmail).toHaveBeenCalled()
    })

    it('should use fallback email when receipt_email not provided', async () => {
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => ({
        id: 'evt_fallback_001',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_fallback_001',
            amount: 15000,
            currency: 'eur',
            metadata: { userId: 'user_fallback_001' },
          },
        },
      }))

      mockPrisma.payment.findFirst.mockImplementation(async () => null)
      mockPrisma.payment.create.mockImplementation(async () => ({ id: 'payment_001' }))
      mockPrisma.user.findUnique.mockImplementation(async () => ({
        id: 'user_fallback_001',
        email: 'fallback@example.com',
        name: 'Fallback User',
      }))
      mockEmailService.sendPaymentConfirmationEmail.mockImplementation(async () => true)
      mockEmailService.sendLawyerNotificationEmail.mockImplementation(async () => true)

      await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'sig_123')
        .send(Buffer.from(JSON.stringify({})))
        .set('Content-Type', 'application/json')

      expect(mockEmailService.sendPaymentConfirmationEmail).toHaveBeenCalledWith(
        'fallback@example.com',
        expect.any(Object)
      )
    })

    it('should handle missing userId gracefully', async () => {
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => ({
        id: 'evt_no_user_001',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_no_user_001',
            amount: 10000,
            currency: 'eur',
            metadata: {},
            receipt_email: 'nouser@example.com',
          },
        },
      }))

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'sig_123')
        .send(Buffer.from(JSON.stringify({})))
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(200)
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'PaymentIntent sin userId',
        expect.any(Object)
      )
      expect(mockPrisma.payment.create).not.toHaveBeenCalled()
    })

    it('should handle email sending failures gracefully', async () => {
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => ({
        id: 'evt_email_fail_001',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_email_fail_001',
            amount: 20000,
            currency: 'eur',
            metadata: { userId: 'user_email_fail_001' },
            receipt_email: 'fail@example.com',
          },
        },
      }))

      mockPrisma.payment.findFirst.mockImplementation(async () => null)
      mockPrisma.payment.create.mockImplementation(async () => ({ id: 'payment_001' }))
      mockPrisma.user.findUnique.mockImplementation(async () => ({
        id: 'user_email_fail_001',
        email: 'fail@example.com',
      }))
      mockEmailService.sendPaymentConfirmationEmail.mockImplementation(
        async () => {
          throw new Error('Email service down')
        }
      )
      mockEmailService.sendLawyerNotificationEmail.mockImplementation(async () => true)

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'sig_123')
        .send(Buffer.from(JSON.stringify({})))
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(200)
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error enviando email de confirmación',
        expect.any(Object)
      )
    })

    it('should handle lawyer notification email failure gracefully', async () => {
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => ({
        id: 'evt_lawyer_email_fail_001',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_lawyer_fail_001',
            amount: 25000,
            currency: 'eur',
            metadata: {
              userId: 'user_lawyer_fail_001',
              clientName: 'Test Client',
              category: 'Legal',
              consultationSummary: 'Test summary',
            },
            receipt_email: 'client@example.com',
          },
        },
      }))

      mockPrisma.payment.findFirst.mockImplementation(async () => null)
      mockPrisma.payment.create.mockImplementation(async () => ({ id: 'payment_001' }))
      mockPrisma.user.findUnique.mockImplementation(async () => ({
        id: 'user_lawyer_fail_001',
        email: 'client@example.com',
        name: 'Test Client',
      }))
      mockEmailService.sendPaymentConfirmationEmail.mockImplementation(async () => true)
      mockEmailService.sendLawyerNotificationEmail.mockImplementation(async () => {
        throw new Error('Lawyer email service down')
      })

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'sig_123')
        .send(Buffer.from(JSON.stringify({})))
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(200)
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error enviando notificación al abogado',
        expect.any(Object)
      )
    })
  })

  describe('payment_intent.payment_failed event', () => {
    it('should log payment failure and send notification', async () => {
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => ({
        id: 'evt_failed_001',
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_failed_001',
            amount: 40000,
            currency: 'eur',
            metadata: { userId: 'user_failed_001', clientName: 'John Failure' },
            receipt_email: 'failure@example.com',
            last_payment_error: { message: 'Card declined' },
          },
        },
      }))

      mockPrisma.user.findUnique.mockImplementation(async () => ({
        id: 'user_failed_001',
        email: 'failure@example.com',
        name: 'John Failure',
      }))
      mockEmailService.sendPaymentFailedEmail.mockImplementation(async () => true)

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'sig_123')
        .send(Buffer.from(JSON.stringify({})))
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(200)
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Pago fallido',
        expect.any(Object)
      )
      expect(mockEmailService.sendPaymentFailedEmail).toHaveBeenCalledWith(
        'failure@example.com',
        expect.any(Object)
      )
    })

    it('should handle payment failure without user gracefully', async () => {
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => ({
        id: 'evt_failed_no_user_001',
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_failed_no_user_001',
            amount: 35000,
            currency: 'eur',
            metadata: {},
            receipt_email: 'nouser_fail@example.com',
            last_payment_error: { message: 'Insufficient funds' },
          },
        },
      }))

      mockPrisma.user.findUnique.mockImplementation(async () => null)
      mockEmailService.sendPaymentFailedEmail.mockImplementation(async () => true)

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'sig_123')
        .send(Buffer.from(JSON.stringify({})))
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(200)
      expect(mockEmailService.sendPaymentFailedEmail).toHaveBeenCalledWith(
        'nouser_fail@example.com',
        expect.any(Object)
      )
    })

    it('should handle payment failed email sending failure gracefully', async () => {
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => ({
        id: 'evt_failed_email_error_001',
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_failed_email_error_001',
            amount: 30000,
            currency: 'eur',
            metadata: { userId: 'user_failed_email_error_001' },
            receipt_email: 'failed_email_error@example.com',
            last_payment_error: { message: 'Card expired' },
          },
        },
      }))

      mockPrisma.user.findUnique.mockImplementation(async () => ({
        id: 'user_failed_email_error_001',
        email: 'failed_email_error@example.com',
        name: 'Failed User',
      }))
      mockEmailService.sendPaymentFailedEmail.mockImplementation(async () => {
        throw new Error('Email service unavailable')
      })

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'sig_123')
        .send(Buffer.from(JSON.stringify({})))
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(200)
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error enviando email de pago fallido',
        expect.any(Object)
      )
    })
  })

  describe('charge.refunded event', () => {
    it('should update payment status to refunded', async () => {
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => ({
        id: 'evt_refund_001',
        type: 'charge.refunded',
        data: {
          object: {
            id: 'ch_refund_001',
            payment_intent: 'pi_refund_001',
            amount_refunded: 50000,
            currency: 'eur',
            receipt_email: 'refund@example.com',
          },
        },
      }))

      mockPrisma.payment.findFirst.mockImplementation(async () => ({
        id: 'payment_refund_001',
        userId: 'user_refund_001',
        stripeSessionId: 'pi_refund_001',
      }))
      mockPrisma.payment.update.mockImplementation(async () => ({
        id: 'payment_refund_001',
        status: 'refunded',
      }))
      mockPrisma.user.findUnique.mockImplementation(async () => ({
        id: 'user_refund_001',
        email: 'refund@example.com',
        name: 'Refund User',
      }))
      mockEmailService.sendRefundConfirmationEmail.mockImplementation(async () => true)

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'sig_123')
        .send(Buffer.from(JSON.stringify({})))
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(200)
      expect(mockPrisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'payment_refund_001' },
          data: { status: 'refunded' },
        })
      )
      expect(mockEmailService.sendRefundConfirmationEmail).toHaveBeenCalled()
    })

    it('should handle missing payment for refund gracefully', async () => {
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => ({
        id: 'evt_refund_not_found_001',
        type: 'charge.refunded',
        data: {
          object: {
            id: 'ch_not_found_001',
            payment_intent: 'pi_not_found_001',
            amount_refunded: 25000,
            currency: 'eur',
            receipt_email: 'notfound@example.com',
          },
        },
      }))

      mockPrisma.payment.findFirst.mockImplementation(async () => null)

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'sig_123')
        .send(Buffer.from(JSON.stringify({})))
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(200)
      expect(mockPrisma.payment.update).not.toHaveBeenCalled()
    })

    it('should send refund email using user email when no receipt_email', async () => {
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => ({
        id: 'evt_refund_user_email_001',
        type: 'charge.refunded',
        data: {
          object: {
            id: 'ch_user_email_001',
            payment_intent: 'pi_user_email_001',
            amount_refunded: 30000,
            currency: 'eur',
            // No receipt_email
          },
        },
      }))

      mockPrisma.payment.findFirst.mockImplementation(async () => ({
        id: 'payment_user_email_001',
        userId: 'user_refund_email_001',
        stripeSessionId: 'pi_user_email_001',
      }))
      mockPrisma.payment.update.mockImplementation(async () => ({
        id: 'payment_user_email_001',
        status: 'refunded',
      }))
      mockPrisma.user.findUnique.mockImplementation(async () => ({
        id: 'user_refund_email_001',
        email: 'user_fallback@example.com',
        name: 'Fallback User',
      }))
      mockEmailService.sendRefundConfirmationEmail.mockImplementation(async () => true)

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'sig_123')
        .send(Buffer.from(JSON.stringify({})))
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(200)
      expect(mockEmailService.sendRefundConfirmationEmail).toHaveBeenCalledWith(
        'user_fallback@example.com',
        expect.any(Object)
      )
    })

    it('should handle refund email sending failure gracefully', async () => {
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => ({
        id: 'evt_refund_email_fail_001',
        type: 'charge.refunded',
        data: {
          object: {
            id: 'ch_email_fail_001',
            payment_intent: 'pi_email_fail_001',
            amount_refunded: 20000,
            currency: 'eur',
            receipt_email: 'email_fail@example.com',
          },
        },
      }))

      mockPrisma.payment.findFirst.mockImplementation(async () => ({
        id: 'payment_email_fail_001',
        userId: 'user_email_fail_001',
        stripeSessionId: 'pi_email_fail_001',
      }))
      mockPrisma.payment.update.mockImplementation(async () => ({
        id: 'payment_email_fail_001',
        status: 'refunded',
      }))
      mockPrisma.user.findUnique.mockImplementation(async () => null)
      mockEmailService.sendRefundConfirmationEmail.mockImplementation(async () => {
        throw new Error('Email service unavailable')
      })

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'sig_123')
        .send(Buffer.from(JSON.stringify({})))
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(200)
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error enviando email de reembolso',
        expect.any(Object)
      )
    })

    it('should handle invalid payment_intent type in refund', async () => {
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => ({
        id: 'evt_refund_invalid_001',
        type: 'charge.refunded',
        data: {
          object: {
            id: 'ch_invalid_001',
            payment_intent: { id: 'pi_object' },
            amount_refunded: 15000,
            currency: 'eur',
          },
        },
      }))

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'sig_123')
        .send(Buffer.from(JSON.stringify({})))
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(200)
      expect(mockPrisma.payment.findFirst).not.toHaveBeenCalled()
    })

    it('should handle database error in refund processing', async () => {
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => ({
        id: 'evt_refund_db_error_001',
        type: 'charge.refunded',
        data: {
          object: {
            id: 'ch_db_error_001',
            payment_intent: 'pi_db_error_refund_001',
            amount_refunded: 25000,
            currency: 'eur',
          },
        },
      }))

      // Make findFirst throw an error to trigger the outer catch block
      mockPrisma.payment.findFirst.mockImplementation(async () => {
        throw new Error('Database connection lost')
      })

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'sig_123')
        .send(Buffer.from(JSON.stringify({})))
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(200)
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error procesando reembolso',
        expect.objectContaining({
          error: 'Database connection lost',
          chargeId: 'ch_db_error_001',
        })
      )
    })
  })

  describe('Unknown webhook events', () => {
    it('should ignore unknown event types gracefully', async () => {
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => ({
        id: 'evt_unknown_001',
        type: 'customer.subscription.updated',
        data: { object: {} },
      }))

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'sig_123')
        .send(Buffer.from(JSON.stringify({})))
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(200)
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Webhook evento ignorado',
        expect.any(Object)
      )
    })
  })

  describe('Error handling', () => {
    it('should return 400 on webhook processing error', async () => {
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Stripe verification failed')
      })

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'invalid_sig')
        .send(Buffer.from(JSON.stringify({})))
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
      expect(mockLogger.error).toHaveBeenCalled()
    })

    it('should handle database errors gracefully', async () => {
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => ({
        id: 'evt_db_error_001',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_db_error_001',
            amount: 10000,
            currency: 'eur',
            metadata: { userId: 'user_db_error_001' },
          },
        },
      }))

      mockPrisma.payment.findFirst.mockImplementation(async () => {
        throw new Error('Database connection failed')
      })

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'sig_123')
        .send(Buffer.from(JSON.stringify({})))
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(200)
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error registrando pago completado',
        expect.any(Object)
      )
    })
  })

  describe('Environment configuration', () => {
    it('should have STRIPE_SECRET_KEY configured', () => {
      expect(process.env.STRIPE_SECRET_KEY).toBe('sk_test_123456789')
    })

    it('should have STRIPE_WEBHOOK_SECRET configured', () => {
      expect(process.env.STRIPE_WEBHOOK_SECRET).toBe('whsec_test_123456789')
    })

    it('should reject webhook when STRIPE_WEBHOOK_SECRET is missing', async () => {
      delete process.env.STRIPE_WEBHOOK_SECRET

      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('STRIPE_WEBHOOK_SECRET no configurado')
      })

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'sig_123')
        .send(Buffer.from(JSON.stringify({})))
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(400)
    })
  })
})
