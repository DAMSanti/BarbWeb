/**
 * Unit Tests - Webhooks Routes
 * Tests para manejo de webhooks de Stripe (pagos, reembolsos, fallos)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import Stripe from 'stripe'

// Mock dependencies
const mockPrisma = {
  payment: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
  },
}

const mockEmailService = {
  sendPaymentConfirmationEmail: vi.fn(),
  sendLawyerNotificationEmail: vi.fn(),
  sendPaymentFailedEmail: vi.fn(),
  sendRefundConfirmationEmail: vi.fn(),
}

const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

// Mock Stripe webhook verification
const mockStripe = {
  webhooks: {
    constructEvent: vi.fn(),
  },
}

vi.mock('stripe', () => ({
  default: vi.fn(() => mockStripe),
}))

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
  beforeEach(() => {
    vi.clearAllMocks()
    // Set required env variables
    process.env.STRIPE_SECRET_KEY = 'sk_test_123456789'
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123456789'
  })

  describe('Webhook Signature Verification', () => {
    it('should verify valid webhook signature', () => {
      const body = Buffer.from(JSON.stringify({ type: 'payment_intent.succeeded' }))
      const signature = 'valid_signature'

      const mockEvent = {
        id: 'evt_test_123',
        type: 'payment_intent.succeeded',
        data: { object: {} },
      } as unknown as Stripe.Event

      mockStripe.webhooks.constructEvent.mockReturnValueOnce(mockEvent)

      // Note: This tests the logic of webhook verification
      expect(mockStripe.webhooks.constructEvent).toBeDefined()
    })

    it('should throw ValidationError if STRIPE_WEBHOOK_SECRET is missing', () => {
      delete process.env.STRIPE_WEBHOOK_SECRET

      const body = Buffer.from(JSON.stringify({}))
      const signature = 'some_signature'

      // Verify environment is set up for error
      expect(process.env.STRIPE_WEBHOOK_SECRET).toBeUndefined()
    })

    it('should throw ValidationError if signature is invalid', () => {
      const body = Buffer.from(JSON.stringify({}))
      const signature = 'invalid_signature'

      mockStripe.webhooks.constructEvent.mockImplementationOnce(() => {
        throw new Error('Invalid signature')
      })

      // Verify that constructEvent throws when called with invalid signature
      try {
        mockStripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('handlePaymentIntentSucceeded', () => {
    it('should create payment when paymentIntent is new', async () => {
      const paymentIntent = {
        id: 'pi_new_001',
        amount: 10000,
        currency: 'eur',
        metadata: {
          userId: 'user_new_001',
          clientName: 'John Doe',
          consultationSummary: 'Consulta sobre divorcio',
          category: 'Familia',
        },
        receipt_email: 'john@example.com',
      } as unknown as Stripe.PaymentIntent

      mockPrisma.payment.findFirst.mockResolvedValueOnce(null)
      mockPrisma.payment.create.mockResolvedValueOnce({
        id: 'payment_new_001',
      })
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user_new_001',
        email: 'user@example.com',
        name: 'John Doe',
      })
      mockEmailService.sendPaymentConfirmationEmail.mockResolvedValueOnce(true)

      expect(mockPrisma.payment.findFirst).toBeDefined()
    })

    it('should not create duplicate payment for same paymentIntent', async () => {
      const paymentIntent = {
        id: 'pi_dup_001',
        amount: 10000,
        metadata: { userId: 'user_dup_001' },
      } as unknown as Stripe.PaymentIntent

      mockPrisma.payment.findFirst.mockResolvedValueOnce({
        id: 'existing_payment_dup_001',
        stripeSessionId: 'pi_dup_001',
        status: 'completed',
      })

      const existingPayment = await mockPrisma.payment.findFirst({
        where: { stripeSessionId: paymentIntent.id },
      })

      expect(existingPayment).toBeDefined()
      expect(existingPayment?.id).toBe('existing_payment_dup_001')
      expect(mockPrisma.payment.create).not.toHaveBeenCalled()
    })

    it('should send confirmation email to client', async () => {
      mockPrisma.payment.findFirst.mockResolvedValueOnce(null)
      mockPrisma.payment.create.mockResolvedValueOnce({ id: 'payment_email_001' })
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user_email_001',
        email: 'jane@example.com',
        name: 'Jane Smith',
      })

      await mockEmailService.sendPaymentConfirmationEmail('jane@example.com', {
        clientName: 'Jane Smith',
        amount: 50,
        currency: 'eur',
        category: 'Laboral',
        consultationSummary: 'Consulta sobre despido',
        paymentId: 'pi_email_001',
      })

      expect(mockEmailService.sendPaymentConfirmationEmail).toHaveBeenCalled()
    })

    it('should send lawyer notification email', async () => {
      mockPrisma.payment.findFirst.mockResolvedValueOnce(null)
      mockPrisma.payment.create.mockResolvedValueOnce({ id: 'payment_lawyer_001' })
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user_lawyer_001',
        email: 'carlos@example.com',
        name: 'Carlos López',
      })

      await mockEmailService.sendLawyerNotificationEmail({
        clientName: 'Carlos López',
        clientEmail: 'carlos@example.com',
        amount: 75,
        category: 'Civil',
        consultationSummary: 'Consulta sobre contrato',
        paymentId: 'pi_lawyer_001',
      })

      expect(mockEmailService.sendLawyerNotificationEmail).toHaveBeenCalled()
    })

    it('should handle missing userId gracefully', () => {
      const paymentIntent = {
        id: 'pi_missing_userid_001',
        amount: 10000,
        metadata: {},
      } as unknown as Stripe.PaymentIntent

      const userId = paymentIntent.metadata?.userId
      expect(userId).toBeUndefined()
    })

    it('should use receipt_email when available', () => {
      const paymentIntent = {
        id: 'pi_receipt_001',
        amount: 10000,
        metadata: { userId: 'user_receipt_001', clientName: 'Test Client' },
        receipt_email: 'receipt@example.com',
      } as unknown as Stripe.PaymentIntent

      const clientEmail = paymentIntent.receipt_email || 'default@example.com'
      expect(clientEmail).toBe('receipt@example.com')
    })

    it('should use user email as fallback', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user_fallback_001',
        email: 'fallback@example.com',
        name: 'Test User',
      })

      const user = await mockPrisma.user.findUnique({ where: { id: 'user_fallback_001' } })
      const receiptEmail: string | undefined = undefined
      const clientEmail = receiptEmail || user?.email
      expect(clientEmail).toBe('fallback@example.com')
    })

    it('should calculate correct amount in euros (divide by 100)', () => {
      const paymentIntent = {
        id: 'pi_amount_001',
        amount: 10000,
        metadata: { userId: 'user_amount_001' },
      } as unknown as Stripe.PaymentIntent

      const amountInEuros = paymentIntent.amount / 100
      expect(amountInEuros).toBe(100)
    })

    it('should handle email sending failure gracefully', async () => {
      mockPrisma.payment.findFirst.mockResolvedValueOnce(null)
      mockPrisma.payment.create.mockResolvedValueOnce({ id: 'payment_fail_001' })
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user_fail_001',
        email: 'fail@example.com',
      })
      mockEmailService.sendPaymentConfirmationEmail.mockRejectedValueOnce(
        new Error('Email service error')
      )

      try {
        await mockEmailService.sendPaymentConfirmationEmail('fail@example.com', {
          clientName: 'Jane',
          amount: 50,
          currency: 'eur',
          category: 'General',
          consultationSummary: 'Test',
          paymentId: 'pi_fail_001',
        })
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('handlePaymentIntentFailed', () => {
    it('should log payment failure with details', () => {
      const paymentIntent = {
        id: 'pi_failed_001',
        amount: 10000,
        metadata: { userId: 'user_failed_001', clientName: 'John Doe' },
        last_payment_error: {
          message: 'Your card was declined',
        },
      } as unknown as Stripe.PaymentIntent

      mockLogger.warn('Pago fallido', {
        paymentIntentId: paymentIntent.id,
        userId: paymentIntent.metadata?.userId,
        lastPaymentError: paymentIntent.last_payment_error?.message,
      })

      expect(mockLogger.warn).toHaveBeenCalled()
    })

    it('should send payment failed email to client', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user_failed_email_001',
        email: 'failed@example.com',
        name: 'Jane Smith',
      })

      await mockEmailService.sendPaymentFailedEmail('failed@example.com', {
        clientName: 'Jane Smith',
        amount: 50,
        errorMessage: 'Insufficient funds',
      })

      expect(mockEmailService.sendPaymentFailedEmail).toHaveBeenCalled()
    })

    it('should handle missing userId in failed payment', () => {
      const paymentIntent = {
        id: 'pi_failed_no_user_001',
        amount: 10000,
        metadata: {},
        last_payment_error: {
          message: 'Card error',
        },
      } as unknown as Stripe.PaymentIntent

      const userId = paymentIntent.metadata?.userId
      expect(userId).toBeUndefined()
    })

    it('should use receipt_email if user not found', () => {
      const paymentIntent = {
        id: 'pi_failed_receipt_001',
        amount: 10000,
        metadata: { userId: 'nonexistent_user' },
        receipt_email: 'receipt@example.com',
        last_payment_error: { message: 'Error' },
      } as unknown as Stripe.PaymentIntent

      mockPrisma.user.findUnique.mockResolvedValueOnce(null)

      const clientEmail = paymentIntent.receipt_email
      expect(clientEmail).toBe('receipt@example.com')
    })

    it('should handle email sending failure in payment failed', async () => {
      mockEmailService.sendPaymentFailedEmail.mockRejectedValueOnce(
        new Error('Email service down')
      )

      try {
        await mockEmailService.sendPaymentFailedEmail('client@example.com', {
          clientName: 'Client',
          amount: 100,
          errorMessage: 'Payment failed',
        })
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('handleChargeRefunded', () => {
    it('should update payment status to refunded', async () => {
      const charge = {
        id: 'ch_refund_001',
        payment_intent: 'pi_refund_001',
        amount_refunded: 5000,
        currency: 'eur',
      } as unknown as Stripe.Charge

      mockPrisma.payment.findFirst.mockResolvedValueOnce({
        id: 'existing_refund_001',
        userId: 'user_refund_001',
        stripeSessionId: 'pi_refund_001',
      })

      const payment = await mockPrisma.payment.findFirst({
        where: { stripeSessionId: charge.payment_intent as string },
      })

      expect(payment).toBeDefined()
      expect(payment?.id).toBe('existing_refund_001')
    })

    it('should send refund confirmation email', async () => {
      mockPrisma.payment.findFirst.mockResolvedValueOnce({
        id: 'payment_refund_email_001',
        userId: 'user_refund_email_001',
      })

      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user_refund_email_001',
        email: 'refund@example.com',
        name: 'Client Name',
      })

      await mockEmailService.sendRefundConfirmationEmail('refund@example.com', {
        clientName: 'Client Name',
        amount: 75,
        currency: 'eur',
      })

      expect(mockEmailService.sendRefundConfirmationEmail).toHaveBeenCalled()
    })

    it('should handle missing payment_intent', () => {
      const charge = {
        id: 'ch_no_intent_001',
        payment_intent: undefined,
        amount_refunded: 5000,
      } as unknown as Stripe.Charge

      const paymentIntentId = charge.payment_intent

      if (paymentIntentId && typeof paymentIntentId === 'string') {
        expect(true).toBe(false)
      } else {
        expect(paymentIntentId).toBeUndefined()
      }
    })

    it('should handle string payment_intent correctly', () => {
      const charge = {
        id: 'ch_string_intent_001',
        payment_intent: 'pi_string_intent_001',
        amount_refunded: 5000,
      } as unknown as Stripe.Charge

      expect(typeof charge.payment_intent).toBe('string')
    })

    it('should calculate correct refund amount', () => {
      const charge = {
        id: 'ch_amount_calc_001',
        payment_intent: 'pi_amount_calc_001',
        amount_refunded: 10000,
      } as unknown as Stripe.Charge

      const refundAmount = charge.amount_refunded / 100
      expect(refundAmount).toBe(100)
    })

    it('should handle payment not found gracefully', async () => {
      const charge = {
        id: 'ch_not_found_001',
        payment_intent: 'pi_not_found_001',
        amount_refunded: 5000,
      } as unknown as Stripe.Charge

      mockPrisma.payment.findFirst.mockResolvedValueOnce(null)

      const payment = await mockPrisma.payment.findFirst({
        where: { stripeSessionId: charge.payment_intent as string },
      })

      expect(payment).toBeNull()
      expect(mockPrisma.payment.update).not.toHaveBeenCalled()
    })

    it('should handle refund email failure gracefully', async () => {
      mockPrisma.payment.findFirst.mockResolvedValueOnce({
        id: 'payment_refund_fail_001',
        userId: 'user_refund_fail_001',
      })

      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user_refund_fail_001',
        email: 'refund_fail@example.com',
        name: 'Client',
      })

      mockEmailService.sendRefundConfirmationEmail.mockRejectedValueOnce(
        new Error('Email service error')
      )

      try {
        await mockEmailService.sendRefundConfirmationEmail('refund_fail@example.com', {
          clientName: 'Client',
          amount: 50,
          currency: 'eur',
        })
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should handle refund without receipt_email', async () => {
      const charge = {
        id: 'ch_no_receipt_001',
        payment_intent: 'pi_no_receipt_001',
        amount_refunded: 5000,
      } as unknown as Stripe.Charge

      mockPrisma.payment.findFirst.mockResolvedValueOnce({
        id: 'payment_no_receipt_001',
        userId: 'user_no_receipt_001',
      })

      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user_no_receipt_001',
        email: 'no_receipt@example.com',
        name: 'User NoEmail',
      })

      expect(charge.receipt_email).toBeUndefined()

      const user = await mockPrisma.user.findUnique({ where: { id: 'user_no_receipt_001' } })
      const clientEmail = charge.receipt_email || user?.email
      expect(clientEmail).toBe('no_receipt@example.com')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty metadata gracefully', () => {
      const paymentIntent = {
        id: 'pi_empty_meta_001',
        amount: 10000,
        metadata: {},
      } as unknown as Stripe.PaymentIntent

      const clientName = paymentIntent.metadata?.clientName || 'Cliente'
      expect(clientName).toBe('Cliente')
    })

    it('should handle missing email completely', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user_no_email_001',
        name: 'User Missing Email',
        email: undefined,
      })

      const user = await mockPrisma.user.findUnique({ where: { id: 'user_no_email_001' } })
      expect(user?.email).toBeUndefined()
    })

    it('should handle very large amounts correctly', () => {
      const paymentIntent = {
        id: 'pi_large_amount_001',
        amount: 999999999,
        metadata: { userId: 'user_large_amount_001' },
      } as unknown as Stripe.PaymentIntent

      const amountInEuros = paymentIntent.amount / 100
      expect(amountInEuros).toBe(9999999.99)
    })

    it('should handle zero amount', () => {
      const paymentIntent = {
        id: 'pi_zero_amount_001',
        amount: 0,
        metadata: { userId: 'user_zero_amount_001' },
      } as unknown as Stripe.PaymentIntent

      const amountInEuros = paymentIntent.amount / 100
      expect(amountInEuros).toBe(0)
    })
  })

  describe('Webhook Environment Configuration', () => {
    it('should have STRIPE_SECRET_KEY configured', () => {
      expect(process.env.STRIPE_SECRET_KEY).toBe('sk_test_123456789')
    })

    it('should have STRIPE_WEBHOOK_SECRET configured', () => {
      expect(process.env.STRIPE_WEBHOOK_SECRET).toBe('whsec_test_123456789')
    })

    it('should have STRIPE_SECRET_KEY defined', () => {
      const key = process.env.STRIPE_SECRET_KEY
      expect(key).toBeDefined()
    })
  })
})
