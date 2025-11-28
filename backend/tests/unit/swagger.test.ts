/**
 * Unit Tests - Swagger Configuration
 * Tests for swagger.ts configuration and spec generation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock swagger-jsdoc before importing
const mockSwaggerJsdoc = vi.fn().mockReturnValue({
  openapi: '3.0.0',
  info: { title: 'Test API', version: '1.0.0' },
  paths: {},
})

vi.mock('swagger-jsdoc', () => ({
  default: mockSwaggerJsdoc,
}))

describe('Swagger Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset modules to re-import with fresh env vars
    vi.resetModules()
  })

  describe('swaggerSpec generation', () => {
    it('should generate swagger spec with correct OpenAPI version', async () => {
      const { swaggerSpec } = await import('../../src/config/swagger')
      
      expect(swaggerSpec).toBeDefined()
      expect(mockSwaggerJsdoc).toHaveBeenCalled()
    })

    it('should call swagger-jsdoc with correct options structure', async () => {
      await import('../../src/config/swagger')
      
      expect(mockSwaggerJsdoc).toHaveBeenCalledWith(
        expect.objectContaining({
          definition: expect.objectContaining({
            openapi: '3.0.0',
            info: expect.objectContaining({
              title: 'Barbara & Abogados API',
              version: '1.0.0',
            }),
          }),
          apis: expect.arrayContaining([
            expect.stringContaining('routes'),
          ]),
        })
      )
    })

    it('should include security schemes in components', async () => {
      await import('../../src/config/swagger')
      
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0]
      expect(callArgs.definition.components.securitySchemes).toBeDefined()
      expect(callArgs.definition.components.securitySchemes.bearerAuth).toBeDefined()
      expect(callArgs.definition.components.securitySchemes.bearerAuth.type).toBe('http')
      expect(callArgs.definition.components.securitySchemes.bearerAuth.scheme).toBe('bearer')
    })

    it('should include all required schemas', async () => {
      await import('../../src/config/swagger')
      
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0]
      const schemas = callArgs.definition.components.schemas
      
      expect(schemas.Error).toBeDefined()
      expect(schemas.ValidationError).toBeDefined()
      expect(schemas.Pagination).toBeDefined()
      expect(schemas.User).toBeDefined()
      expect(schemas.AuthTokens).toBeDefined()
      expect(schemas.LoginRequest).toBeDefined()
      expect(schemas.RegisterRequest).toBeDefined()
      expect(schemas.Payment).toBeDefined()
      expect(schemas.CreatePaymentIntentRequest).toBeDefined()
      expect(schemas.FilterQuestionRequest).toBeDefined()
      expect(schemas.FilterQuestionResponse).toBeDefined()
      expect(schemas.Analytics).toBeDefined()
    })

    it('should include all API tags', async () => {
      await import('../../src/config/swagger')
      
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0]
      const tags = callArgs.definition.tags
      
      expect(tags).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Auth' }),
          expect.objectContaining({ name: 'FAQ' }),
          expect.objectContaining({ name: 'Payments' }),
          expect.objectContaining({ name: 'Admin' }),
          expect.objectContaining({ name: 'Health' }),
        ])
      )
    })

    it('should use APP_DOMAIN env var for server URL when set', async () => {
      process.env.APP_DOMAIN = 'https://api.example.com'
      vi.resetModules()
      
      await import('../../src/config/swagger')
      
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0]
      expect(callArgs.definition.servers[0].url).toBe('https://api.example.com')
      
      delete process.env.APP_DOMAIN
    })

    it('should default to localhost when APP_DOMAIN not set', async () => {
      delete process.env.APP_DOMAIN
      vi.resetModules()
      
      await import('../../src/config/swagger')
      
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0]
      expect(callArgs.definition.servers[0].url).toBe('http://localhost:3000')
    })

    it('should set server description based on NODE_ENV', async () => {
      process.env.NODE_ENV = 'production'
      vi.resetModules()
      
      await import('../../src/config/swagger')
      
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0]
      expect(callArgs.definition.servers[0].description).toBe('Production server')
      
      process.env.NODE_ENV = 'test'
    })

    it('should set development server description when not production', async () => {
      process.env.NODE_ENV = 'development'
      vi.resetModules()
      
      await import('../../src/config/swagger')
      
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0]
      expect(callArgs.definition.servers[0].description).toBe('Development server')
      
      process.env.NODE_ENV = 'test'
    })
  })

  describe('Schema definitions', () => {
    it('Error schema should have required properties', async () => {
      await import('../../src/config/swagger')
      
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0]
      const errorSchema = callArgs.definition.components.schemas.Error
      
      expect(errorSchema.type).toBe('object')
      expect(errorSchema.properties.success).toBeDefined()
      expect(errorSchema.properties.error).toBeDefined()
    })

    it('User schema should have all user properties', async () => {
      await import('../../src/config/swagger')
      
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0]
      const userSchema = callArgs.definition.components.schemas.User
      
      expect(userSchema.properties.id).toBeDefined()
      expect(userSchema.properties.email).toBeDefined()
      expect(userSchema.properties.name).toBeDefined()
      expect(userSchema.properties.role).toBeDefined()
      expect(userSchema.properties.role.enum).toContain('user')
      expect(userSchema.properties.role.enum).toContain('admin')
    })

    it('LoginRequest schema should require email and password', async () => {
      await import('../../src/config/swagger')
      
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0]
      const loginSchema = callArgs.definition.components.schemas.LoginRequest
      
      expect(loginSchema.required).toContain('email')
      expect(loginSchema.required).toContain('password')
    })

    it('RegisterRequest schema should require email, password, and name', async () => {
      await import('../../src/config/swagger')
      
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0]
      const registerSchema = callArgs.definition.components.schemas.RegisterRequest
      
      expect(registerSchema.required).toContain('email')
      expect(registerSchema.required).toContain('password')
      expect(registerSchema.required).toContain('name')
    })

    it('Payment schema should have correct status enum', async () => {
      await import('../../src/config/swagger')
      
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0]
      const paymentSchema = callArgs.definition.components.schemas.Payment
      
      expect(paymentSchema.properties.status.enum).toEqual(
        expect.arrayContaining(['pending', 'completed', 'failed', 'refunded'])
      )
    })

    it('FilterQuestionResponse should have complexity enum', async () => {
      await import('../../src/config/swagger')
      
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0]
      const filterSchema = callArgs.definition.components.schemas.FilterQuestionResponse
      
      expect(filterSchema.properties.data.properties.complexity.enum).toEqual(
        expect.arrayContaining(['simple', 'medium', 'complex'])
      )
    })
  })

  describe('API info', () => {
    it('should include contact information', async () => {
      await import('../../src/config/swagger')
      
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0]
      expect(callArgs.definition.info.contact).toBeDefined()
      expect(callArgs.definition.info.contact.name).toBe('Barbara & Abogados')
      expect(callArgs.definition.info.contact.email).toBeDefined()
    })

    it('should include API description with rate limiting info', async () => {
      await import('../../src/config/swagger')
      
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0]
      expect(callArgs.definition.info.description).toContain('Rate Limiting')
    })
  })
})
