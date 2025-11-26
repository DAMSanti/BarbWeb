/**
 * Unit Tests - Payment Routes
 * Tests para manejo de pagos con Stripe y gestión de transacciones
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'

// Hoist mocks
const { mockPrisma, mockStripeInstance, MockStripeConstructor, mockVerifyToken } = vi.hoisted(() => {
  const mockStripeInstance = {
    paymentIntents: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
    refunds: {
      create: vi.fn(),
    },
  }

  class MockStripeConstructor {
    paymentIntents = mockStripeInstance.paymentIntents
    refunds = mockStripeInstance.refunds
  }

  const mockVerifyToken = vi.fn((req: any, res, next) => {
    req.user = { userId: 'user123', email: 'test@example.com' }
    next()
  })

  return {
    mockPrisma: {
      payment: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
    },
    mockStripeInstance,
    MockStripeConstructor,
    mockVerifyToken,
  }
})

// Set mock env vars before mocking
process.env.STRIPE_SECRET_KEY = 'sk_test_123456789'

vi.mock('stripe', () => {
  return {
    default: MockStripeConstructor as any,
  }
})

vi.mock('../../src/db/init', () => ({
  getPrismaClient: () => mockPrisma,
}))

vi.mock('../../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('../../src/middleware/auth', () => ({
  verifyToken: mockVerifyToken,
}))

vi.mock('../../src/middleware/security', () => ({
  paymentLimiter: (req: any, res: any, next: any) => next(),
}))

vi.mock('../../src/middleware/errorHandler', () => ({
  asyncHandler: (fn: any) => (req: any, res: any, next: any) => 
    Promise.resolve(fn(req, res, next)).catch(next),
}))

import paymentsRouter from '../../src/routes/payments'

describe('Payment Routes', () => {
  let app: express.Application

  beforeEach(() => {
    vi.clearAllMocks()
    
    app = express()
    app.use(express.json())
    app.use('/api/payments', paymentsRouter)
  })

  describe('POST /api/payments/create-payment-intent', () => {
    it('should create a payment intent with valid data', async () => {
      mockStripeInstance.paymentIntents.create.mockResolvedValueOnce({
        id: 'pi_test123',
        client_secret: 'pi_test123_secret',
        amount: 1000,
        currency: 'usd',
        metadata: { userId: 'user123' },
      })

      const response = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('Authorization', `Bearer valid_token`)
        .send({
          amount: 10,
          currency: 'usd',
          description: 'Test consultation',
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.clientSecret).toBe('pi_test123_secret')
      expect(response.body.paymentIntentId).toBe('pi_test123')
    })

    it('should validate minimum amount (10 USD)', async () => {
      const response = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('Authorization', `Bearer valid_token`)
        .send({
          amount: 5, // Less than minimum
          currency: 'usd',
        })

      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(response.body).toBeDefined()
    })

    it('should default currency to USD', async () => {
      mockStripeInstance.paymentIntents.create.mockResolvedValueOnce({
        id: 'pi_test123',
        client_secret: 'pi_test123_secret',
      })

      const response = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('Authorization', `Bearer valid_token`)
        .send({
          amount: 10,
        })

      expect(response.status).toBe(200)
      expect(mockStripeInstance.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: 'usd',
        })
      )
    })

    it('should convert amount to cents for Stripe', async () => {
      mockStripeInstance.paymentIntents.create.mockResolvedValueOnce({
        id: 'pi_test123',
        client_secret: 'pi_test123_secret',
      })

      const response = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('Authorization', `Bearer valid_token`)
        .send({
          amount: 99.99,
          currency: 'usd',
        })

      expect(response.status).toBe(200)
      expect(mockStripeInstance.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 9999, // 99.99 * 100
        })
      )
    })
  })

  describe('POST /api/payments/confirm-payment', () => {
    it('should confirm a successful payment', async () => {
      mockStripeInstance.paymentIntents.retrieve.mockResolvedValueOnce({
        id: 'pi_test123',
        status: 'succeeded',
        amount: 1000,
        metadata: { userId: 'user123' },
      })

      const response = await request(app)
        .post('/api/payments/confirm-payment')
        .set('Authorization', `Bearer valid_token`)
        .send({
          paymentIntentId: 'pi_test123',
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.amount).toBe(10) // 1000 / 100
    })

    it('should reject payment from different user', async () => {
      mockStripeInstance.paymentIntents.retrieve.mockResolvedValueOnce({
        id: 'pi_test123',
        status: 'succeeded',
        metadata: { userId: 'different_user' },
      })

      const response = await request(app)
        .post('/api/payments/confirm-payment')
        .set('Authorization', `Bearer valid_token`)
        .send({
          paymentIntentId: 'pi_test123',
        })

      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(response.body).toBeDefined()
    })

    it('should reject payment with non-succeeded status', async () => {
      mockStripeInstance.paymentIntents.retrieve.mockResolvedValueOnce({
        id: 'pi_test123',
        status: 'processing',
        metadata: { userId: 'user123' },
      })

      const response = await request(app)
        .post('/api/payments/confirm-payment')
        .set('Authorization', `Bearer valid_token`)
        .send({
          paymentIntentId: 'pi_test123',
        })

      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(response.body).toBeDefined()
    })
  })

  describe('GET /api/payments/history', () => {
    it('should return payment history for user', async () => {
      const mockPayments = [
        {
          id: 'pay_1',
          amount: 50,
          status: 'completed',
          consultationSummary: 'Derecho Civil',
          createdAt: new Date('2025-01-01'),
        },
        {
          id: 'pay_2',
          amount: 75,
          status: 'completed',
          consultationSummary: 'Derecho Penal',
          createdAt: new Date('2025-01-02'),
        },
      ]

      mockPrisma.payment.findMany.mockResolvedValueOnce(mockPayments)

      const response = await request(app)
        .get('/api/payments/history')
        .set('Authorization', `Bearer valid_token`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.payments).toHaveLength(2)
      expect(response.body.payments[0].id).toBe('pay_1')
      expect(response.body.payments[0].amount).toBe(50)
    })

    it('should order payments by most recent first', async () => {
      mockPrisma.payment.findMany.mockResolvedValueOnce([])

      const response = await request(app)
        .get('/api/payments/history')
        .set('Authorization', `Bearer valid_token`)

      expect(response.status).toBe(200)
      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      )
    })

    it('should limit to 50 most recent payments', async () => {
      mockPrisma.payment.findMany.mockResolvedValueOnce([])

      const response = await request(app)
        .get('/api/payments/history')
        .set('Authorization', `Bearer valid_token`)

      expect(response.status).toBe(200)
      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
        })
      )
    })

    it('should return empty array when no payments', async () => {
      mockPrisma.payment.findMany.mockResolvedValueOnce([])

      const response = await request(app)
        .get('/api/payments/history')
        .set('Authorization', `Bearer valid_token`)

      expect(response.status).toBe(200)
      expect(response.body.payments).toEqual([])
    })
  })

  describe('POST /api/payments/:paymentId/refund', () => {
    it('should process refund for completed payment', async () => {
      const mockPayment = {
        id: 'pay_1',
        userId: 'user123',
        status: 'completed',
        amount: 100,
        stripeSessionId: 'pi_test123',
      }

      mockPrisma.payment.findUnique.mockResolvedValueOnce(mockPayment)
      mockStripeInstance.refunds.create.mockResolvedValueOnce({
        id: 'ref_1',
        amount: 10000,
      })
      mockPrisma.payment.update.mockResolvedValueOnce({
        ...mockPayment,
        status: 'refunded',
      })

      const response = await request(app)
        .post('/api/payments/pay_1/refund')
        .set('Authorization', `Bearer valid_token`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.refundId).toBe('ref_1')
    })

    it('should reject refund for non-existent payment', async () => {
      mockPrisma.payment.findUnique.mockResolvedValueOnce(null)

      const response = await request(app)
        .post('/api/payments/pay_nonexistent/refund')
        .set('Authorization', `Bearer valid_token`)

      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(response.body).toBeDefined()
    })

    it('should reject refund from different user', async () => {
      const mockPayment = {
        id: 'pay_1',
        userId: 'different_user',
        status: 'completed',
        amount: 100,
        stripeSessionId: 'pi_test123',
      }

      mockPrisma.payment.findUnique.mockResolvedValueOnce(mockPayment)

      const response = await request(app)
        .post('/api/payments/pay_1/refund')
        .set('Authorization', `Bearer valid_token`)

      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(response.body).toBeDefined()
    })

    it('should reject refund for non-completed payment', async () => {
      const mockPayment = {
        id: 'pay_1',
        userId: 'user123',
        status: 'pending',
        amount: 100,
        stripeSessionId: 'pi_test123',
      }

      mockPrisma.payment.findUnique.mockResolvedValueOnce(mockPayment)

      const response = await request(app)
        .post('/api/payments/pay_1/refund')
        .set('Authorization', `Bearer valid_token`)

      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(response.body).toBeDefined()
    })

    it('should update payment status to refunded', async () => {
      const mockPayment = {
        id: 'pay_1',
        userId: 'user123',
        status: 'completed',
        amount: 100,
        stripeSessionId: 'pi_test123',
      }

      mockPrisma.payment.findUnique.mockResolvedValueOnce(mockPayment)
      mockStripeInstance.refunds.create.mockResolvedValueOnce({
        id: 'ref_1',
      })
      mockPrisma.payment.update.mockResolvedValueOnce({
        ...mockPayment,
        status: 'refunded',
      })

      const response = await request(app)
        .post('/api/payments/pay_1/refund')
        .set('Authorization', `Bearer valid_token`)

      expect(response.status).toBe(200)
      expect(mockPrisma.payment.update).toHaveBeenCalledWith({
        where: { id: 'pay_1' },
        data: { status: 'refunded' },
      })
    })
  })
})
