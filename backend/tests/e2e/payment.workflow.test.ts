/**
 * E2E Workflow Tests - Payment Flows
 * Complete payment journeys: Consultation → Payment Intent → Confirm → Success
 * Refund workflows, Failed payments, Email notifications
 * Uses mocked services - NO real Stripe or database
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'

// Hoist mocks before imports
const {
  mockPrisma,
  mockStripe,
  mockEmailService,
} = vi.hoisted(() => {
  return {
    mockPrisma: {
      consultation: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      payment: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
    },
    mockStripe: {
      paymentIntents: {
        create: vi.fn(),
        retrieve: vi.fn(),
        confirm: vi.fn(),
        cancel: vi.fn(),
      },
      refunds: {
        create: vi.fn(),
      },
      customers: {
        create: vi.fn(),
        retrieve: vi.fn(),
      },
      webhooks: {
        constructEvent: vi.fn(),
      },
    },
    mockEmailService: {
      sendPaymentConfirmationEmail: vi.fn().mockResolvedValue(true),
      sendPaymentFailedEmail: vi.fn().mockResolvedValue(true),
      sendRefundConfirmationEmail: vi.fn().mockResolvedValue(true),
      sendConsultationReceivedEmail: vi.fn().mockResolvedValue(true),
    },
  }
})

// Set env vars
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock_webhook_secret'
process.env.FRONTEND_URL = 'http://localhost:5173'
process.env.JWT_SECRET = 'test_jwt_secret'

vi.mock('../../src/db/init', () => ({
  getPrismaClient: () => mockPrisma,
}))

vi.mock('stripe', () => ({
  default: vi.fn(() => mockStripe),
}))

vi.mock('../../src/services/emailService', () => mockEmailService)

vi.mock('../../src/middleware/auth', () => ({
  verifyToken: vi.fn((req: any, _res: any, next: any) => {
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer valid_')) {
      req.user = { userId: 'user123', email: 'customer@example.com', role: 'user' }
    } else if (authHeader?.startsWith('Bearer admin_')) {
      req.user = { userId: 'admin123', email: 'admin@example.com', role: 'admin' }
    }
    next()
  }),
  isAuthenticated: vi.fn((req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' })
    }
    next()
  }),
}))

vi.mock('../../src/middleware/authorization', () => ({
  requireRole: () => vi.fn((req: any, res: any, next: any) => {
    if (req.user?.role === 'admin') {
      next()
    } else {
      res.status(403).json({ error: 'Admin access required' })
    }
  }),
}))

vi.mock('../../src/middleware/security', () => ({
  apiLimiter: (_req: any, _res: any, next: any) => next(),
}))

vi.mock('../../src/middleware/errorHandler', () => ({
  asyncHandler: (fn: any) => (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next),
}))

vi.mock('../../src/middleware/validation', () => ({
  validate: () => (_req: any, _res: any, next: any) => next(),
}))

import paymentsRouter from '../../src/routes/payments'
import webhooksRouter from '../../src/routes/webhooks'

describe('E2E Payment Workflows', () => {
  let app: express.Application

  beforeEach(() => {
    vi.clearAllMocks()

    app = express()
    app.use(express.json())
    app.use('/payments', paymentsRouter)
    app.use('/webhooks', webhooksRouter)

    // Error handler
    app.use((err: any, _req: any, res: any, _next: any) => {
      res.status(err.statusCode || 400).json({ error: err.message })
    })
  })

  // ============================================
  // WORKFLOW 1: Full Consultation Payment Flow
  // ============================================
  describe('WORKFLOW: Consultation → Payment → Confirmation', () => {
    const consultationData = {
      category: 'civil',
      question: '¿Cuáles son mis derechos en un contrato de arrendamiento?',
      urgency: 'normal',
    }

    it('should complete full payment flow for consultation', async () => {
      // Step 1: Create consultation request
      const consultationId = 'cons_123456'
      mockPrisma.consultation.create.mockResolvedValueOnce({
        id: consultationId,
        userId: 'user123',
        category: consultationData.category,
        question: consultationData.question,
        urgency: consultationData.urgency,
        status: 'pending_payment',
        createdAt: new Date(),
      })

      const createResponse = await request(app)
        .post('/payments/consultations')
        .set('Authorization', 'Bearer valid_token')
        .send(consultationData)

      expect(createResponse.status).toBe(201)
      expect(createResponse.body.success).toBe(true)
      expect(createResponse.body.consultation.id).toBe(consultationId)
      expect(createResponse.body.consultation.status).toBe('pending_payment')

      // Step 2: Create payment intent
      const paymentIntentId = 'pi_test_123456789'
      const clientSecret = 'pi_test_123456789_secret_xyz'
      const amount = 5000 // $50.00 MXN

      mockStripe.paymentIntents.create.mockResolvedValueOnce({
        id: paymentIntentId,
        client_secret: clientSecret,
        amount,
        currency: 'mxn',
        status: 'requires_payment_method',
        metadata: {
          consultationId,
          userId: 'user123',
        },
      })

      mockPrisma.payment.create.mockResolvedValueOnce({
        id: 'pay_123',
        consultationId,
        stripePaymentIntentId: paymentIntentId,
        amount,
        currency: 'mxn',
        status: 'pending',
      })

      const intentResponse = await request(app)
        .post('/payments/create-intent')
        .set('Authorization', 'Bearer valid_token')
        .send({
          consultationId,
          amount,
        })

      expect(intentResponse.status).toBe(200)
      expect(intentResponse.body.success).toBe(true)
      expect(intentResponse.body.clientSecret).toBe(clientSecret)
      expect(intentResponse.body.paymentIntentId).toBe(paymentIntentId)

      // Step 3: Simulate Stripe webhook - payment_intent.succeeded
      mockStripe.webhooks.constructEvent.mockReturnValueOnce({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: paymentIntentId,
            amount,
            currency: 'mxn',
            status: 'succeeded',
            metadata: {
              consultationId,
              userId: 'user123',
            },
          },
        },
      })

      mockPrisma.payment.update.mockResolvedValueOnce({
        id: 'pay_123',
        status: 'succeeded',
      })

      mockPrisma.consultation.update.mockResolvedValueOnce({
        id: consultationId,
        status: 'paid',
      })

      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user123',
        email: 'customer@example.com',
        name: 'Test Customer',
      })

      const webhookResponse = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'valid_signature')
        .send({ /* raw body */ })

      expect(webhookResponse.status).toBe(200)
      expect(mockEmailService.sendPaymentConfirmationEmail).toHaveBeenCalled()

      // Step 4: Verify consultation status
      mockPrisma.consultation.findUnique.mockResolvedValueOnce({
        id: consultationId,
        status: 'paid',
        payment: {
          status: 'succeeded',
          amount,
        },
      })

      const statusResponse = await request(app)
        .get(`/payments/consultations/${consultationId}`)
        .set('Authorization', 'Bearer valid_token')

      expect(statusResponse.status).toBe(200)
      expect(statusResponse.body.consultation.status).toBe('paid')
    })

    it('should handle payment for urgent consultation with higher fee', async () => {
      const urgentConsultationId = 'cons_urgent_789'
      const urgentAmount = 10000 // $100.00 MXN for urgent

      mockPrisma.consultation.create.mockResolvedValueOnce({
        id: urgentConsultationId,
        urgency: 'urgent',
        status: 'pending_payment',
      })

      const createResponse = await request(app)
        .post('/payments/consultations')
        .set('Authorization', 'Bearer valid_token')
        .send({ ...consultationData, urgency: 'urgent' })

      expect(createResponse.status).toBe(201)

      mockStripe.paymentIntents.create.mockResolvedValueOnce({
        id: 'pi_urgent_123',
        client_secret: 'pi_urgent_secret',
        amount: urgentAmount,
        currency: 'mxn',
        status: 'requires_payment_method',
      })

      mockPrisma.payment.create.mockResolvedValueOnce({
        id: 'pay_urgent',
        amount: urgentAmount,
        status: 'pending',
      })

      const intentResponse = await request(app)
        .post('/payments/create-intent')
        .set('Authorization', 'Bearer valid_token')
        .send({
          consultationId: urgentConsultationId,
          amount: urgentAmount,
          urgency: 'urgent',
        })

      expect(intentResponse.status).toBe(200)
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: urgentAmount,
        })
      )
    })
  })

  // ============================================
  // WORKFLOW 2: Failed Payment Handling
  // ============================================
  describe('WORKFLOW: Failed Payment Handling', () => {
    it('should handle declined card payment', async () => {
      const consultationId = 'cons_declined_123'
      const paymentIntentId = 'pi_declined_456'

      // Simulate webhook for failed payment
      mockStripe.webhooks.constructEvent.mockReturnValueOnce({
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: paymentIntentId,
            status: 'requires_payment_method',
            last_payment_error: {
              code: 'card_declined',
              message: 'Your card was declined.',
            },
            metadata: {
              consultationId,
              userId: 'user123',
            },
          },
        },
      })

      mockPrisma.payment.update.mockResolvedValueOnce({
        id: 'pay_declined',
        status: 'failed',
        failureReason: 'card_declined',
      })

      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user123',
        email: 'customer@example.com',
        name: 'Test Customer',
      })

      const webhookResponse = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'valid_signature')
        .send({})

      expect(webhookResponse.status).toBe(200)
      expect(mockEmailService.sendPaymentFailedEmail).toHaveBeenCalledWith(
        'customer@example.com',
        expect.objectContaining({
          reason: expect.stringContaining('declined'),
        })
      )
    })

    it('should allow retry after failed payment', async () => {
      const consultationId = 'cons_retry_123'

      // Consultation exists with failed payment
      mockPrisma.consultation.findUnique.mockResolvedValueOnce({
        id: consultationId,
        status: 'payment_failed',
        payment: {
          id: 'pay_failed',
          status: 'failed',
        },
      })

      // Create new payment intent for retry
      mockStripe.paymentIntents.create.mockResolvedValueOnce({
        id: 'pi_retry_789',
        client_secret: 'pi_retry_secret',
        amount: 5000,
        status: 'requires_payment_method',
      })

      mockPrisma.payment.create.mockResolvedValueOnce({
        id: 'pay_retry',
        status: 'pending',
      })

      const retryResponse = await request(app)
        .post('/payments/create-intent')
        .set('Authorization', 'Bearer valid_token')
        .send({
          consultationId,
          amount: 5000,
          isRetry: true,
        })

      expect(retryResponse.status).toBe(200)
      expect(retryResponse.body.clientSecret).toBeDefined()
    })

    it('should handle insufficient funds error', async () => {
      mockStripe.webhooks.constructEvent.mockReturnValueOnce({
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_insufficient',
            last_payment_error: {
              code: 'insufficient_funds',
              message: 'Insufficient funds',
            },
            metadata: {
              consultationId: 'cons_123',
              userId: 'user123',
            },
          },
        },
      })

      mockPrisma.payment.update.mockResolvedValueOnce({
        id: 'pay_123',
        status: 'failed',
      })

      mockPrisma.user.findUnique.mockResolvedValueOnce({
        email: 'customer@example.com',
      })

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'valid_sig')
        .send({})

      expect(response.status).toBe(200)
      expect(mockEmailService.sendPaymentFailedEmail).toHaveBeenCalled()
    })

    it('should handle expired card error', async () => {
      mockStripe.webhooks.constructEvent.mockReturnValueOnce({
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_expired_card',
            last_payment_error: {
              code: 'expired_card',
              message: 'Your card has expired.',
            },
            metadata: {
              consultationId: 'cons_456',
              userId: 'user123',
            },
          },
        },
      })

      mockPrisma.payment.update.mockResolvedValueOnce({ status: 'failed' })
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        email: 'customer@example.com',
      })

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'valid_sig')
        .send({})

      expect(response.status).toBe(200)
    })
  })

  // ============================================
  // WORKFLOW 3: Refund Flow
  // ============================================
  describe('WORKFLOW: Refund Processing', () => {
    it('should process full refund for consultation', async () => {
      const consultationId = 'cons_refund_123'
      const paymentId = 'pay_refund_456'
      const paymentIntentId = 'pi_refund_789'
      const refundId = 're_refund_abc'

      // Admin requests refund
      mockPrisma.consultation.findUnique.mockResolvedValueOnce({
        id: consultationId,
        status: 'paid',
        payment: {
          id: paymentId,
          stripePaymentIntentId: paymentIntentId,
          amount: 5000,
          status: 'succeeded',
        },
        user: {
          id: 'user123',
          email: 'customer@example.com',
          name: 'Test Customer',
        },
      })

      mockStripe.refunds.create.mockResolvedValueOnce({
        id: refundId,
        amount: 5000,
        status: 'succeeded',
        payment_intent: paymentIntentId,
      })

      mockPrisma.payment.update.mockResolvedValueOnce({
        id: paymentId,
        status: 'refunded',
        refundId,
      })

      mockPrisma.consultation.update.mockResolvedValueOnce({
        id: consultationId,
        status: 'refunded',
      })

      const refundResponse = await request(app)
        .post(`/payments/consultations/${consultationId}/refund`)
        .set('Authorization', 'Bearer admin_token')
        .send({
          reason: 'Customer requested cancellation',
        })

      expect(refundResponse.status).toBe(200)
      expect(refundResponse.body.success).toBe(true)
      expect(refundResponse.body.refund.status).toBe('succeeded')
      expect(mockEmailService.sendRefundConfirmationEmail).toHaveBeenCalledWith(
        'customer@example.com',
        expect.objectContaining({
          amount: 5000,
          reason: 'Customer requested cancellation',
        })
      )
    })

    it('should process partial refund', async () => {
      const consultationId = 'cons_partial_123'
      const partialAmount = 2500 // 50% refund

      mockPrisma.consultation.findUnique.mockResolvedValueOnce({
        id: consultationId,
        status: 'paid',
        payment: {
          stripePaymentIntentId: 'pi_partial',
          amount: 5000,
          status: 'succeeded',
        },
        user: { email: 'customer@example.com' },
      })

      mockStripe.refunds.create.mockResolvedValueOnce({
        id: 're_partial',
        amount: partialAmount,
        status: 'succeeded',
      })

      mockPrisma.payment.update.mockResolvedValueOnce({
        status: 'partially_refunded',
        refundAmount: partialAmount,
      })

      const response = await request(app)
        .post(`/payments/consultations/${consultationId}/refund`)
        .set('Authorization', 'Bearer admin_token')
        .send({
          amount: partialAmount,
          reason: 'Service not completed fully',
        })

      expect(response.status).toBe(200)
      expect(mockStripe.refunds.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: partialAmount,
        })
      )
    })

    it('should reject refund for non-admin', async () => {
      const response = await request(app)
        .post('/payments/consultations/cons_123/refund')
        .set('Authorization', 'Bearer valid_token') // User token, not admin
        .send({ reason: 'Test refund' })

      expect(response.status).toBe(403)
      expect(response.body.error).toContain('Admin')
    })

    it('should reject refund for unpaid consultation', async () => {
      mockPrisma.consultation.findUnique.mockResolvedValueOnce({
        id: 'cons_unpaid',
        status: 'pending_payment',
        payment: null,
      })

      const response = await request(app)
        .post('/payments/consultations/cons_unpaid/refund')
        .set('Authorization', 'Bearer admin_token')
        .send({ reason: 'Test' })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('No payment')
    })

    it('should reject double refund', async () => {
      mockPrisma.consultation.findUnique.mockResolvedValueOnce({
        id: 'cons_already_refunded',
        status: 'refunded',
        payment: {
          status: 'refunded',
          refundId: 're_existing',
        },
      })

      const response = await request(app)
        .post('/payments/consultations/cons_already_refunded/refund')
        .set('Authorization', 'Bearer admin_token')
        .send({ reason: 'Test' })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('already')
    })
  })

  // ============================================
  // WORKFLOW 4: Payment History and Receipts
  // ============================================
  describe('WORKFLOW: Payment History and Receipts', () => {
    it('should retrieve user payment history', async () => {
      mockPrisma.payment.findMany.mockResolvedValueOnce([
        {
          id: 'pay_1',
          amount: 5000,
          status: 'succeeded',
          createdAt: new Date('2024-01-15'),
          consultation: { category: 'civil', question: 'Test question 1' },
        },
        {
          id: 'pay_2',
          amount: 10000,
          status: 'succeeded',
          createdAt: new Date('2024-01-20'),
          consultation: { category: 'laboral', question: 'Test question 2' },
        },
        {
          id: 'pay_3',
          amount: 5000,
          status: 'refunded',
          createdAt: new Date('2024-01-25'),
          consultation: { category: 'familiar', question: 'Test question 3' },
        },
      ])

      const historyResponse = await request(app)
        .get('/payments/history')
        .set('Authorization', 'Bearer valid_token')

      expect(historyResponse.status).toBe(200)
      expect(historyResponse.body.payments).toHaveLength(3)
      expect(historyResponse.body.payments[0].status).toBe('succeeded')
    })

    it('should retrieve single payment receipt', async () => {
      const paymentId = 'pay_receipt_123'

      mockPrisma.payment.findUnique.mockResolvedValueOnce({
        id: paymentId,
        amount: 5000,
        currency: 'mxn',
        status: 'succeeded',
        stripePaymentIntentId: 'pi_123',
        createdAt: new Date('2024-01-15T10:30:00Z'),
        consultation: {
          id: 'cons_123',
          category: 'civil',
          question: 'Pregunta de prueba',
        },
        user: {
          id: 'user123',
          email: 'customer@example.com',
          name: 'Test Customer',
        },
      })

      const receiptResponse = await request(app)
        .get(`/payments/${paymentId}/receipt`)
        .set('Authorization', 'Bearer valid_token')

      expect(receiptResponse.status).toBe(200)
      expect(receiptResponse.body.receipt).toBeDefined()
      expect(receiptResponse.body.receipt.amount).toBe(5000)
      expect(receiptResponse.body.receipt.currency).toBe('mxn')
    })

    it('should not allow access to other user receipts', async () => {
      mockPrisma.payment.findUnique.mockResolvedValueOnce({
        id: 'pay_other_user',
        userId: 'different_user_id',
        amount: 5000,
      })

      const response = await request(app)
        .get('/payments/pay_other_user/receipt')
        .set('Authorization', 'Bearer valid_token')

      expect(response.status).toBe(403)
      expect(response.body.error).toContain('Not authorized')
    })
  })

  // ============================================
  // WORKFLOW 5: Stripe Webhook Handling
  // ============================================
  describe('WORKFLOW: Stripe Webhook Events', () => {
    it('should handle checkout.session.completed event', async () => {
      mockStripe.webhooks.constructEvent.mockReturnValueOnce({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_intent: 'pi_123',
            metadata: {
              consultationId: 'cons_123',
              userId: 'user123',
            },
            customer_email: 'customer@example.com',
          },
        },
      })

      mockPrisma.consultation.update.mockResolvedValueOnce({
        id: 'cons_123',
        status: 'paid',
      })

      mockPrisma.payment.update.mockResolvedValueOnce({
        status: 'succeeded',
      })

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'valid_sig')
        .send({})

      expect(response.status).toBe(200)
    })

    it('should handle charge.refunded event', async () => {
      mockStripe.webhooks.constructEvent.mockReturnValueOnce({
        type: 'charge.refunded',
        data: {
          object: {
            id: 'ch_123',
            payment_intent: 'pi_123',
            amount_refunded: 5000,
            refunded: true,
          },
        },
      })

      mockPrisma.payment.update.mockResolvedValueOnce({
        status: 'refunded',
      })

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'valid_sig')
        .send({})

      expect(response.status).toBe(200)
    })

    it('should reject invalid webhook signature', async () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature')
      })

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'invalid_signature')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('Invalid')
    })

    it('should handle unknown webhook events gracefully', async () => {
      mockStripe.webhooks.constructEvent.mockReturnValueOnce({
        type: 'unknown.event.type',
        data: {
          object: {},
        },
      })

      const response = await request(app)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'valid_sig')
        .send({})

      // Should acknowledge receipt without error
      expect(response.status).toBe(200)
      expect(response.body.received).toBe(true)
    })
  })

  // ============================================
  // WORKFLOW 6: Payment Intent Management
  // ============================================
  describe('WORKFLOW: Payment Intent Lifecycle', () => {
    it('should cancel abandoned payment intent', async () => {
      const paymentIntentId = 'pi_abandoned_123'

      mockStripe.paymentIntents.cancel.mockResolvedValueOnce({
        id: paymentIntentId,
        status: 'canceled',
      })

      mockPrisma.payment.update.mockResolvedValueOnce({
        status: 'canceled',
      })

      mockPrisma.consultation.update.mockResolvedValueOnce({
        status: 'canceled',
      })

      const cancelResponse = await request(app)
        .post(`/payments/intents/${paymentIntentId}/cancel`)
        .set('Authorization', 'Bearer valid_token')

      expect(cancelResponse.status).toBe(200)
      expect(cancelResponse.body.success).toBe(true)
      expect(mockStripe.paymentIntents.cancel).toHaveBeenCalledWith(paymentIntentId)
    })

    it('should retrieve payment intent status', async () => {
      const paymentIntentId = 'pi_status_123'

      mockStripe.paymentIntents.retrieve.mockResolvedValueOnce({
        id: paymentIntentId,
        status: 'requires_action',
        amount: 5000,
        currency: 'mxn',
        client_secret: 'pi_status_123_secret',
        next_action: {
          type: 'use_stripe_sdk',
        },
      })

      const statusResponse = await request(app)
        .get(`/payments/intents/${paymentIntentId}`)
        .set('Authorization', 'Bearer valid_token')

      expect(statusResponse.status).toBe(200)
      expect(statusResponse.body.paymentIntent.status).toBe('requires_action')
    })
  })

  // ============================================
  // SECURITY TESTS
  // ============================================
  describe('Security: Payment Protection', () => {
    it('should require authentication for payment endpoints', async () => {
      const response = await request(app)
        .post('/payments/create-intent')
        .send({ consultationId: 'cons_123', amount: 5000 })

      expect(response.status).toBe(401)
    })

    it('should validate payment amounts', async () => {
      const response = await request(app)
        .post('/payments/create-intent')
        .set('Authorization', 'Bearer valid_token')
        .send({
          consultationId: 'cons_123',
          amount: -100, // Invalid negative amount
        })

      expect(response.status).toBe(400)
    })

    it('should validate currency is MXN', async () => {
      const response = await request(app)
        .post('/payments/create-intent')
        .set('Authorization', 'Bearer valid_token')
        .send({
          consultationId: 'cons_123',
          amount: 5000,
          currency: 'USD', // Only MXN supported
        })

      expect(response.status).toBe(400)
    })

    it('should not expose Stripe secrets in responses', async () => {
      mockStripe.paymentIntents.create.mockResolvedValueOnce({
        id: 'pi_test',
        client_secret: 'pi_test_secret',
        amount: 5000,
      })

      mockPrisma.payment.create.mockResolvedValueOnce({
        id: 'pay_123',
      })

      const response = await request(app)
        .post('/payments/create-intent')
        .set('Authorization', 'Bearer valid_token')
        .send({
          consultationId: 'cons_123',
          amount: 5000,
        })

      expect(response.status).toBe(200)
      // Should include client_secret (needed for frontend) but not secret_key
      expect(response.body.clientSecret).toBeDefined()
      expect(response.body).not.toHaveProperty('secretKey')
      expect(JSON.stringify(response.body)).not.toContain('sk_')
    })
  })
})
