import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import { rateLimit, authRateLimit, apiRateLimit } from '../../src/middleware/rateLimit'
import { RateLimitError } from '../../src/utils/errors'

// Simple helper to clear the global state between tests
// Since rateLimit uses a global Map, we need to create new middleware instances
// or work around the global state

describe('Rate Limit Middleware', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let mockNext: NextFunction
  let nextError: Error | undefined
  let headerCalls: Array<[string, any]>

  beforeEach(() => {
    nextError = undefined
    headerCalls = []

    mockReq = {
      ip: '192.168.1.1',
    }

    mockRes = {
      setHeader: vi.fn((header: string, value: any) => {
        headerCalls.push([header, value])
      }),
    }

    mockNext = vi.fn((err?: Error) => {
      if (err) nextError = err
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('rateLimit function basics', () => {
    it('should create a middleware function', () => {
      const middleware = rateLimit()
      expect(typeof middleware).toBe('function')
    })

    it('should allow first request through', () => {
      mockReq.ip = 'basics-test-1'
      const middleware = rateLimit(60 * 1000, 100)
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(mockNext).toHaveBeenCalled()
      expect(nextError).toBeUndefined()
    })

    it('should set X-RateLimit-Limit header', () => {
      mockReq.ip = 'basics-test-2'
      const middleware = rateLimit(60 * 1000, 100)
      middleware(mockReq as Request, mockRes as Response, mockNext)

      const limitHeader = headerCalls.find(h => h[0] === 'X-RateLimit-Limit')
      expect(limitHeader?.[1]).toBe(100)
    })

    it('should set X-RateLimit-Remaining header', () => {
      mockReq.ip = 'basics-test-3'
      const middleware = rateLimit(60 * 1000, 100)
      middleware(mockReq as Request, mockRes as Response, mockNext)

      const remainingHeader = headerCalls.find(h => h[0] === 'X-RateLimit-Remaining')
      expect(remainingHeader?.[1]).toBe(99)
    })

    it('should set X-RateLimit-Reset header as ISO string', () => {
      mockReq.ip = 'basics-test-4'
      const middleware = rateLimit(60 * 1000, 100)
      middleware(mockReq as Request, mockRes as Response, mockNext)

      const resetHeader = headerCalls.find(h => h[0] === 'X-RateLimit-Reset')
      expect(typeof resetHeader?.[1]).toBe('string')
      expect(resetHeader?.[1]).toMatch(/\d{4}-\d{2}-\d{2}T/)
    })
  })

  describe('rateLimit blocking behavior', () => {
    it('should block requests exceeding limit', () => {
      const middleware = rateLimit(60 * 1000, 2)

      // Make 2 requests - should pass
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeUndefined()

      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeUndefined()

      // 3rd request - should fail
      mockNext.mockClear()
      nextError = undefined
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)
    })

    it('should throw RateLimitError with 429 status', () => {
      const middleware = rateLimit(60 * 1000, 1)

      middleware(mockReq as Request, mockRes as Response, mockNext)

      mockNext.mockClear()
      nextError = undefined
      middleware(mockReq as Request, mockRes as Response, mockNext)

      expect(nextError).toBeInstanceOf(RateLimitError)
      expect((nextError as any)?.statusCode).toBe(429)
    })
  })

  describe('IP tracking', () => {
    it('should track different IPs separately', () => {
      const middleware = rateLimit(60 * 1000, 1)

      // IP 1: first request passes
      mockReq.ip = 'iptrack-ip1'
      mockNext.mockClear()
      nextError = undefined
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeUndefined()

      // IP 1: second request fails
      mockNext.mockClear()
      nextError = undefined
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)

      // IP 2: first request passes (different IP)
      mockReq.ip = 'iptrack-ip2'
      mockNext.mockClear()
      nextError = undefined
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeUndefined()
    })
  })

  describe('authRateLimit preset', () => {
    it('should limit to 5 requests', () => {
      mockReq.ip = 'auth-unique-1'

      for (let i = 0; i < 5; i++) {
        mockNext.mockClear()
        nextError = undefined
        authRateLimit(mockReq as Request, mockRes as Response, mockNext)
        expect(nextError).toBeUndefined()
      }

      mockNext.mockClear()
      nextError = undefined
      authRateLimit(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)
    })
  })

  describe('apiRateLimit preset', () => {
    it('should limit to 100 requests', () => {
      mockReq.ip = 'api-unique-1'

      for (let i = 0; i < 100; i++) {
        mockNext.mockClear()
        nextError = undefined
        apiRateLimit(mockReq as Request, mockRes as Response, mockNext)
        expect(nextError).toBeUndefined()
      }

      mockNext.mockClear()
      nextError = undefined
      apiRateLimit(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)
    })
  })

  describe('Window reset', () => {
    it('should reset counter after window expires', async () => {
      const middleware = rateLimit(50, 1) // 50ms window
      mockReq.ip = 'reset-test-ip'

      // First request passes
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeUndefined()

      // Second request fails (limit exceeded)
      mockNext.mockClear()
      nextError = undefined
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 100))

      // Now request should pass again
      mockNext.mockClear()
      nextError = undefined
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeUndefined()
    })
  })

  describe('Edge cases', () => {
    it('should handle maxRequests of 0', () => {
      const middleware = rateLimit(60 * 1000, 0)
      mockReq.ip = 'zero-limit-ip'

      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)
    })

    it('should handle IPv6 addresses', () => {
      const middleware = rateLimit(60 * 1000, 1)
      mockReq.ip = '::1'

      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeUndefined()

      mockNext.mockClear()
      nextError = undefined
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)
    })
  })
})
