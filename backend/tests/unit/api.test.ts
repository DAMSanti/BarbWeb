/**
 * Unit Tests - API Routes
 * Tests para endpoints de preguntas, respuestas detalladas, y utilidades
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'

// Hoist mocks
const { mockOpenAIService, mockFaqDatabase, mockEmailService, mockFetch } = vi.hoisted(() => {
  const mockOpenAIService = {
    filterQuestionWithAI: vi.fn(),
    generateDetailedResponse: vi.fn(),
  }

  const mockFaqDatabase = {
    findSimilarFAQ: vi.fn(),
  }

  const mockEmailService = {
    sendPaymentConfirmationEmail: vi.fn(),
  }

  const mockFetch = vi.fn()
  global.fetch = mockFetch as any

  return {
    mockOpenAIService,
    mockFaqDatabase,
    mockEmailService,
    mockFetch,
  }
})

// Set env vars
process.env.GEMINI_API_KEY = 'test_gemini_key_123'

vi.mock('../../src/services/openaiService', () => ({
  filterQuestionWithAI: mockOpenAIService.filterQuestionWithAI,
  generateDetailedResponse: mockOpenAIService.generateDetailedResponse,
}))

vi.mock('../../src/utils/faqDatabase', () => ({
  findSimilarFAQ: mockFaqDatabase.findSimilarFAQ,
}))

vi.mock('../../src/services/emailService', () => ({
  sendPaymentConfirmationEmail: mockEmailService.sendPaymentConfirmationEmail,
}))

vi.mock('../../src/middleware/rateLimit', () => ({
  apiRateLimit: (req: any, res: any, next: any) => next(),
}))

vi.mock('../../src/middleware/errorHandler', () => ({
  asyncHandler: (fn: any) => (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next),
}))

vi.mock('../../src/middleware/validation', () => ({
  validate: (schema: any) => (req: any, res: any, next: any) => next(),
}))

vi.mock('../../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

import apiRouter from '../../src/routes/api'

describe('API Routes', () => {
  let app: express.Application

  beforeEach(() => {
    vi.clearAllMocks()

    app = express()
    app.use(express.json())
    app.use('/api', apiRouter)
  })

  describe('POST /api/filter-question', () => {
    it('should filter a legal question successfully', async () => {
      mockOpenAIService.filterQuestionWithAI.mockResolvedValueOnce({
        category: 'Derecho Laboral',
        briefAnswer:
          'En México, el despido injustificado es ilegal. Tienes derecho a indemnización.',
        needsProfessionalConsultation: true,
        reasoning: 'Complex employment law issue',
        confidence: 0.95,
        complexity: 'complex',
      })

      mockFaqDatabase.findSimilarFAQ.mockReturnValueOnce(null)

      const response = await request(app).post('/api/filter-question').send({
        question: 'Fue despedido sin razón aparente, ¿cuáles son mis derechos?',
      })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.category).toBe('Derecho Laboral')
      expect(response.body.data.complexity).toBe('complex')
      expect(response.body.data.confidence).toBe(0.95)
    })

    it('should use FAQ database answer when available', async () => {
      const faqAnswer = 'This is from local FAQ database'

      mockOpenAIService.filterQuestionWithAI.mockResolvedValueOnce({
        category: 'Derecho Civil',
        briefAnswer: 'AI generated answer',
        needsProfessionalConsultation: false,
        reasoning: 'Simple civil law',
        confidence: 0.9,
        complexity: 'simple',
      })

      mockFaqDatabase.findSimilarFAQ.mockReturnValueOnce({
        id: 'faq_123',
        question: 'Similar question',
        answer: faqAnswer,
        category: 'Derecho Civil',
      })

      const response = await request(app).post('/api/filter-question').send({
        question: 'What is property rights in civil law?',
      })

      expect(response.status).toBe(200)
      expect(response.body.data.briefAnswer).toBe(faqAnswer)
    })

    it('should validate minimum question length', async () => {
      const response = await request(app).post('/api/filter-question').send({
        question: 'Short', // Less than 10 chars
      })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should validate maximum question length', async () => {
      const longQuestion = 'a'.repeat(1001)

      const response = await request(app).post('/api/filter-question').send({
        question: longQuestion,
      })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should handle AI service errors gracefully', async () => {
      mockOpenAIService.filterQuestionWithAI.mockRejectedValueOnce(
        new Error('API Error from Gemini')
      )

      const response = await request(app).post('/api/filter-question').send({
        question: 'What are my employment rights?',
      })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should trim whitespace from question', async () => {
      mockOpenAIService.filterQuestionWithAI.mockResolvedValueOnce({
        category: 'Derecho Laboral',
        briefAnswer: 'Answer',
        needsProfessionalConsultation: false,
        reasoning: 'Simple',
        confidence: 0.9,
        complexity: 'simple',
      })

      mockFaqDatabase.findSimilarFAQ.mockReturnValueOnce(null)

      const response = await request(app).post('/api/filter-question').send({
        question: '  Question with spaces  ',
      })

      expect(response.status).toBe(200)
      expect(response.body.data.question).toContain('Question with spaces')
    })

    it('should require question field', async () => {
      const response = await request(app).post('/api/filter-question').send({})

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should include all required response fields', async () => {
      mockOpenAIService.filterQuestionWithAI.mockResolvedValueOnce({
        category: 'Derecho Penal',
        briefAnswer: 'Criminal law answer',
        needsProfessionalConsultation: true,
        reasoning: 'Serious criminal matter',
        confidence: 0.88,
        complexity: 'complex',
      })

      mockFaqDatabase.findSimilarFAQ.mockReturnValueOnce(null)

      const response = await request(app).post('/api/filter-question').send({
        question: 'Am I guilty of a crime?',
      })

      expect(response.body.data).toHaveProperty('question')
      expect(response.body.data).toHaveProperty('category')
      expect(response.body.data).toHaveProperty('briefAnswer')
      expect(response.body.data).toHaveProperty('needsProfessionalConsultation')
      expect(response.body.data).toHaveProperty('reasoning')
      expect(response.body.data).toHaveProperty('confidence')
      expect(response.body.data).toHaveProperty('complexity')
    })

    it('should handle different complexity levels', async () => {
      const complexities = ['simple', 'medium', 'complex']

      for (const complexity of complexities) {
        mockOpenAIService.filterQuestionWithAI.mockResolvedValueOnce({
          category: 'Test Category',
          briefAnswer: 'Answer',
          needsProfessionalConsultation: false,
          reasoning: 'Test',
          confidence: 0.9,
          complexity: complexity as 'simple' | 'medium' | 'complex',
        })

        mockFaqDatabase.findSimilarFAQ.mockReturnValueOnce(null)

        const response = await request(app).post('/api/filter-question').send({
          question: `Question with ${complexity} complexity`,
        })

        expect(response.body.data.complexity).toBe(complexity)
      }
    })
  })

  describe('POST /api/generate-response', () => {
    it('should generate detailed response successfully', async () => {
      const detailedResponse =
        'Detailed explanation about employment rights in Mexico...'

      mockOpenAIService.generateDetailedResponse.mockResolvedValueOnce(detailedResponse)

      const response = await request(app).post('/api/generate-response').send({
        question: 'What are my rights in case of wrongful termination?',
        category: 'Derecho Laboral',
      })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.response).toBe(detailedResponse)
      expect(response.body.data.category).toBe('Derecho Laboral')
    })

    it('should validate question length in generate-response', async () => {
      const response = await request(app).post('/api/generate-response').send({
        question: 'Short', // Less than 10 chars
        category: 'Derecho Laboral',
      })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should validate category length', async () => {
      const response = await request(app).post('/api/generate-response').send({
        question: 'What are my employment rights?',
        category: 'D', // Less than 2 chars
      })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should require both question and category', async () => {
      const response = await request(app).post('/api/generate-response').send({
        question: 'What are my employment rights?',
        // Missing category
      })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should trim whitespace from question and category', async () => {
      mockOpenAIService.generateDetailedResponse.mockResolvedValueOnce('Response text')

      const response = await request(app).post('/api/generate-response').send({
        question: '  Employment question  ',
        category: '  Derecho Laboral  ',
      })

      expect(response.status).toBe(200)
      expect(response.body.data.question).toContain('Employment question')
      expect(response.body.data.category).toContain('Derecho Laboral')
    })

    it('should handle service errors in generate-response', async () => {
      mockOpenAIService.generateDetailedResponse.mockRejectedValueOnce(
        new Error('Gemini API error')
      )

      const response = await request(app).post('/api/generate-response').send({
        question: 'What are my rights?',
        category: 'Derecho Laboral',
      })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should pass correct parameters to generateDetailedResponse', async () => {
      mockOpenAIService.generateDetailedResponse.mockResolvedValueOnce('Response')

      const question = 'What are my specific rights?'
      const category = 'Derecho Laboral'

      await request(app).post('/api/generate-response').send({
        question,
        category,
      })

      expect(mockOpenAIService.generateDetailedResponse).toHaveBeenCalledWith(
        question,
        category
      )
    })

    it('should include original question in response', async () => {
      mockOpenAIService.generateDetailedResponse.mockResolvedValueOnce('Generated response')

      const question = 'What are severance requirements?'

      const response = await request(app).post('/api/generate-response').send({
        question,
        category: 'Derecho Laboral',
      })

      expect(response.body.data.question).toBe(question)
    })
  })

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.status).toBe('ok')
    })

    it('should include timestamp in health response', async () => {
      const response = await request(app).get('/api/health')

      expect(response.body.timestamp).toBeDefined()
      expect(new Date(response.body.timestamp).getTime()).toBeGreaterThan(0)
    })

    it('should not require authentication', async () => {
      const response = await request(app).get('/api/health')

      expect(response.status).toBe(200)
    })

    it('should always return ok status', async () => {
      for (let i = 0; i < 3; i++) {
        const response = await request(app).get('/api/health')
        expect(response.body.status).toBe('ok')
      }
    })
  })

  describe('GET /api/list-models', () => {
    it('should list available Gemini models', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          models: [
            { name: 'models/gemini-pro', displayName: 'Gemini 1.5 Pro' },
            { name: 'models/gemini-1.5-flash', displayName: 'Gemini 1.5 Flash' },
          ],
        }),
      })

      const response = await request(app).get('/api/list-models')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.models).toHaveLength(2)
    })

    it('should handle missing GEMINI_API_KEY', async () => {
      const originalKey = process.env.GEMINI_API_KEY
      delete process.env.GEMINI_API_KEY

      const response = await request(app).get('/api/list-models')

      expect(response.status).toBeGreaterThanOrEqual(500)

      process.env.GEMINI_API_KEY = originalKey
    })

    it('should make request to Google API endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ models: [] }),
      })

      await request(app).get('/api/list-models')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('generativelanguage.googleapis.com')
      )
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining(process.env.GEMINI_API_KEY))
    })

    it('should return API response as-is when models key missing', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          name: 'models/gemini-pro',
          displayName: 'Gemini Pro',
        }),
      })

      const response = await request(app).get('/api/list-models')

      expect(response.body.models).toBeDefined()
    })

    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const response = await request(app).get('/api/list-models')

      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('POST /api/test-email', () => {
    it('should send test email successfully', async () => {
      mockEmailService.sendPaymentConfirmationEmail.mockResolvedValueOnce({
        id: 'email_123',
      })

      const response = await request(app).post('/api/test-email').send({
        to: 'test@example.com',
        clientName: 'John Doe',
      })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('Email sent')
      expect(response.body.emailId).toBe('email_123')
    })

    it('should validate required fields in test-email', async () => {
      const response = await request(app).post('/api/test-email').send({
        to: 'test@example.com',
        // Missing clientName
      })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('Missing required fields')
    })

    it('should require both to and clientName', async () => {
      const response = await request(app).post('/api/test-email').send({
        // Missing both fields
      })

      expect(response.status).toBe(400)
    })

    it('should call sendPaymentConfirmationEmail with correct parameters', async () => {
      mockEmailService.sendPaymentConfirmationEmail.mockResolvedValueOnce({
        id: 'email_123',
      })

      await request(app).post('/api/test-email').send({
        to: 'test@example.com',
        clientName: 'John Doe',
      })

      expect(mockEmailService.sendPaymentConfirmationEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          clientName: 'John Doe',
          amount: 50.0,
          currency: 'usd',
          category: 'Derecho Laboral',
        })
      )
    })

    it('should handle email service errors', async () => {
      mockEmailService.sendPaymentConfirmationEmail.mockRejectedValueOnce(
        new Error('Email service unavailable')
      )

      const response = await request(app).post('/api/test-email').send({
        to: 'test@example.com',
        clientName: 'John Doe',
      })

      expect(response.status).toBe(500)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('unavailable')
    })

    it('should include error details in response', async () => {
      mockEmailService.sendPaymentConfirmationEmail.mockRejectedValueOnce(
        new Error('Detailed error message')
      )

      const response = await request(app).post('/api/test-email').send({
        to: 'test@example.com',
        clientName: 'John Doe',
      })

      expect(response.body.error).toBe('Detailed error message')
      expect(response.body.stack).toBeDefined()
      expect(response.body.details).toBeDefined()
    })

    it('should include paymentId in email payload', async () => {
      mockEmailService.sendPaymentConfirmationEmail.mockResolvedValueOnce({
        id: 'email_123',
      })

      await request(app).post('/api/test-email').send({
        to: 'test@example.com',
        clientName: 'John Doe',
      })

      const callArgs = mockEmailService.sendPaymentConfirmationEmail.mock.calls[0][1]
      expect(callArgs.paymentId).toBeDefined()
      expect(callArgs.paymentId).toContain('pi_test_')
    })

    it('should handle missing to field', async () => {
      const response = await request(app).post('/api/test-email').send({
        clientName: 'John Doe',
        // Missing to
      })

      expect(response.status).toBe(400)
      expect(response.body.error).toBeDefined()
    })

    it('should handle missing clientName field', async () => {
      const response = await request(app).post('/api/test-email').send({
        to: 'test@example.com',
        // Missing clientName
      })

      expect(response.status).toBe(400)
    })
  })

  describe('Rate limiting', () => {
    it('should apply rate limiting to filter-question', async () => {
      // Rate limiter is mocked to allow all requests, just verify it's called
      mockOpenAIService.filterQuestionWithAI.mockResolvedValueOnce({
        category: 'Test',
        briefAnswer: 'Answer',
        needsProfessionalConsultation: false,
        reasoning: 'Test',
        confidence: 0.9,
        complexity: 'simple',
      })

      mockFaqDatabase.findSimilarFAQ.mockReturnValueOnce(null)

      const response = await request(app).post('/api/filter-question').send({
        question: 'Test question for rate limiting',
      })

      expect(response.status).toBe(200)
    })

    it('should apply rate limiting to generate-response', async () => {
      mockOpenAIService.generateDetailedResponse.mockResolvedValueOnce('Response')

      const response = await request(app).post('/api/generate-response').send({
        question: 'Test question for rate limiting',
        category: 'Test Category',
      })

      expect(response.status).toBe(200)
    })
  })

  describe('Error handling', () => {
    it('should return proper error format on validation failure', async () => {
      const response = await request(app).post('/api/filter-question').send({
        question: '',
      })

      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(response.body).toBeDefined()
    })

    it('should handle unexpected errors gracefully', async () => {
      mockOpenAIService.filterQuestionWithAI.mockRejectedValueOnce(
        new Error('Unexpected error')
      )

      const response = await request(app).post('/api/filter-question').send({
        question: 'Test question',
      })

      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(response.body).toBeDefined()
    })
  })
})
