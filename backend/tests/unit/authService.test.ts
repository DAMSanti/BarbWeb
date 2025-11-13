/**
 * Unit Tests - Auth Service Utilities
 * Tests para funciones de hash, JWT y password
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  hashPassword,
  verifyPassword,
  generateTokens,
  verifyJWT,
  verifyJWTWithSecret,
} from '../../src/services/authService'

describe('Password Hashing', () => {
  describe('hashPassword', () => {
    it('should hash password with bcrypt', async () => {
      const password = 'MySecurePassword123'
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(20) // bcrypt hashes are long
    })

    it('should produce different hashes for same password', async () => {
      const password = 'MySecurePassword123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2) // Different salt means different hash
    })

    it('should handle long passwords', async () => {
      const longPassword = 'A'.repeat(100) + 'Pass123'
      const hash = await hashPassword(longPassword)

      expect(hash).toBeDefined()
      expect(hash.length).toBeGreaterThan(20)
    })
  })

  describe('verifyPassword', () => {
    let hash: string

    beforeAll(async () => {
      hash = await hashPassword('CorrectPassword123')
    })

    it('should verify correct password', async () => {
      const isValid = await verifyPassword('CorrectPassword123', hash)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const isValid = await verifyPassword('WrongPassword123', hash)
      expect(isValid).toBe(false)
    })

    it('should be case-sensitive', async () => {
      const isValid = await verifyPassword('correctpassword123', hash)
      expect(isValid).toBe(false)
    })

    it('should reject empty password', async () => {
      const isValid = await verifyPassword('', hash)
      expect(isValid).toBe(false)
    })
  })
})

describe('JWT Token Generation', () => {
  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const payload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'user',
      }

      const tokens = generateTokens(payload)

      expect(tokens.accessToken).toBeDefined()
      expect(tokens.refreshToken).toBeDefined()
      expect(tokens.accessToken).not.toBe(tokens.refreshToken)
    })

    it('should generate valid JWT format (header.payload.signature)', () => {
      const payload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'user',
      }

      const tokens = generateTokens(payload)
      const parts = tokens.accessToken.split('.')

      expect(parts.length).toBe(3) // JWT has 3 parts
      expect(parts[0]).toBeDefined()
      expect(parts[1]).toBeDefined()
      expect(parts[2]).toBeDefined()
    })

    it('should include payload in token', () => {
      const payload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'user',
      }

      const tokens = generateTokens(payload)
      const decoded = verifyJWT(tokens.accessToken)

      expect(decoded).toBeDefined()
      expect(decoded?.userId).toBe('user-123')
      expect(decoded?.email).toBe('user@example.com')
      expect(decoded?.role).toBe('user')
    })
  })
})

describe('JWT Token Verification', () => {
  describe('verifyJWT', () => {
    it('should verify valid access token', () => {
      const payload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'user',
      }

      const tokens = generateTokens(payload)
      const decoded = verifyJWT(tokens.accessToken)

      expect(decoded).toBeDefined()
      expect(decoded?.userId).toBe('user-123')
    })

    it('should reject invalid token format', () => {
      const invalidToken = 'not.a.valid.token.format'
      const decoded = verifyJWT(invalidToken)

      expect(decoded).toBeNull()
    })

    it('should reject malformed token', () => {
      const malformedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature'
      const decoded = verifyJWT(malformedToken)

      expect(decoded).toBeNull()
    })

    it('should reject empty token', () => {
      const decoded = verifyJWT('')
      expect(decoded).toBeNull()
    })

    it('should handle null/undefined gracefully', () => {
      const decoded1 = verifyJWT('')
      const decoded2 = verifyJWT('null')

      expect(decoded1).toBeNull()
      expect(decoded2).toBeNull()
    })
  })
})

describe('Token Expiration', () => {
  it('should generate access token with 15 minute expiration', () => {
    const payload = {
      userId: 'user-123',
      email: 'user@example.com',
      role: 'user',
    }

    const tokens = generateTokens(payload)
    const decoded = verifyJWT(tokens.accessToken)

    // jwt.sign({ expiresIn: '15m' }) adds exp claim
    expect(decoded?.exp).toBeDefined()

    // Current time in seconds
    const nowInSeconds = Math.floor(Date.now() / 1000)
    const expirationInSeconds = decoded!.exp!

    // Should expire approximately in 15 minutes (900 seconds)
    // Allow 10 second tolerance for execution time
    const timeDiffInSeconds = expirationInSeconds - nowInSeconds
    expect(timeDiffInSeconds).toBeGreaterThan(890) // ~15 min minus tolerance
    expect(timeDiffInSeconds).toBeLessThan(910) // ~15 min plus tolerance
  })

  it('should generate refresh token with 7 day expiration', () => {
    const payload = {
      userId: 'user-123',
      email: 'user@example.com',
      role: 'user',
    }

    const tokens = generateTokens(payload)
    // Use the refresh secret to verify the refresh token
    const decoded = verifyJWTWithSecret(tokens.refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret')

    // jwt.sign({ expiresIn: '7d' }) adds exp claim
    expect(decoded?.exp).toBeDefined()

    // Current time in seconds
    const nowInSeconds = Math.floor(Date.now() / 1000)
    const expirationInSeconds = decoded!.exp!

    // Should expire approximately in 7 days (604800 seconds)
    // Allow 10 second tolerance
    const timeDiffInSeconds = expirationInSeconds - nowInSeconds
    expect(timeDiffInSeconds).toBeGreaterThan(604790) // ~7 days minus tolerance
    expect(timeDiffInSeconds).toBeLessThan(604810) // ~7 days plus tolerance
  })
})
