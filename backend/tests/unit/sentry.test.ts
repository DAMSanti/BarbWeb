/**
 * Unit Tests - Sentry Configuration
 * Tests for sentry.ts error tracking setup
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { Express } from 'express'

// Use vi.hoisted to define mocks BEFORE module import
const {
  mockSentryInit,
  mockSetupExpressErrorHandler,
  mockCaptureException,
  mockCaptureMessage,
  mockSetUser,
  mockCaptureConsoleIntegration,
} = vi.hoisted(() => ({
  mockSentryInit: vi.fn(),
  mockSetupExpressErrorHandler: vi.fn(),
  mockCaptureException: vi.fn(),
  mockCaptureMessage: vi.fn(),
  mockSetUser: vi.fn(),
  mockCaptureConsoleIntegration: vi.fn().mockReturnValue({ name: 'CaptureConsole' }),
}))

vi.mock('@sentry/node', () => ({
  init: mockSentryInit,
  setupExpressErrorHandler: mockSetupExpressErrorHandler,
  captureException: mockCaptureException,
  captureMessage: mockCaptureMessage,
  setUser: mockSetUser,
  captureConsoleIntegration: mockCaptureConsoleIntegration,
}))

vi.mock('../../src/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

// Import after mocking
import {
  initializeSentry,
  setupSentryErrorHandler,
  captureException,
  captureMessage,
  setUser,
  clearUser,
} from '../../src/config/sentry'
import { logger } from '../../src/utils/logger.js'

describe('Sentry Configuration', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('initializeSentry', () => {
    it('should warn and return early when SENTRY_DSN is not set', () => {
      delete process.env.SENTRY_DSN
      
      initializeSentry()
      
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('SENTRY_DSN not configured')
      )
      expect(mockSentryInit).not.toHaveBeenCalled()
    })

    it('should initialize Sentry when SENTRY_DSN is set', () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123'
      
      initializeSentry()
      
      expect(mockSentryInit).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: 'https://test@sentry.io/123',
        })
      )
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Sentry initialized')
      )
    })

    it('should use SENTRY_ENVIRONMENT when set', () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123'
      process.env.SENTRY_ENVIRONMENT = 'staging'
      
      initializeSentry()
      
      expect(mockSentryInit).toHaveBeenCalledWith(
        expect.objectContaining({
          environment: 'staging',
        })
      )
    })

    it('should fallback to NODE_ENV for environment', () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123'
      delete process.env.SENTRY_ENVIRONMENT
      process.env.NODE_ENV = 'production'
      
      initializeSentry()
      
      expect(mockSentryInit).toHaveBeenCalledWith(
        expect.objectContaining({
          environment: 'production',
        })
      )
    })

    it('should use SENTRY_RELEASE when set', () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123'
      process.env.SENTRY_RELEASE = 'v2.0.0'
      
      initializeSentry()
      
      expect(mockSentryInit).toHaveBeenCalledWith(
        expect.objectContaining({
          release: 'v2.0.0',
        })
      )
    })

    it('should set lower tracesSampleRate in production', () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123'
      process.env.NODE_ENV = 'production'
      
      initializeSentry()
      
      expect(mockSentryInit).toHaveBeenCalledWith(
        expect.objectContaining({
          tracesSampleRate: 0.1,
        })
      )
    })

    it('should set higher tracesSampleRate in development', () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123'
      process.env.NODE_ENV = 'development'
      
      initializeSentry()
      
      expect(mockSentryInit).toHaveBeenCalledWith(
        expect.objectContaining({
          tracesSampleRate: 1.0,
        })
      )
    })

    it('should include captureConsole integration', () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123'
      
      initializeSentry()
      
      expect(mockCaptureConsoleIntegration).toHaveBeenCalledWith({ levels: ['error'] })
      expect(mockSentryInit).toHaveBeenCalledWith(
        expect.objectContaining({
          integrations: expect.arrayContaining([
            expect.objectContaining({ name: 'CaptureConsole' }),
          ]),
        })
      )
    })

    it('should include ignoreErrors list', () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123'
      
      initializeSentry()
      
      expect(mockSentryInit).toHaveBeenCalledWith(
        expect.objectContaining({
          ignoreErrors: expect.arrayContaining([
            'Network request failed',
            'Failed to fetch',
            'Too many requests',
            'Invalid credentials',
            'Token expired',
          ]),
        })
      )
    })

    it('should log error when Sentry init throws', () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123'
      mockSentryInit.mockImplementationOnce(() => {
        throw new Error('Init failed')
      })
      
      initializeSentry()
      
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to initialize Sentry:',
        expect.any(Error)
      )
    })

    describe('beforeSend filter', () => {
      it('should filter sensitive headers', () => {
        process.env.SENTRY_DSN = 'https://test@sentry.io/123'
        
        initializeSentry()
        
        const beforeSend = mockSentryInit.mock.calls[0][0].beforeSend
        const event = {
          request: {
            headers: {
              authorization: 'Bearer secret',
              cookie: 'session=abc',
              'x-api-key': 'api-key-123',
              'content-type': 'application/json',
            },
          },
        }
        
        const result = beforeSend(event)
        
        expect(result.request.headers.authorization).toBeUndefined()
        expect(result.request.headers.cookie).toBeUndefined()
        expect(result.request.headers['x-api-key']).toBeUndefined()
        expect(result.request.headers['content-type']).toBe('application/json')
      })

      it('should redact sensitive data from request body', () => {
        process.env.SENTRY_DSN = 'https://test@sentry.io/123'
        
        initializeSentry()
        
        const beforeSend = mockSentryInit.mock.calls[0][0].beforeSend
        const event = {
          request: {
            data: JSON.stringify({
              email: 'user@example.com',
              password: 'secret123',
              refreshToken: 'refresh-token',
              accessToken: 'access-token',
            }),
          },
        }
        
        const result = beforeSend(event)
        const parsedData = JSON.parse(result.request.data)
        
        expect(parsedData.email).toBe('user@example.com')
        expect(parsedData.password).toBe('[REDACTED]')
        expect(parsedData.refreshToken).toBe('[REDACTED]')
        expect(parsedData.accessToken).toBe('[REDACTED]')
      })

      it('should handle object request data', () => {
        process.env.SENTRY_DSN = 'https://test@sentry.io/123'
        
        initializeSentry()
        
        const beforeSend = mockSentryInit.mock.calls[0][0].beforeSend
        const event = {
          request: {
            data: {
              email: 'user@example.com',
              password: 'secret123',
            },
          },
        }
        
        const result = beforeSend(event)
        const parsedData = JSON.parse(result.request.data)
        
        expect(parsedData.password).toBe('[REDACTED]')
      })

      it('should return event when no request data', () => {
        process.env.SENTRY_DSN = 'https://test@sentry.io/123'
        
        initializeSentry()
        
        const beforeSend = mockSentryInit.mock.calls[0][0].beforeSend
        const event = { message: 'Test error' }
        
        const result = beforeSend(event)
        
        expect(result).toEqual(event)
      })
    })
  })

  describe('setupSentryErrorHandler', () => {
    it('should not setup handler when SENTRY_DSN is not set', () => {
      delete process.env.SENTRY_DSN
      const mockApp = {} as Express
      
      setupSentryErrorHandler(mockApp)
      
      expect(mockSetupExpressErrorHandler).not.toHaveBeenCalled()
    })

    it('should setup handler when SENTRY_DSN is set', () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123'
      const mockApp = {} as Express
      
      setupSentryErrorHandler(mockApp)
      
      expect(mockSetupExpressErrorHandler).toHaveBeenCalledWith(mockApp)
    })
  })

  describe('captureException', () => {
    it('should log error when SENTRY_DSN is not set', () => {
      delete process.env.SENTRY_DSN
      const error = new Error('Test error')
      
      captureException(error)
      
      expect(logger.error).toHaveBeenCalledWith(
        'Untracked error (Sentry disabled):',
        error
      )
      expect(mockCaptureException).not.toHaveBeenCalled()
    })

    it('should capture exception when SENTRY_DSN is set', () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123'
      const error = new Error('Test error')
      const context = { userId: '123' }
      
      captureException(error, context)
      
      expect(mockCaptureException).toHaveBeenCalledWith(error, {
        extra: context,
      })
    })

    it('should capture exception without context', () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123'
      const error = new Error('Test error')
      
      captureException(error)
      
      expect(mockCaptureException).toHaveBeenCalledWith(error, {
        extra: undefined,
      })
    })
  })

  describe('captureMessage', () => {
    it('should log message when SENTRY_DSN is not set', () => {
      delete process.env.SENTRY_DSN
      
      captureMessage('Test message')
      
      expect(logger.info).toHaveBeenCalledWith(
        'Untracked message (Sentry disabled): Test message'
      )
      expect(mockCaptureMessage).not.toHaveBeenCalled()
    })

    it('should capture message when SENTRY_DSN is set', () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123'
      
      captureMessage('Test message')
      
      expect(mockCaptureMessage).toHaveBeenCalledWith('Test message', 'info')
    })

    it('should capture message with custom level', () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123'
      
      captureMessage('Warning message', 'warning')
      
      expect(mockCaptureMessage).toHaveBeenCalledWith('Warning message', 'warning')
    })
  })

  describe('setUser', () => {
    it('should not set user when SENTRY_DSN is not set', () => {
      delete process.env.SENTRY_DSN
      
      setUser({ id: '123', email: 'test@example.com' })
      
      expect(mockSetUser).not.toHaveBeenCalled()
    })

    it('should set user when SENTRY_DSN is set', () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123'
      
      setUser({ id: '123', email: 'test@example.com', role: 'admin' })
      
      expect(mockSetUser).toHaveBeenCalledWith({
        id: '123',
        email: 'test@example.com',
        // role should NOT be included for security
      })
    })
  })

  describe('clearUser', () => {
    it('should not clear user when SENTRY_DSN is not set', () => {
      delete process.env.SENTRY_DSN
      
      clearUser()
      
      expect(mockSetUser).not.toHaveBeenCalled()
    })

    it('should clear user when SENTRY_DSN is set', () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123'
      
      clearUser()
      
      expect(mockSetUser).toHaveBeenCalledWith(null)
    })
  })
})
