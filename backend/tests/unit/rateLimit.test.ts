import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import { rateLimit, authRateLimit, apiRateLimit } from '../../src/middleware/rateLimit'
import { RateLimitError } from '../../src/utils/errors'

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
      socket: { remoteAddress: '192.168.1.1' } as any,
    }

    mockRes = {
      setHeader: vi.fn((header: string, value: any) => {
        headerCalls.push([header, value])
      }),
      getHeader: vi.fn(),
    }

    mockNext = vi.fn((err?: Error) => {
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
    })

    it('should call next() on first request', () => {
      const middleware = rateLimit(15 * 60 * 1000, 100)
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(mockNext).toHaveBeenCalled()
      expect(nextError).toBeUndefined()
    })

    it('should set rate limit headers', () => {
      const middleware = rateLimit(15 * 60 * 1000, 100)
      middleware(mockReq as Request, mockRes as Response, mockNext)

      expect(headerCalls.length).toBeGreaterThan(0)
      expect(headerCalls[0][0]).toBe('X-RateLimit-Limit')
      expect(headerCalls[0][1]).toBe(100)
      expect(headerCalls[1][0]).toBe('X-RateLimit-Remaining')
      expect(headerCalls[1][1]).toBe(99)
    })

    it('should decrement remaining count with each request', () => {
      const middleware = rateLimit(15 * 60 * 1000, 100)

      headerCalls = []
      middleware(mockReq as Request, mockRes as Response, mockNext)
      const first = headerCalls.find(h => h[0] === 'X-RateLimit-Remaining')
      expect(first?.[1]).toBe(99)

      headerCalls = []
      middleware(mockReq as Request, mockRes as Response, mockNext)
      const second = headerCalls.find(h => h[0] === 'X-RateLimit-Remaining')
      expect(second?.[1]).toBe(98)

      headerCalls = []
      middleware(mockReq as Request, mockRes as Response, mockNext)
      const third = headerCalls.find(h => h[0] === 'X-RateLimit-Remaining')
      expect(third?.[1]).toBe(97)
    })

    it('should block request when limit exceeded', () => {
      const middleware = rateLimit(15 * 60 * 1000, 3)

      for (let i = 0; i < 3; i++) {
        mockNext.mockClear()
        nextError = undefined
        middleware(mockReq as Request, mockRes as Response, mockNext)
        expect(nextError).toBeUndefined()
      }

      mockNext.mockClear()
      nextError = undefined
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)
    })

    it('should throw RateLimitError with correct message', () => {
      const middleware = rateLimit(15 * 60 * 1000, 1)
      middleware(mockReq as Request, mockRes as Response, mockNext)

      mockNext.mockClear()
      nextError = undefined
      middleware(mockReq as Request, mockRes as Response, mockNext)

      expect(nextError).toBeInstanceOf(RateLimitError)
      expect(nextError?.message).toContain('Demasiadas solicitudes')
    })

    it('should track different IPs separately', () => {
      const middleware = rateLimit(15 * 60 * 1000, 2)

      mockReq.ip = '192.168.1.1'
      middleware(mockReq as Request, mockRes as Response, mockNext)
      middleware(mockReq as Request, mockRes as Response, mockNext)

      mockNext.mockClear()
      nextError = undefined
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)

      mockReq.ip = '192.168.1.2'
      mockNext.mockClear()
      nextError = undefined
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeUndefined()
    })

    it('should use socket.remoteAddress if ip is not available', () => {
      const middleware = rateLimit(15 * 60 * 1000, 1)

      mockReq.ip = undefined
      mockReq.socket = { remoteAddress: '10.0.0.1' } as any

      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeUndefined()

      mockNext.mockClear()
      nextError = undefined
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)
    })

    it('should use "unknown" if no IP is available', () => {
      const middleware = rateLimit(15 * 60 * 1000, 1)

      mockReq.ip = undefined
      mockReq.socket = undefined as any

      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeUndefined()

      mockNext.mockClear()
      nextError = undefined
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)
    })

    it('should reset counter after time window expires', async () => {
      const windowMs = 100
      const middleware = rateLimit(windowMs, 2)

      middleware(mockReq as Request, mockRes as Response, mockNext)
      middleware(mockReq as Request, mockRes as Response, mockNext)

      mockNext.mockClear()
      nextError = undefined
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)

      await new Promise(resolve => setTimeout(resolve, 150))

      mockNext.mockClear()
      nextError = undefined
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeUndefined()
    })
  })

  describe('authRateLimit preset', () => {
    it('should be configured with 5 requests per 15 minutes', () => {
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
    it('should be configured with 100 requests per 15 minutes', () => {
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

    it('should allow many requests before limiting', () => {
      for (let i = 0; i < 50; i++) {
        mockNext.mockClear()
        nextError = undefined
        apiRateLimit(mockReq as Request, mockRes as Response, mockNext)
        expect(nextError).toBeUndefined()
      }
    })
  })

  describe('Rate Limit Headers', () => {
    it('should provide reset time as ISO string', () => {
      const middleware = rateLimit(15 * 60 * 1000, 10)

      headerCalls = []
      middleware(mockReq as Request, mockRes as Response, mockNext)

      const resetHeader = headerCalls.find(h => h[0] === 'X-RateLimit-Reset')
      expect(resetHeader).toBeDefined()
      expect(typeof resetHeader![1]).toBe('string')
      expect(resetHeader![1]).toMatch(/\d{4}-\d{2}-\d{2}T/)
    })
  })

  describe('Edge Cases', () => {
    it('should handle maxRequests of 0', () => {
      const middleware = rateLimit(15 * 60 * 1000, 0)
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)
    })

    it('should handle very small time windows', async () => {
      const middleware = rateLimit(1, 1)
      middleware(mockReq as Request, mockRes as Response, mockNext)

      await new Promise(resolve => setTimeout(resolve, 5))

      mockNext.mockClear()
      nextError = undefined
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeUndefined()
    })

    it('should handle IPv6 addresses', () => {
      const middleware = rateLimit(15 * 60 * 1000, 2)

      mockReq.ip = '::1'
      middleware(mockReq as Request, mockRes as Response, mockNext)
      middleware(mockReq as Request, mockRes as Response, mockNext)

      mockNext.mockClear()
      nextError = undefined
      middleware(mockReq as Request, mockRes as Response, mockNext)
      expect(nextError).toBeInstanceOf(RateLimitError)
    })
  })
})
