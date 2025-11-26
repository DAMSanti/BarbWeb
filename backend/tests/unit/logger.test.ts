import { describe, it, expect, vi, beforeEach } from 'vitest'

// Hoisted mocks for fs and path so we can change behavior per-test
const mockFs_existsSync = vi.hoisted(() => vi.fn(() => true))
const mockFs_mkdirSync = vi.hoisted(() => vi.fn())
const mockFs = {
  existsSync: mockFs_existsSync,
  mkdirSync: mockFs_mkdirSync,
}

const mockPath_join = vi.hoisted(() => vi.fn((...args: any[]) => args.join('/')))
const mockPath = {
  join: mockPath_join,
}

// Mock winston
vi.mock('winston', () => ({
  default: {
    createLogger: vi.fn(() => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      http: vi.fn(),
    })),
    format: {
      combine: vi.fn(),
      timestamp: vi.fn(),
      colorize: vi.fn(),
      printf: vi.fn(),
      uncolorize: vi.fn(),
    },
    transports: {
      Console: vi.fn(),
      File: vi.fn(),
    },
    addColors: vi.fn(),
  },
}))

// Mock fs using hoisted mock
vi.mock('fs', () => ({
  default: mockFs,
}))

// Mock path using hoisted mock
vi.mock('path', () => ({
  default: mockPath,
}))

// Module variables populated via dynamic imports in beforeEach
let logger: any, logInfo: any, logError: any, logWarn: any, logDebug: any, logHttp: any

describe('Logger Module', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    // by default, pretend logs folder exists
    mockFs_existsSync.mockReturnValue(true)
    mockFs_mkdirSync.mockClear()

    const mod = await import('../../src/utils/logger')
    logger = mod.logger
    logInfo = mod.logInfo
    logError = mod.logError
    logWarn = mod.logWarn
    logDebug = mod.logDebug
    logHttp = mod.logHttp
  })

  describe('Logger object', () => {
    it('should be defined', () => {
      expect(logger).toBeDefined()
    })

    it('should have info method', () => {
      expect(typeof logger.info).toBe('function')
    })

    it('should have error method', () => {
      expect(typeof logger.error).toBe('function')
    })

    it('should have warn method', () => {
      expect(typeof logger.warn).toBe('function')
    })

    it('should have debug method', () => {
      expect(typeof logger.debug).toBe('function')
    })

    it('should have http method', () => {
      expect(typeof logger.http).toBe('function')
    })
  })

  describe('logInfo function', () => {
    it('should be defined', () => {
      expect(logInfo).toBeDefined()
    })

    it('should be a function', () => {
      expect(typeof logInfo).toBe('function')
    })

    it('should call logger.info with message', () => {
      logInfo('Test info message')
      expect(logger.info).toHaveBeenCalledWith('Test info message', undefined)
    })

    it('should call logger.info with message and metadata', () => {
      const meta = { userId: 123, action: 'login' }
      logInfo('User login', meta)
      expect(logger.info).toHaveBeenCalledWith('User login', meta)
    })

    it('should handle empty metadata', () => {
      logInfo('Empty meta test', {})
      expect(logger.info).toHaveBeenCalledWith('Empty meta test', {})
    })

    it('should handle complex metadata objects', () => {
      const meta = {
        nested: {
          data: {
            value: 'test',
          },
        },
        array: [1, 2, 3],
      }
      logInfo('Complex meta', meta)
      expect(logger.info).toHaveBeenCalledWith('Complex meta', meta)
    })

    it('should handle string-only calls', () => {
      logInfo('Simple string')
      expect(logger.info).toHaveBeenCalledTimes(1)
    })
  })

  describe('logError function', () => {
    it('should call logger.error with message', () => {
      logError('Test error message')
      expect(logger.error).toHaveBeenCalledWith('Test error message', {
        error: undefined,
        stack: undefined,
      })
    })

    it('should call logger.error with message and Error object', () => {
      const error = new Error('Something went wrong')
      logError('An error occurred', error)

      expect(logger.error).toHaveBeenCalledWith('An error occurred', {
        error: 'Something went wrong',
        stack: expect.stringContaining('Error: Something went wrong'),
      })
    })

    it('should extract error message from custom objects', () => {
      const customError = {
        message: 'Custom error',
        stack: 'custom stack trace',
      }
      logError('Error with custom object', customError)

      expect(logger.error).toHaveBeenCalledWith('Error with custom object', {
        error: 'Custom error',
        stack: 'custom stack trace',
      })
    })

    it('should handle null error gracefully', () => {
      logError('Error with null', null)
      expect(logger.error).toHaveBeenCalledWith('Error with null', {
        error: undefined,
        stack: undefined,
      })
    })

    it('should handle undefined error gracefully', () => {
      logError('Error with undefined')
      expect(logger.error).toHaveBeenCalledWith('Error with undefined', {
        error: undefined,
        stack: undefined,
      })
    })

    it('should preserve error stack trace', () => {
      const error = new Error('Stack trace test')
      const originalStack = error.stack
      logError('Stack preservation', error)

      const callArgs = (logger.error as any).mock.calls[0]
      expect(callArgs[1].stack).toBe(originalStack)
    })
  })

  describe('logWarn function', () => {
    it('should call logger.warn with message', () => {
      logWarn('Test warning message')
      expect(logger.warn).toHaveBeenCalledWith('Test warning message', undefined)
    })

    it('should call logger.warn with message and metadata', () => {
      const meta = { deprecated: true, version: '1.0' }
      logWarn('Deprecated feature', meta)
      expect(logger.warn).toHaveBeenCalledWith('Deprecated feature', meta)
    })

    it('should handle empty metadata', () => {
      logWarn('Warning', {})
      expect(logger.warn).toHaveBeenCalledWith('Warning', {})
    })

    it('should handle multiple warnings', () => {
      logWarn('First warning')
      logWarn('Second warning')
      logWarn('Third warning')
      expect(logger.warn).toHaveBeenCalledTimes(3)
    })
  })

  describe('logDebug function', () => {
    it('should call logger.debug with message', () => {
      logDebug('Debug message')
      expect(logger.debug).toHaveBeenCalledWith('Debug message', undefined)
    })

    it('should call logger.debug with message and metadata', () => {
      const meta = { requestId: 'req-123', duration: 150 }
      logDebug('Request processed', meta)
      expect(logger.debug).toHaveBeenCalledWith('Request processed', meta)
    })

    it('should handle performance data', () => {
      const perf = { startTime: 0, endTime: 100, duration: 100 }
      logDebug('Performance metrics', perf)
      expect(logger.debug).toHaveBeenCalledWith('Performance metrics', perf)
    })

    it('should log boolean values in metadata', () => {
      const meta = { success: true, cached: false }
      logDebug('Status', meta)
      expect(logger.debug).toHaveBeenCalledWith('Status', meta)
    })
  })

  describe('logHttp function', () => {
    it('should call logger.http with message', () => {
      logHttp('HTTP request')
      expect(logger.http).toHaveBeenCalledWith('HTTP request', undefined)
    })

    it('should call logger.http with message and metadata', () => {
      const meta = { method: 'GET', path: '/api/users', status: 200 }
      logHttp('GET /api/users', meta)
      expect(logger.http).toHaveBeenCalledWith('GET /api/users', meta)
    })

    it('should log HTTP request details', () => {
      const httpMeta = {
        method: 'POST',
        url: '/api/payments',
        statusCode: 201,
        responseTime: '45ms',
        userAgent: 'Mozilla/5.0',
      }
      logHttp('Payment request', httpMeta)
      expect(logger.http).toHaveBeenCalledWith('Payment request', httpMeta)
    })

    it('should handle error responses', () => {
      const meta = { method: 'DELETE', path: '/api/items/999', status: 404 }
      logHttp('DELETE /api/items/999', meta)
      expect(logger.http).toHaveBeenCalledWith('DELETE /api/items/999', meta)
    })

    it('should track multiple HTTP requests', () => {
      logHttp('GET /health')
      logHttp('POST /auth/login')
      logHttp('GET /user/profile')
      expect(logger.http).toHaveBeenCalledTimes(3)
    })
  })

  describe('Integration scenarios', () => {
    it('should log request flow', () => {
      logHttp('GET /api/users', { method: 'GET', status: 200 })
      logInfo('Users retrieved', { count: 5 })
      logDebug('Query details', { queryTime: 25 })

      expect(logger.http).toHaveBeenCalledTimes(1)
      expect(logger.info).toHaveBeenCalledTimes(1)
      expect(logger.debug).toHaveBeenCalledTimes(1)
    })

    it('should log error flow', () => {
      logHttp('POST /api/payments', { method: 'POST' })
      const error = new Error('Payment processing failed')
      logError('Transaction failed', error)
      logWarn('Retry attempt 1')

      expect(logger.http).toHaveBeenCalledTimes(1)
      expect(logger.error).toHaveBeenCalledTimes(1)
      expect(logger.warn).toHaveBeenCalledTimes(1)
    })

    it('should log authentication flow', () => {
      logDebug('Login attempt', { email: 'test@example.com' })
      logInfo('User authenticated', { userId: 123 })
      logHttp('POST /auth/login', { status: 200 })

      expect(logger.debug).toHaveBeenCalledTimes(1)
      expect(logger.info).toHaveBeenCalledTimes(1)
      expect(logger.http).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge cases', () => {
    it('should handle very long messages', () => {
      const longMessage = 'x'.repeat(10000)
      logInfo(longMessage)
      expect(logger.info).toHaveBeenCalledWith(longMessage, undefined)
    })

    it('should handle special characters in messages', () => {
      const specialMessage = 'Message with special chars: !@#$%^&*()_+-=[]{}|;:",<>?'
      logInfo(specialMessage)
      expect(logger.info).toHaveBeenCalledWith(specialMessage, undefined)
    })

    it('should handle unicode characters', () => {
      const unicodeMessage = 'Message con caracteres especiales: ñ, é, ü, 中文, 日本語'
      logInfo(unicodeMessage)
      expect(logger.info).toHaveBeenCalledWith(unicodeMessage, undefined)
    })

    it('should handle circular reference in metadata', () => {
      const meta: any = { key: 'value' }
      meta.circular = meta

      // Should not throw
      expect(() => {
        logInfo('Circular ref', meta)
      }).not.toThrow()
    })

    it('should handle empty string messages', () => {
      logInfo('')
      expect(logger.info).toHaveBeenCalledWith('', undefined)
    })

    it('should handle errors with no message property', () => {
      const badError = {}
      logError('Bad error', badError)
      expect(logger.error).toHaveBeenCalledWith('Bad error', {
        error: undefined,
        stack: undefined,
      })
    })

    it('should handle metadata with null values', () => {
      const meta = { a: null, b: undefined, c: 'value' }
      logInfo('Nullish values', meta)
      expect(logger.info).toHaveBeenCalledWith('Nullish values', meta)
    })

    it('should handle numeric messages', () => {
      logInfo('Error code: 500')
      expect(logger.info).toHaveBeenCalledTimes(1)
    })
  })

  describe('Module import behavior', () => {
    it('should create logs directory on import when missing', async () => {
      // Ensure a fresh module load
      vi.resetModules()
      // Simulate missing logs dir on first check
      mockFs.existsSync.mockReturnValueOnce(false)
      mockFs.mkdirSync.mockClear()

      // Dynamically import module (this will execute top-level code)
      await import('../../src/utils/logger')

      expect(mockFs.mkdirSync).toHaveBeenCalled()
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true })
    })
  })

  describe('Function return values', () => {
    it('logInfo should return undefined', () => {
      const result = logInfo('Test')
      expect(result).toBeUndefined()
    })

    it('logError should return undefined', () => {
      const result = logError('Error')
      expect(result).toBeUndefined()
    })

    it('logWarn should return undefined', () => {
      const result = logWarn('Warning')
      expect(result).toBeUndefined()
    })

    it('logDebug should return undefined', () => {
      const result = logDebug('Debug')
      expect(result).toBeUndefined()
    })

    it('logHttp should return undefined', () => {
      const result = logHttp('HTTP')
      expect(result).toBeUndefined()
    })
  })
})
