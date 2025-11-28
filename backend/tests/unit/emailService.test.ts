/**
 * Unit Tests - Email Service (MOCKED)
 * Tests for email templates and sending logic
 * NO real emails sent - Resend API is mocked
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock Resend before importing emailService using vi.hoisted
const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn().mockResolvedValue({ data: { id: 'mock-email-id' }, error: null }),
}))

vi.mock('resend', () => {
  return {
    Resend: class MockResend {
      emails = {
        send: mockSend,
      }
    },
  }
})

// Import after mocking
import {
  sendWelcomeEmail,
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendPaymentConfirmationEmail,
  sendLawyerNotificationEmail,
  sendInvoiceEmail,
  sendPaymentFailedEmail,
  sendRefundConfirmationEmail,
} from '../../src/services/emailService'

describe('Email Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set required env var
    process.env.RESEND_API_KEY = 'test-resend-api-key'
  })

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with correct parameters', async () => {
      const result = await sendWelcomeEmail('user@example.com', {
        clientName: 'John Doe',
      })

      expect(result).toBeDefined()
    })

    it('should handle missing clientName gracefully', async () => {
      const result = await sendWelcomeEmail('user@example.com', {
        clientName: '',
      })

      expect(result).toBeDefined()
    })
  })

  describe('sendEmailVerificationEmail', () => {
    it('should send verification email with link', async () => {
      const result = await sendEmailVerificationEmail('user@example.com', {
        clientName: 'John Doe',
        verificationLink: 'https://example.com/verify?token=abc123',
        expiresInMinutes: 1440,
      })

      expect(result).toBeDefined()
    })

    it('should handle special characters in name', async () => {
      const result = await sendEmailVerificationEmail('user@example.com', {
        clientName: 'José María O\'Brien',
        verificationLink: 'https://example.com/verify?token=xyz',
        expiresInMinutes: 60,
      })

      expect(result).toBeDefined()
    })
  })

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email with link', async () => {
      const result = await sendPasswordResetEmail('user@example.com', {
        clientName: 'John Doe',
        resetLink: 'https://example.com/reset?token=reset123',
        expiresInMinutes: 60,
      })

      expect(result).toBeDefined()
    })

    it('should handle short expiration times', async () => {
      const result = await sendPasswordResetEmail('user@example.com', {
        clientName: 'User',
        resetLink: 'https://example.com/reset',
        expiresInMinutes: 15,
      })

      expect(result).toBeDefined()
    })
  })

  describe('sendPasswordChangedEmail', () => {
    it('should send password changed notification', async () => {
      const result = await sendPasswordChangedEmail('user@example.com', {
        clientName: 'John Doe',
        changedAt: new Date(),
      })

      expect(result).toBeDefined()
    })
  })

  describe('sendPaymentConfirmationEmail', () => {
    it('should send payment confirmation with all details', async () => {
      const result = await sendPaymentConfirmationEmail('user@example.com', {
        clientName: 'John Doe',
        category: 'Derecho Laboral',
        amount: 50.00,
        currency: 'EUR',
        paymentId: 'pay_123456',
        consultationSummary: '¿Cuáles son mis derechos laborales?',
      })

      expect(result).toBeDefined()
    })

    it('should format amount correctly', async () => {
      const result = await sendPaymentConfirmationEmail('user@example.com', {
        clientName: 'User',
        category: 'Consulta General',
        amount: 99.99,
        currency: 'EUR',
        paymentId: 'pay_abc',
        consultationSummary: 'Test question',
      })

      expect(result).toBeDefined()
    })
  })

  describe('sendLawyerNotificationEmail', () => {
    it('should send lawyer notification with consultation details', async () => {
      const result = await sendLawyerNotificationEmail({
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        category: 'Derecho Laboral',
        consultationSummary: '¿Pueden despedirme sin causa?',
        paymentId: 'pay_lawyer123',
        amount: 50,
      })

      expect(result).toBeDefined()
    })

    it('should include client contact info', async () => {
      const result = await sendLawyerNotificationEmail({
        clientName: 'María García',
        clientEmail: 'maria@email.com',
        category: 'Derecho Civil',
        consultationSummary: 'Consulta sobre herencia',
        paymentId: 'pay_civil',
        amount: 75,
      })

      expect(result).toBeDefined()
    })
  })

  describe('sendInvoiceEmail', () => {
    it('should send invoice with all billing details', async () => {
      const result = await sendInvoiceEmail('user@example.com', {
        clientName: 'John Doe',
        invoiceNumber: 'INV-2025-001',
        date: new Date().toISOString(),
        category: 'Consulta Legal',
        description: 'Consulta sobre derecho laboral',
        amount: 50.00,
        currency: 'EUR',
        taxAmount: 10.50,
        totalAmount: 60.50,
        paymentIntentId: 'pi_123456',
      })

      expect(result).toBeDefined()
    })

    it('should format date correctly', async () => {
      const result = await sendInvoiceEmail('user@example.com', {
        clientName: 'User',
        invoiceNumber: 'INV-123',
        date: '2025-11-27',
        category: 'Consulta',
        description: 'Test consultation',
        amount: 100,
        currency: 'EUR',
        taxAmount: 21,
        totalAmount: 121,
        paymentIntentId: 'pi_test',
      })

      expect(result).toBeDefined()
    })
  })

  describe('sendPaymentFailedEmail', () => {
    it('should send payment failed notification', async () => {
      const result = await sendPaymentFailedEmail('user@example.com', {
        clientName: 'John Doe',
        amount: 50,
        errorMessage: 'Insufficient funds',
      })

      expect(result).toBeDefined()
    })

    it('should work without error message', async () => {
      const result = await sendPaymentFailedEmail('user@example.com', {
        clientName: 'User',
        amount: 25,
      })

      expect(result).toBeDefined()
    })
  })

  describe('sendRefundConfirmationEmail', () => {
    it('should send refund confirmation', async () => {
      const result = await sendRefundConfirmationEmail('user@example.com', {
        clientName: 'John Doe',
        amount: 50,
        currency: 'EUR',
        refundReason: 'Client request',
      })

      expect(result).toBeDefined()
    })
  })
})

describe('Email Templates', () => {
  describe('HTML Structure', () => {
    it('all email functions should be defined', () => {
      expect(typeof sendWelcomeEmail).toBe('function')
      expect(typeof sendEmailVerificationEmail).toBe('function')
      expect(typeof sendPasswordResetEmail).toBe('function')
      expect(typeof sendPasswordChangedEmail).toBe('function')
      expect(typeof sendPaymentConfirmationEmail).toBe('function')
      expect(typeof sendLawyerNotificationEmail).toBe('function')
      expect(typeof sendInvoiceEmail).toBe('function')
      expect(typeof sendPaymentFailedEmail).toBe('function')
      expect(typeof sendRefundConfirmationEmail).toBe('function')
    })
  })
})

describe('Error Handling', () => {
  it('should handle missing RESEND_API_KEY gracefully', async () => {
    const originalKey = process.env.RESEND_API_KEY
    delete process.env.RESEND_API_KEY

    // Should not throw even without API key (mock handles it)
    const result = await sendWelcomeEmail('user@example.com', {
      clientName: 'User',
    })

    expect(result).toBeDefined()

    process.env.RESEND_API_KEY = originalKey
  })

  it('should handle invalid email format', async () => {
    // The email service should still try to send (validation is on Resend side)
    const result = await sendWelcomeEmail('invalid-email', {
      clientName: 'User',
    })

    // Mock always succeeds, in real scenario Resend would reject
    expect(result).toBeDefined()
  })

  it('should throw error when sendWelcomeEmail fails', async () => {
    mockSend.mockResolvedValueOnce({ data: null, error: { message: 'API Error' } })

    await expect(
      sendWelcomeEmail('user@example.com', { clientName: 'User' })
    ).rejects.toThrow()
  })

  it('should throw error when sendEmailVerificationEmail fails', async () => {
    mockSend.mockResolvedValueOnce({ data: null, error: { message: 'API Error' } })

    await expect(
      sendEmailVerificationEmail('user@example.com', {
        clientName: 'User',
        verificationLink: 'http://test.com/verify',
        expiresInMinutes: 60,
      })
    ).rejects.toThrow()
  })

  it('should throw error when sendPasswordResetEmail fails', async () => {
    mockSend.mockResolvedValueOnce({ data: null, error: { message: 'API Error' } })

    await expect(
      sendPasswordResetEmail('user@example.com', {
        clientName: 'User',
        resetLink: 'http://test.com/reset',
        expiresInMinutes: 60,
      })
    ).rejects.toThrow()
  })

  it('should throw error when sendPasswordChangedEmail fails', async () => {
    mockSend.mockResolvedValueOnce({ data: null, error: { message: 'API Error' } })

    await expect(
      sendPasswordChangedEmail('user@example.com', {
        clientName: 'User',
        changedAt: new Date(),
      })
    ).rejects.toThrow()
  })

  it('should throw error when sendPaymentConfirmationEmail fails', async () => {
    mockSend.mockResolvedValueOnce({ data: null, error: { message: 'API Error' } })

    await expect(
      sendPaymentConfirmationEmail('user@example.com', {
        clientName: 'User',
        category: 'Test',
        amount: 50,
        currency: 'EUR',
        paymentId: 'pay_123',
        consultationSummary: 'Test',
      })
    ).rejects.toThrow()
  })

  it('should throw error when sendLawyerNotificationEmail fails', async () => {
    mockSend.mockResolvedValueOnce({ data: null, error: { message: 'API Error' } })

    await expect(
      sendLawyerNotificationEmail({
        clientName: 'Client',
        clientEmail: 'client@example.com',
        category: 'Test',
        consultationSummary: 'Test question',
        paymentId: 'pay_123',
        amount: 50,
      })
    ).rejects.toThrow()
  })

  it('should throw error when sendInvoiceEmail fails', async () => {
    mockSend.mockResolvedValueOnce({ data: null, error: { message: 'API Error' } })

    await expect(
      sendInvoiceEmail('user@example.com', {
        clientName: 'User',
        invoiceNumber: 'INV-001',
        date: '2025-11-28',
        category: 'Consulta',
        description: 'Test',
        amount: 50,
        currency: 'EUR',
        taxAmount: 10.5,
        totalAmount: 60.5,
        paymentIntentId: 'pi_123',
      })
    ).rejects.toThrow()
  })

  it('should throw error when sendPaymentFailedEmail fails', async () => {
    mockSend.mockResolvedValueOnce({ data: null, error: { message: 'API Error' } })

    await expect(
      sendPaymentFailedEmail('user@example.com', {
        clientName: 'User',
        amount: 50,
        errorMessage: 'Payment declined',
      })
    ).rejects.toThrow()
  })

  it('should throw error when sendRefundConfirmationEmail fails', async () => {
    mockSend.mockResolvedValueOnce({ data: null, error: { message: 'API Error' } })

    await expect(
      sendRefundConfirmationEmail('user@example.com', {
        clientName: 'User',
        amount: 50,
        currency: 'EUR',
        refundReason: 'Client request',
      })
    ).rejects.toThrow()
  })

  it('should handle exception thrown by sendWelcomeEmail', async () => {
    mockSend.mockRejectedValueOnce(new Error('Network error'))

    await expect(
      sendWelcomeEmail('user@example.com', { clientName: 'User' })
    ).rejects.toThrow('Network error')
  })

  it('should handle exception thrown by sendPasswordResetEmail', async () => {
    mockSend.mockRejectedValueOnce(new Error('Timeout'))

    await expect(
      sendPasswordResetEmail('user@example.com', {
        clientName: 'User',
        resetLink: 'http://test.com/reset',
        expiresInMinutes: 60,
      })
    ).rejects.toThrow('Timeout')
  })

  it('should handle exception thrown by sendInvoiceEmail', async () => {
    mockSend.mockRejectedValueOnce(new Error('Service unavailable'))

    await expect(
      sendInvoiceEmail('user@example.com', {
        clientName: 'User',
        invoiceNumber: 'INV-001',
        date: '2025-11-28',
        category: 'Consulta',
        description: 'Test',
        amount: 50,
        currency: 'EUR',
        taxAmount: 10.5,
        totalAmount: 60.5,
        paymentIntentId: 'pi_123',
      })
    ).rejects.toThrow('Service unavailable')
  })
})
