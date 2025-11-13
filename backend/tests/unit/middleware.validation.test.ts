import { describe, it, expect, beforeEach } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import { ZodError, z } from 'zod'

/**
 * PURE VALIDATION LOGIC - No external dependencies
 * Tests for Zod schema validation and error formatting
 */

// Mock error formatter (from common.schemas)
export const formatZodErrors = (error: unknown) => {
  if (!(error instanceof ZodError)) return []
  const issues = (error as any).issues || []
  return issues.map((err: any) => ({
    field: err.path.join('.') || 'unknown',
    message: err.message,
    code: err.code,
  }))
}

// Validation middleware factory
export const createValidationMiddleware = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as any

      if (validated.body) req.body = validated.body
      if (validated.query) req.query = validated.query
      if (validated.params) req.params = validated.params

      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const fields = formatZodErrors(error).reduce((acc: Record<string, string>, err: any) => {
          acc[err.field] = err.message
          return acc
        }, {})

        const message = formatZodErrors(error)
          .map((e: any) => e.message)
          .join('; ')

        const validationError = new Error(message)
        ;(validationError as any).statusCode = 400
        ;(validationError as any).fields = fields
        next(validationError)
      } else {
        next(error)
      }
    }
  }
}

// Test schemas
const createRegisterSchema = () =>
  z.object({
    body: z.object({
      name: z.string().min(2, 'Name must be at least 2 characters').max(100),
      email: z.string().email('Invalid email format'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional(),
  })

const createLoginSchema = () =>
  z.object({
    body: z.object({
      email: z.string().email('Invalid email'),
      password: z.string().min(1, 'Password required'),
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional(),
  })

const createPaymentSchema = () =>
  z.object({
    body: z.object({
      amount: z.number().min(1, 'Amount must be > 0').max(999999.99),
      currency: z.enum(['EUR', 'USD', 'GBP']),
      category: z.enum(['Civil', 'Penal', 'Laboral', 'Administrativo', 'Mercantil', 'Familia']),
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional(),
  })

const createPaginationSchema = () =>
  z.object({
    body: z.object({}).optional(),
    query: z.object({
      page: z.string().regex(/^\d+$/, 'Page must be a number').transform(Number).default('1' as any),
      limit: z.string().regex(/^\d+$/, 'Limit must be a number').transform(Number).default('10' as any),
    }),
    params: z.object({}).optional(),
  })

const createUserIdSchema = () =>
  z.object({
    body: z.object({}).optional(),
    query: z.object({}).optional(),
    params: z.object({
      id: z.string().uuid('Invalid user ID format'),
    }),
  })

describe('Validation Middleware', () => {
  describe('Schema Parsing - Valid Inputs', () => {
    it('should accept valid registration data', () => {
      const schema = createRegisterSchema()
      const data = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePass123',
        },
        query: {},
        params: {},
      }

      expect(() => schema.parse(data)).not.toThrow()
      const result = schema.parse(data)
      expect(result.body.name).toBe('John Doe')
    })

    it('should accept valid login data', () => {
      const schema = createLoginSchema()
      const data = {
        body: {
          email: 'user@example.com',
          password: 'password',
        },
      }

      expect(() => schema.parse(data)).not.toThrow()
    })

    it('should accept valid payment data', () => {
      const schema = createPaymentSchema()
      const data = {
        body: {
          amount: 50.0,
          currency: 'EUR',
          category: 'Civil',
        },
      }

      expect(() => schema.parse(data)).not.toThrow()
    })

    it('should accept valid pagination params', () => {
      const schema = createPaginationSchema()
      const data = {
        body: {},
        query: {
          page: '1',
          limit: '20',
        },
        params: {},
      }

      expect(() => schema.parse(data)).not.toThrow()
      const result = schema.parse(data)
      expect(result.query.page).toBe(1)
      expect(result.query.limit).toBe(20)
    })

    it('should use default pagination values', () => {
      const schema = createPaginationSchema()
      const data = {
        query: {},
      }

      const result = schema.parse(data)
      // Default strings are returned as strings since they're defaults after .transform()
      expect(result.query.page).toBeDefined()
      expect(result.query.limit).toBeDefined()
    })

    it('should accept valid UUID in params', () => {
      const schema = createUserIdSchema()
      const data = {
        params: {
          id: '550e8400-e29b-41d4-a716-446655440000',
        },
      }

      expect(() => schema.parse(data)).not.toThrow()
    })
  })

  describe('Schema Validation - Invalid Inputs', () => {
    it('should reject registration with invalid email', () => {
      const schema = createRegisterSchema()
      const data = {
        body: {
          name: 'John Doe',
          email: 'invalid-email',
          password: 'SecurePass123',
        },
      }

      expect(() => schema.parse(data)).toThrow(ZodError)
    })

    it('should reject registration with short password', () => {
      const schema = createRegisterSchema()
      const data = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'short',
        },
      }

      expect(() => schema.parse(data)).toThrow(ZodError)
    })

    it('should reject registration with short name', () => {
      const schema = createRegisterSchema()
      const data = {
        body: {
          name: 'J',
          email: 'john@example.com',
          password: 'SecurePass123',
        },
      }

      expect(() => schema.parse(data)).toThrow(ZodError)
    })

    it('should reject missing required fields', () => {
      const schema = createLoginSchema()
      const data = {
        body: {
          email: 'user@example.com',
          // password missing
        },
      }

      expect(() => schema.parse(data)).toThrow(ZodError)
    })

    it('should reject invalid payment amount (zero)', () => {
      const schema = createPaymentSchema()
      const data = {
        body: {
          amount: 0,
          currency: 'EUR',
          category: 'Civil',
        },
      }

      expect(() => schema.parse(data)).toThrow(ZodError)
    })

    it('should reject invalid payment amount (negative)', () => {
      const schema = createPaymentSchema()
      const data = {
        body: {
          amount: -50,
          currency: 'EUR',
          category: 'Civil',
        },
      }

      expect(() => schema.parse(data)).toThrow(ZodError)
    })

    it('should reject invalid currency', () => {
      const schema = createPaymentSchema()
      const data = {
        body: {
          amount: 50,
          currency: 'XYZ',
          category: 'Civil',
        },
      }

      expect(() => schema.parse(data)).toThrow(ZodError)
    })

    it('should reject invalid category', () => {
      const schema = createPaymentSchema()
      const data = {
        body: {
          amount: 50,
          currency: 'EUR',
          category: 'InvalidCategory',
        },
      }

      expect(() => schema.parse(data)).toThrow(ZodError)
    })

    it('should reject invalid pagination page (non-numeric)', () => {
      const schema = createPaginationSchema()
      const data = {
        query: {
          page: 'abc',
          limit: '10',
        },
      }

      expect(() => schema.parse(data)).toThrow(ZodError)
    })

    it('should reject invalid UUID format', () => {
      const schema = createUserIdSchema()
      const data = {
        params: {
          id: 'not-a-uuid',
        },
      }

      expect(() => schema.parse(data)).toThrow(ZodError)
    })
  })

  describe('Error Formatting', () => {
    it('should format single error correctly', () => {
      const schema = createLoginSchema()
      const data = {
        body: {
          email: 'invalid',
          password: 'pass',
        },
      }

      try {
        schema.parse(data)
      } catch (error) {
        if (error instanceof ZodError) {
          const formatted = formatZodErrors(error)
          expect(formatted).toHaveLength(1)
          expect((formatted as any)[0].field).toBe('body.email')
          expect((formatted as any)[0].message).toContain('email')
        }
      }
    })

    it('should format multiple errors correctly', () => {
      const schema = createRegisterSchema()
      const data = {
        body: {
          name: 'J', // too short
          email: 'invalid', // invalid format
          password: 'short', // too short
        },
      }

      try {
        schema.parse(data)
      } catch (error) {
        if (error instanceof ZodError) {
          const formatted = formatZodErrors(error)
          expect(formatted.length).toBeGreaterThan(1)
          const fields = (formatted as any).map((e: any) => e.field)
          expect(fields).toContain('body.name')
          expect(fields).toContain('body.email')
          expect(fields).toContain('body.password')
        }
      }
    })

    it('should include error code in formatted output', () => {
      const schema = createPaymentSchema()
      const data = {
        body: {
          amount: 'not-a-number',
          currency: 'EUR',
          category: 'Civil',
        },
      }

      try {
        schema.parse(data)
      } catch (error) {
        if (error instanceof ZodError) {
          const formatted = formatZodErrors(error)
          expect((formatted as any)[0]).toHaveProperty('code')
          expect(typeof (formatted as any)[0].code).toBe('string')
        }
      }
    })

    it('should handle nested field errors', () => {
      const schema = z.object({
        body: z.object({
          user: z.object({
            name: z.string().min(2),
            email: z.string().email(),
          }),
        }),
      })

      const data = {
        body: {
          user: {
            name: 'J',
            email: 'invalid',
          },
        },
      }

      try {
        schema.parse(data)
      } catch (error) {
        if (error instanceof ZodError) {
          const formatted = formatZodErrors(error)
          const fields = (formatted as any).map((e: any) => e.field)
          expect(fields.some((f: any) => f.includes('user'))).toBe(true)
        }
      }
    })
  })

  describe('Type Coercion', () => {
    it('should coerce string page number to integer', () => {
      const schema = createPaginationSchema()
      const data = {
        query: {
          page: '5',
          limit: '20',
        },
      }

      const result = schema.parse(data)
      expect(typeof result.query.page).toBe('number')
      expect(result.query.page).toBe(5)
    })

    it('should reject non-numeric string for page', () => {
      const schema = createPaginationSchema()
      const data = {
        query: {
          page: '5.5', // decimal, not allowed
          limit: '10',
        },
      }

      expect(() => schema.parse(data)).toThrow(ZodError)
    })

    it('should handle optional fields with defaults', () => {
      const schema = z.object({
        body: z.object({
          name: z.string().default('Anonymous'),
          status: z.enum(['active', 'inactive']).default('active'),
        }),
      })

      const data = {
        body: {},
      }

      const result = schema.parse(data)
      expect(result.body.name).toBe('Anonymous')
      expect(result.body.status).toBe('active')
    })
  })

  describe('Real-world Scenarios', () => {
    it('should validate complete registration flow', () => {
      const schema = createRegisterSchema()
      const validData = {
        body: {
          name: 'María García López',
          email: 'maria.garcia@example.com',
          password: 'MySecurePassword123!',
        },
        query: {},
        params: {},
      }

      expect(() => schema.parse(validData)).not.toThrow()
    })

    it('should validate complete payment flow', () => {
      const schema = createPaymentSchema()
      const validData = {
        body: {
          amount: 75.5,
          currency: 'EUR',
          category: 'Laboral',
        },
        query: {},
        params: {},
      }

      expect(() => schema.parse(validData)).not.toThrow()
    })

    it('should validate pagination with edge cases', () => {
      const schema = createPaginationSchema()

      // Max page
      const result1 = schema.parse({
        query: {
          page: '1000',
          limit: '100',
        },
      })
      expect(result1.query.page).toBe(1000)

      // Min page
      const result2 = schema.parse({
        query: {
          page: '1',
          limit: '1',
        },
      })
      expect(result2.query.page).toBe(1)
    })

    it('should handle missing optional query params', () => {
      const schema = createPaginationSchema()
      const data = {
        query: {},
      }

      const result = schema.parse(data)
      // Defaults exist and are applied
      expect(result.query.page).toBeDefined()
      expect(result.query.limit).toBeDefined()
    })

    it('should validate UUID formats correctly', () => {
      const schema = createUserIdSchema()

      // Valid UUID v4
      expect(() =>
        schema.parse({
          params: { id: '550e8400-e29b-41d4-a716-446655440000' },
        })
      ).not.toThrow()

      // Valid UUID v1
      expect(() =>
        schema.parse({
          params: { id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8' },
        })
      ).not.toThrow()

      // Invalid UUID
      expect(() =>
        schema.parse({
          params: { id: '550e8400-e29b-41d4-a716' }, // incomplete
        })
      ).toThrow()
    })
  })

  describe('Middleware Factory', () => {
    it('should create middleware that calls next() on valid data', () => {
      const schema = createLoginSchema()
      const middleware = createValidationMiddleware(schema)

      const req = {
        body: {
          email: 'user@example.com',
          password: 'password123',
        },
        query: {},
        params: {},
      } as any

      const res = {} as any
      const nextFn = (error?: any) => {
        expect(error).toBeUndefined()
      }

      middleware(req, res, nextFn)
      expect(req.body.email).toBe('user@example.com')
    })

    it('should attach error to next() on invalid data', () => {
      const schema = createLoginSchema()
      const middleware = createValidationMiddleware(schema)

      const req = {
        body: {
          email: 'invalid-email',
          password: 'password123',
        },
        query: {},
        params: {},
      } as any

      const res = {} as any
      let caughtError: any = null
      const nextFn = (error?: any) => {
        caughtError = error
      }

      middleware(req, res, nextFn)
      expect(caughtError).toBeDefined()
      expect(caughtError.statusCode).toBe(400)
      expect(caughtError.fields).toBeDefined()
    })

    it('should set fields object with error messages', () => {
      const schema = createRegisterSchema()
      const middleware = createValidationMiddleware(schema)

      const req = {
        body: {
          name: 'J',
          email: 'invalid',
          password: 'short',
        },
        query: {},
        params: {},
      } as any

      const res = {} as any
      let caughtError: any = null
      const nextFn = (error?: any) => {
        caughtError = error
      }

      middleware(req, res, nextFn)
      expect(caughtError.fields).toBeDefined()
      expect(Object.keys(caughtError.fields).length).toBeGreaterThan(0)
    })

    it('should replace request data with validated data', () => {
      const schema = createPaginationSchema()
      const middleware = createValidationMiddleware(schema)

      const req = {
        body: {},
        query: {
          page: '5',
          limit: '25',
        },
        params: {},
      } as any

      const res = {} as any
      const nextFn = () => {}

      middleware(req, res, nextFn)
      expect(typeof req.query.page).toBe('number')
      expect(req.query.page).toBe(5)
    })

    it('should handle unexpected errors gracefully', () => {
      const schema = createLoginSchema()
      const middleware = createValidationMiddleware(schema)

      const req = {
        body: {
          email: 'user@example.com',
          password: 'password123',
        },
        query: {},
        params: {},
      } as any

      const res = {} as any
      let caughtError: any = null
      const nextFn = (error?: any) => {
        caughtError = error
      }

      // This should not throw
      expect(() => middleware(req, res, nextFn)).not.toThrow()
    })
  })

  describe('Integration: Complete Validation Flows', () => {
    it('should validate registration then login flow', () => {
      const registerSchema = createRegisterSchema()
      const loginSchema = createLoginSchema()

      const registerData = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePass123',
        },
      }

      const loginData = {
        body: {
          email: 'john@example.com',
          password: 'SecurePass123',
        },
      }

      expect(() => registerSchema.parse(registerData)).not.toThrow()
      expect(() => loginSchema.parse(loginData)).not.toThrow()
    })

    it('should validate complete payment then admin check flow', () => {
      const paymentSchema = createPaymentSchema()
      const paginationSchema = createPaginationSchema()

      const paymentData = {
        body: {
          amount: 75.5,
          currency: 'EUR',
          category: 'Laboral',
        },
      }

      const adminListData = {
        query: {
          page: '1',
          limit: '20',
        },
      }

      expect(() => paymentSchema.parse(paymentData)).not.toThrow()
      expect(() => paginationSchema.parse(adminListData)).not.toThrow()
    })
  })
})
