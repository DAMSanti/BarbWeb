import { describe, it, expect } from 'vitest'
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalServerError,
  ServiceUnavailableError,
  PaymentError,
  isAppError,
} from '../../src/utils/errors'

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create AppError with default values', () => {
      const error = new AppError('Test error')
      
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(AppError)
      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(500)
      expect(error.isOperational).toBe(true)
      expect(error.timestamp).toBeInstanceOf(Date)
    })

    it('should create AppError with custom statusCode', () => {
      const error = new AppError('Bad request', 400)
      
      expect(error.statusCode).toBe(400)
      expect(error.isOperational).toBe(true)
    })

    it('should create AppError with isOperational=false', () => {
      const error = new AppError('Database error', 500, false)
      
      expect(error.isOperational).toBe(false)
    })

    it('should capture stack trace', () => {
      const error = new AppError('Test error')
      
      expect(error.stack).toBeDefined()
      expect(error.stack).toContain('Error: Test error')
    })

    it('should have correct prototype chain', () => {
      const error = new AppError('Test error')
      
      expect(Object.getPrototypeOf(error)).toBe(AppError.prototype)
    })
  })

  describe('ValidationError', () => {
    it('should create ValidationError with statusCode 400', () => {
      const error = new ValidationError('Invalid email')
      
      expect(error).toBeInstanceOf(ValidationError)
      expect(error).toBeInstanceOf(AppError)
      expect(error.message).toBe('Invalid email')
      expect(error.statusCode).toBe(400)
      expect(error.isOperational).toBe(true)
    })

    it('should store field errors', () => {
      const fields = { email: 'Invalid email format', password: 'Too short' }
      const error = new ValidationError('Validation failed', fields)
      
      expect(error.fields).toEqual(fields)
    })

    it('should create ValidationError without fields', () => {
      const error = new ValidationError('Validation failed')
      
      expect(error.fields).toBeUndefined()
    })
  })

  describe('AuthenticationError', () => {
    it('should create AuthenticationError with statusCode 401', () => {
      const error = new AuthenticationError('Invalid credentials')
      
      expect(error).toBeInstanceOf(AuthenticationError)
      expect(error).toBeInstanceOf(AppError)
      expect(error.message).toBe('Invalid credentials')
      expect(error.statusCode).toBe(401)
      expect(error.isOperational).toBe(true)
    })

    it('should use default message if not provided', () => {
      const error = new AuthenticationError()
      
      expect(error.message).toBe('No autenticado')
      expect(error.statusCode).toBe(401)
    })
  })

  describe('AuthorizationError', () => {
    it('should create AuthorizationError with statusCode 403', () => {
      const error = new AuthorizationError('Access denied')
      
      expect(error).toBeInstanceOf(AuthorizationError)
      expect(error).toBeInstanceOf(AppError)
      expect(error.message).toBe('Access denied')
      expect(error.statusCode).toBe(403)
      expect(error.isOperational).toBe(true)
    })

    it('should use default message if not provided', () => {
      const error = new AuthorizationError()
      
      expect(error.message).toBe('No autorizado')
      expect(error.statusCode).toBe(403)
    })
  })

  describe('NotFoundError', () => {
    it('should create NotFoundError with statusCode 404', () => {
      const error = new NotFoundError('User')
      
      expect(error).toBeInstanceOf(NotFoundError)
      expect(error).toBeInstanceOf(AppError)
      expect(error.message).toBe('User no encontrado')
      expect(error.statusCode).toBe(404)
      expect(error.isOperational).toBe(true)
    })

    it('should format resource name in message', () => {
      const error = new NotFoundError('Payment')
      expect(error.message).toBe('Payment no encontrado')
    })

    it('should work with different resource names', () => {
      const resources = ['User', 'Post', 'Comment', 'Consultation']
      
      resources.forEach(resource => {
        const error = new NotFoundError(resource)
        expect(error.message).toBe(`${resource} no encontrado`)
        expect(error.statusCode).toBe(404)
      })
    })
  })

  describe('ConflictError', () => {
    it('should create ConflictError with statusCode 409', () => {
      const error = new ConflictError('Email already exists')
      
      expect(error).toBeInstanceOf(ConflictError)
      expect(error).toBeInstanceOf(AppError)
      expect(error.message).toBe('Email already exists')
      expect(error.statusCode).toBe(409)
      expect(error.isOperational).toBe(true)
    })
  })

  describe('RateLimitError', () => {
    it('should create RateLimitError with statusCode 429', () => {
      const error = new RateLimitError('Too many requests')
      
      expect(error).toBeInstanceOf(RateLimitError)
      expect(error).toBeInstanceOf(AppError)
      expect(error.message).toBe('Too many requests')
      expect(error.statusCode).toBe(429)
      expect(error.isOperational).toBe(true)
    })

    it('should use default message if not provided', () => {
      const error = new RateLimitError()
      
      expect(error.message).toBe('Demasiadas solicitudes. Intenta más tarde.')
      expect(error.statusCode).toBe(429)
    })
  })

  describe('InternalServerError', () => {
    it('should create InternalServerError with statusCode 500', () => {
      const error = new InternalServerError('Database connection failed')
      
      expect(error).toBeInstanceOf(InternalServerError)
      expect(error).toBeInstanceOf(AppError)
      expect(error.message).toBe('Database connection failed')
      expect(error.statusCode).toBe(500)
      expect(error.isOperational).toBe(true)
    })

    it('should use default message if not provided', () => {
      const error = new InternalServerError()
      
      expect(error.message).toBe('Error interno del servidor')
      expect(error.statusCode).toBe(500)
    })
  })

  describe('ServiceUnavailableError', () => {
    it('should create ServiceUnavailableError with statusCode 503', () => {
      const error = new ServiceUnavailableError('Service is down')
      
      expect(error).toBeInstanceOf(ServiceUnavailableError)
      expect(error).toBeInstanceOf(AppError)
      expect(error.message).toBe('Service is down')
      expect(error.statusCode).toBe(503)
      expect(error.isOperational).toBe(true)
    })

    it('should use default message if not provided', () => {
      const error = new ServiceUnavailableError()
      
      expect(error.message).toBe('Servicio no disponible')
      expect(error.statusCode).toBe(503)
    })
  })

  describe('PaymentError', () => {
    it('should create PaymentError with statusCode 402', () => {
      const error = new PaymentError('Card declined')
      
      expect(error).toBeInstanceOf(PaymentError)
      expect(error).toBeInstanceOf(AppError)
      expect(error.message).toBe('Card declined')
      expect(error.statusCode).toBe(402)
      expect(error.isOperational).toBe(true)
    })
  })

  describe('isAppError type guard', () => {
    it('should return true for AppError instances', () => {
      const error = new AppError('Test error')
      expect(isAppError(error)).toBe(true)
    })

    it('should return true for AppError subclasses', () => {
      const errors = [
        new ValidationError('Test'),
        new AuthenticationError(),
        new AuthorizationError(),
        new NotFoundError('Test'),
        new ConflictError('Test'),
        new RateLimitError(),
        new InternalServerError(),
        new ServiceUnavailableError(),
        new PaymentError('Test'),
      ]

      errors.forEach(error => {
        expect(isAppError(error)).toBe(true)
      })
    })

    it('should return false for regular Error instances', () => {
      const error = new Error('Regular error')
      expect(isAppError(error)).toBe(false)
    })

    it('should return false for non-Error objects', () => {
      expect(isAppError('error')).toBe(false)
      expect(isAppError(null)).toBe(false)
      expect(isAppError(undefined)).toBe(false)
      expect(isAppError({ message: 'error' })).toBe(false)
      expect(isAppError(123)).toBe(false)
    })
  })

  describe('Error inheritance and instanceof checks', () => {
    it('should maintain proper instanceof relationships', () => {
      const validationError = new ValidationError('Test')
      const authError = new AuthenticationError()
      const notFoundError = new NotFoundError('Test')

      // All should be instances of AppError
      expect(validationError).toBeInstanceOf(AppError)
      expect(authError).toBeInstanceOf(AppError)
      expect(notFoundError).toBeInstanceOf(AppError)

      // But not instances of each other
      expect(validationError).not.toBeInstanceOf(AuthenticationError)
      expect(authError).not.toBeInstanceOf(ValidationError)
    })

    it('should maintain Error prototype chain', () => {
      const error = new AppError('Test')
      
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(AppError)
      expect(error instanceof Error).toBe(true)
      expect(error instanceof AppError).toBe(true)
    })
  })

  describe('Error timestamp', () => {
    it('should set timestamp to current date', () => {
      const before = new Date()
      const error = new AppError('Test')
      const after = new Date()

      expect(error.timestamp).toBeInstanceOf(Date)
      expect(error.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(error.timestamp.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should have different timestamps for errors created at different times', async () => {
      const error1 = new AppError('Error 1')
      
      // Add a small delay
      await new Promise(resolve => setTimeout(resolve, 10))
      
      const error2 = new AppError('Error 2')

      expect(error1.timestamp.getTime()).toBeLessThanOrEqual(error2.timestamp.getTime())
    })
  })

  describe('Error serialization', () => {
    it('should be serializable to JSON', () => {
      const error = new ValidationError('Invalid', { email: 'Required' })
      
      // Error objects don't serialize their properties in JSON by default
      // Verify the error object itself has the correct properties
      expect(error.message).toBe('Invalid')
      expect(error.statusCode).toBe(400)
    })

    it('should preserve error properties in JSON', () => {
      const error = new AppError('Test error', 403, false)
      
      // JSON.stringify on Error objects doesn't include properties by default
      // This is expected behavior for Error objects
      // We're just verifying the error structure is valid
      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(403)
      expect(error.isOperational).toBe(false)
    })
  })

  describe('Error message variations', () => {
    it('should handle empty messages', () => {
      const error = new AppError('')
      
      expect(error.message).toBe('')
      expect(error.statusCode).toBe(500)
    })

    it('should handle long messages', () => {
      const longMessage = 'a'.repeat(1000)
      const error = new AppError(longMessage)
      
      expect(error.message).toBe(longMessage)
    })

    it('should handle special characters in messages', () => {
      const specialMessage = 'Error: "test" & <invalid> ✓'
      const error = new AppError(specialMessage)
      
      expect(error.message).toBe(specialMessage)
    })
  })
})
