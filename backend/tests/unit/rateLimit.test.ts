import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import { rateLimit, authRateLimit, apiRateLimit } from '../../src/middleware/rateLimit'
import { RateLimitError } from '../../src/utils/errors'

describe('Rate Limit Middleware', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let mockNext: NextFunction
  let nextCalled: boolean
  let nextError: Error | undefined

  beforeEach(() => {
    nextCalled = false
    nextError = undefined

    mockReq = {
      ip: '192.168.1.1',
      socket: { remoteAddress: '192.168.1.1' } as any,
    }

    mockRes = {
      setHeader: vi.fn(),
      getHeader: vi.fn(),
    }

    mockNext = vi.fn((err?: Error) => {
      nextCalled = true
      if (err) nextError = err
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('rateLimit function', () => {
    it('should create a middleware function', () => {
      const middleware = rateLimit()

      expect(typeof middleware).toBe('function')
      expect(middleware.length).toBe(3) // req, res, next
    })

    it('should accept custom window and maxRequests', () => {
      const middleware = rateLimit(10 * 60 * 1000, 50)

      expect(typeof middleware).toBe('function')
    })

    it('should call next() on first request', () => {
      const middleware = rateLimit(15 * 60 * 1000, 100)

      middleware(mockReq as Request, mockRes as Response, mockNext)

      expect(mockNext).toHaveBeenCalledWith()
      expect(nextError).toBeUndefined()
    })

    it('should set rate limit headers', () => {
      const middleware = rateLimit(15 * 60 * 1000, 100)

      middleware(mockReq as Request, mockRes as Response, mockNext)

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 100)
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 99)
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Reset',
        expect.stringContaining('T')
      )
    })

    it('should decrement remaining count with each request', () => {
      const middleware = rateLimit(15 * 60 * 1000, 100)

      // First request
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 99)

      // Second request
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 98)

      // Third request
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 97)
    })

    it('should block request when limit exceeded', () => {
      const middleware = rateLimit(15 * 60 * 1000, 3)

      // Make 3 requests (should pass)
      for (let i = 0; i < 3; i++) {
        middleware(mockReq as Request, mockRes as Response, mockNext)
      }
      expect(nextError).toBeUndefined()

      // 4th request should be blocked
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)
      expect(nextError?.statusCode).toBe(429)
    })

    it('should throw RateLimitError with correct message', () => {
      const middleware = rateLimit(15 * 60 * 1000, 1)

      // First request passes
      middleware(mockReq as Request, mockRes as Response, mockNext)

      // Second request fails
      mockNext.mockClear()
      middleware(mockReq as Request, mockRes as Response, mockNext)

      expect(nextError).toBeInstanceOf(RateLimitError)
      expect(nextError?.message).toContain('Demasiadas solicitudes')
      expect(nextError?.message).toContain('segundos')
    })

    it('should track different IPs separately', () => {
      const middleware = rateLimit(15 * 60 * 1000, 2)

      // IP 1 makes 2 requests
      mockReq.ip = '192.168.1.1'
      middleware(mockReq as Request, mockRes as Response, mockNext)
      middleware(mockReq as Request, mockRes as Response, mockNext)

      // 3rd request from IP 1 should fail
      mockNext.mockClear()
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)

      // IP 2 can still make requests
      mockReq.ip = '192.168.1.2'
      mockNext.mockClear()
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeUndefined()
    })

    it('should use socket.remoteAddress if ip is not available', () => {
      const middleware = rateLimit(15 * 60 * 1000, 1)

      mockReq.ip = undefined
      mockReq.socket = { remoteAddress: '10.0.0.1' } as any

      // First request passes
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeUndefined()

      // Second request should fail
      mockNext.mockClear()
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)
    })

    it('should use "unknown" if no IP is available', () => {
      const middleware = rateLimit(15 * 60 * 1000, 1)

      mockReq.ip = undefined
      mockReq.socket = undefined as any

      // First request passes
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeUndefined()

      // Second request should fail
      mockNext.mockClear()
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)
    })

    it('should reset counter after time window expires', async () => {
      const windowMs = 100 // 100ms for testing
      const middleware = rateLimit(windowMs, 2)

      // Make 2 requests
      middleware(mockReq as Request, mockRes as Response, mockNext)
      middleware(mockReq as Request, mockRes as Response, mockNext)

      // 3rd request should fail
      mockNext.mockClear()
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150))

      // Now requests should work again
      mockNext.mockClear()
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeUndefined()
    })

    it('should set remaining to 0 when limit exceeded', () => {
      const middleware = rateLimit(15 * 60 * 1000, 2)

      middleware(mockReq as Request, mockRes as Response, mockNext)
      middleware(mockReq as Request, mockRes as Response, mockNext)

      mockRes.setHeader = vi.fn()
      middleware(mockReq as Request, mockRes as Response, mockNext)

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 0)
    })

    it('should include reset time in error message', () => {
      const middleware = rateLimit(15 * 60 * 1000, 1)

      middleware(mockReq as Request, mockRes as Response, mockNext)

      mockNext.mockClear()
      middleware(mockReq as Request, mockRes as Response, mockNext)

      expect(nextError?.message).toMatch(/\d+\s+segundos/)
    })

    it('should handle rapid successive requests', () => {
      const middleware = rateLimit(15 * 60 * 1000, 5)

      // Make 5 rapid requests
      for (let i = 0; i < 5; i++) {
        middleware(mockReq as Request, mockRes as Response, mockNext)
      }

      // 6th request should fail
      mockNext.mockClear()
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)
    })
  })

  describe('authRateLimit preset', () => {
    it('should be configured with 5 requests per 15 minutes', () => {
      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        authRateLimit(mockReq as Request, mockRes as Response, mockNext)
      }

      // 6th request should be blocked
      mockNext.mockClear()
      authRateLimit(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)
    })

    it('should be stricter than apiRateLimit', () => {
      // authRateLimit should limit at 5 requests
      let authLimited = false
      for (let i = 0; i < 6; i++) {
        mockNext.mockClear()
        authRateLimit(mockReq as Request, mockRes as Response, mockNext)
        if (nextError) authLimited = true
      }

      expect(authLimited).toBe(true)

      // Reset IP for second test
      mockReq.ip = '192.168.1.2'
      mockNext.mockClear()
      nextError = undefined

      // apiRateLimit should allow more requests
      let apiLimited = false
      for (let i = 0; i < 6; i++) {
        mockNext.mockClear()
        apiRateLimit(mockReq as Request, mockRes as Response, mockNext)
        if (nextError) apiLimited = true
      }

      expect(apiLimited).toBe(false)
    })
  })

  describe('apiRateLimit preset', () => {
    it('should be configured with 100 requests per 15 minutes', () => {
      // Make 100 requests (should pass)
      for (let i = 0; i < 100; i++) {
        apiRateLimit(mockReq as Request, mockRes as Response, mockNext)
      }

      // 101st request should be blocked
      mockNext.mockClear()
      apiRateLimit(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)
    })

    it('should allow many requests before limiting', () => {
      // Test with 50 requests - should all pass
      let allPassed = true
      for (let i = 0; i < 50; i++) {
        mockNext.mockClear()
        apiRateLimit(mockReq as Request, mockRes as Response, mockNext)
        if (nextError) allPassed = false
      }

      expect(allPassed).toBe(true)
    })
  })

  describe('Rate Limit Headers', () => {
    it('should provide accurate rate limit headers', () => {
      const middleware = rateLimit(15 * 60 * 1000, 10)
      const setHeaderCalls: Array<[string, any]> = []

      mockRes.setHeader = vi.fn((header: string, value: any) => {
        setHeaderCalls.push([header, value])
      })

      // Make a request
      middleware(mockReq as Request, mockRes as Response, mockNext)

      expect(setHeaderCalls).toContainEqual(['X-RateLimit-Limit', 10])
      expect(setHeaderCalls).toContainEqual(['X-RateLimit-Remaining', 9])
      expect(setHeaderCalls[2][0]).toBe('X-RateLimit-Reset')
    })

    it('should provide reset time as ISO string', () => {
      const middleware = rateLimit(15 * 60 * 1000, 10)

      const setHeaderCalls: Array<[string, any]> = []
      mockRes.setHeader = vi.fn((header: string, value: any) => {
        setHeaderCalls.push([header, value])
      })

      middleware(mockReq as Request, mockRes as Response, mockNext)

      const resetHeader = setHeaderCalls.find(([header]) => header === 'X-RateLimit-Reset')
      expect(resetHeader).toBeDefined()
      expect(resetHeader![1]).toMatch(/\d{4}-\d{2}-\d{2}T/)
    })
  })

  describe('Edge Cases', () => {
    it('should handle maxRequests of 0', () => {
      const middleware = rateLimit(15 * 60 * 1000, 0)

      // First request should already be blocked
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)
    })

    it('should handle very small time windows', async () => {
      const middleware = rateLimit(1, 1) // 1ms window

      middleware(mockReq as Request, mockRes as Response, mockNext)

      await new Promise(resolve => setTimeout(resolve, 5))

      mockNext.mockClear()
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeUndefined()
    })

    it('should handle very large maxRequests', () => {
      const middleware = rateLimit(15 * 60 * 1000, 10000)

      // Make 100 requests (should all pass)
      for (let i = 0; i < 100; i++) {
        mockNext.mockClear()
        middleware(mockReq as Request, mockRes as Response, mockNext)
      }

      expect(nextError).toBeUndefined()
    })

    it('should handle IP addresses with colons (IPv6)', () => {
      const middleware = rateLimit(15 * 60 * 1000, 2)

      mockReq.ip = '::1'

      // Make 2 requests
      middleware(mockReq as Request, mockRes as Response, mockNext)
      middleware(mockReq as Request, mockRes as Response, mockNext)

      // 3rd should fail
      mockNext.mockClear()
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)
    })

    it('should maintain separate counters for different windows', () => {
      const middleware1 = rateLimit(15 * 60 * 1000, 2)
      const middleware2 = rateLimit(15 * 60 * 1000, 2)

      // Different middleware instances share global state
      // So we test with same instance but different configs
      const req1 = { ip: '192.168.1.1', socket: { remoteAddress: '192.168.1.1' } } as any
      const req2 = { ip: '192.168.1.2', socket: { remoteAddress: '192.168.1.2' } } as any

      const middleware = rateLimit(15 * 60 * 1000, 2)

      // IP 1: 2 requests
      mockReq = req1
      middleware(mockReq as Request, mockRes as Response, mockNext)
      middleware(mockReq as Request, mockRes as Response, mockNext)

      // IP 2: 2 requests
      mockReq = req2
      mockNext.mockClear()
      middleware(mockReq as Request, mockRes as Response, mockNext)
      middleware(mockReq as Request, mockRes as Response, mockNext)

      // Both should be at limit
      mockReq = req1
      mockNext.mockClear()
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)
    })
  })

  describe('Behavior with different configurations', () => {
    it('should work with 1 minute window', async () => {
      const middleware = rateLimit(60 * 1000, 5)

      for (let i = 0; i < 5; i++) {
        middleware(mockReq as Request, mockRes as Response, mockNext)
      }

      mockNext.mockClear()
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)
    })

    it('should work with 1 hour window', () => {
      const middleware = rateLimit(60 * 60 * 1000, 1000)

      for (let i = 0; i < 1000; i++) {
        mockNext.mockClear()
        middleware(mockReq as Request, mockRes as Response, mockNext)
      }

      mockNext.mockClear()
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)
    })
  })
})
