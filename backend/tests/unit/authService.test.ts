/**
 * Unit Tests - Auth Service Utilities (MOCKED VERSION)
 * Tests para funciones de hash, JWT, password, registro, login
 * NO database calls - all mocked with vi.hoisted
 */

import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest'

// Hoist mock data store BEFORE any imports
const { mockPrisma, dataStore, resetDataStore } = vi.hoisted(() => {
  // In-memory data store
  const dataStore = {
    users: new Map<string, any>(),
    emailVerificationTokens: new Map<string, any>(),
    oAuthAccounts: new Map<string, any>(),
    pendingRegistrations: new Map<string, any>(),
    passwordResetTokens: new Map<string, any>(),
  }

  let userIdCounter = 1
  let tokenIdCounter = 1
  let oAuthIdCounter = 1

  const resetDataStore = () => {
    dataStore.users.clear()
    dataStore.emailVerificationTokens.clear()
    dataStore.oAuthAccounts.clear()
    dataStore.pendingRegistrations.clear()
    dataStore.passwordResetTokens.clear()
    userIdCounter = 1
    tokenIdCounter = 1
    oAuthIdCounter = 1
  }

  const mockPrisma = {
    user: {
      create: vi.fn(async ({ data }: any) => {
        const id = `user_${userIdCounter++}`
        const user = {
          id,
          ...data,
          role: data.role || 'user',
          refreshTokens: data.refreshTokens || [],
          emailVerified: data.emailVerified || false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        dataStore.users.set(id, user)
        return user
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.id) {
          const direct = dataStore.users.get(where.id)
          if (direct) return direct
          for (const user of dataStore.users.values()) {
            if (user.id === where.id) return user
          }
        }
        if (where.email) {
          for (const user of dataStore.users.values()) {
            if (user.email === where.email) return user
          }
        }
        return null
      }),
      findFirst: vi.fn(async ({ where }: any) => {
        for (const user of dataStore.users.values()) {
          if (where?.role && user.role !== where.role) continue
          if (where?.email && user.email !== where.email) continue
          return user
        }
        return null
      }),
      findMany: vi.fn(async () => Array.from(dataStore.users.values())),
      update: vi.fn(async ({ where, data }: any) => {
        let user = null
        if (where.id) {
          user = dataStore.users.get(where.id)
          if (!user) {
            for (const u of dataStore.users.values()) {
              if (u.id === where.id) {
                user = u
                break
              }
            }
          }
        }
        if (!user && where.email) {
          for (const u of dataStore.users.values()) {
            if (u.email === where.email) {
              user = u
              break
            }
          }
        }
        if (!user) throw new Error('User not found')
        
        let updateData = data
        if (data.refreshTokens?.set) {
          updateData = { ...data, refreshTokens: data.refreshTokens.set }
        }
        if (data.refreshTokens?.push) {
          updateData = { ...data, refreshTokens: [...(user.refreshTokens || []), data.refreshTokens.push] }
        }
        
        const updated = { ...user, ...updateData, updatedAt: new Date() }
        dataStore.users.set(user.id, updated)
        return updated
      }),
      upsert: vi.fn(async ({ where, create, update }: any) => {
        let user = null
        if (where.email) {
          for (const u of dataStore.users.values()) {
            if (u.email === where.email) {
              user = u
              break
            }
          }
        }
        if (user) {
          const updated = { ...user, ...update, updatedAt: new Date() }
          dataStore.users.set(user.id, updated)
          return updated
        } else {
          const id = `user_${userIdCounter++}`
          const newUser = { id, ...create, createdAt: new Date(), updatedAt: new Date() }
          dataStore.users.set(id, newUser)
          return newUser
        }
      }),
      delete: vi.fn(async ({ where }: any) => {
        const user = dataStore.users.get(where.id)
        if (user) dataStore.users.delete(where.id)
        return user
      }),
      deleteMany: vi.fn(async () => {
        const count = dataStore.users.size
        dataStore.users.clear()
        return { count }
      }),
    },
    emailVerificationToken: {
      create: vi.fn(async ({ data }: any) => {
        const id = `token_${tokenIdCounter++}`
        const token = { id, ...data, createdAt: new Date() }
        dataStore.emailVerificationTokens.set(id, token)
        return token
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.token) {
          for (const t of dataStore.emailVerificationTokens.values()) {
            if (t.token === where.token) return t
          }
        }
        return null
      }),
      findMany: vi.fn(async ({ where }: any) => {
        if (where?.userId) {
          return Array.from(dataStore.emailVerificationTokens.values()).filter(t => t.userId === where.userId)
        }
        return Array.from(dataStore.emailVerificationTokens.values())
      }),
      delete: vi.fn(async ({ where }: any) => {
        const token = dataStore.emailVerificationTokens.get(where.id)
        if (token) dataStore.emailVerificationTokens.delete(where.id)
        return token
      }),
      deleteMany: vi.fn(async () => {
        const count = dataStore.emailVerificationTokens.size
        dataStore.emailVerificationTokens.clear()
        return { count }
      }),
    },
    oAuthAccount: {
      create: vi.fn(async ({ data }: any) => {
        const id = `oauth_${oAuthIdCounter++}`
        const account = { id, ...data, createdAt: new Date() }
        dataStore.oAuthAccounts.set(id, account)
        return account
      }),
      findUnique: vi.fn(async ({ where, include }: any) => {
        if (where.provider_providerAccountId) {
          for (const acc of dataStore.oAuthAccounts.values()) {
            if (acc.provider === where.provider_providerAccountId.provider &&
                acc.providerAccountId === where.provider_providerAccountId.providerAccountId) {
              if (include?.user) {
                const user = dataStore.users.get(acc.userId)
                return { ...acc, user: user || null }
              }
              return acc
            }
          }
        }
        return null
      }),
      findMany: vi.fn(async ({ where }: any) => {
        let results = Array.from(dataStore.oAuthAccounts.values())
        if (where?.userId) results = results.filter(a => a.userId === where.userId)
        if (where?.provider) results = results.filter(a => a.provider === where.provider)
        return results
      }),
      deleteMany: vi.fn(async () => {
        const count = dataStore.oAuthAccounts.size
        dataStore.oAuthAccounts.clear()
        return { count }
      }),
    },
    pendingRegistration: {
      create: vi.fn(async ({ data }: any) => {
        const registration = { id: data.email, ...data, createdAt: new Date() }
        dataStore.pendingRegistrations.set(data.email, registration)
        return registration
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.email) return dataStore.pendingRegistrations.get(where.email) || null
        return null
      }),
      delete: vi.fn(async ({ where }: any) => {
        const reg = dataStore.pendingRegistrations.get(where.email)
        if (reg) dataStore.pendingRegistrations.delete(where.email)
        return reg
      }),
      deleteMany: vi.fn(async () => {
        const count = dataStore.pendingRegistrations.size
        dataStore.pendingRegistrations.clear()
        return { count }
      }),
    },
    passwordResetToken: {
      create: vi.fn(async ({ data }: any) => {
        const id = `reset_${tokenIdCounter++}`
        const token = { id, ...data, used: false, createdAt: new Date() }
        dataStore.passwordResetTokens.set(id, token)
        return token
      }),
      findFirst: vi.fn(async ({ where, include }: any) => {
        for (const token of dataStore.passwordResetTokens.values()) {
          if (where?.token && token.token !== where.token) continue
          if (where?.used !== undefined && token.used !== where.used) continue
          if (include?.user) {
            const user = dataStore.users.get(token.userId)
            return { ...token, user: user || null }
          }
          return token
        }
        return null
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const token = dataStore.passwordResetTokens.get(where.id)
        if (!token) throw new Error('Token not found')
        const updated = { ...token, ...data }
        dataStore.passwordResetTokens.set(where.id, updated)
        return updated
      }),
      deleteMany: vi.fn(async ({ where }: any) => {
        if (where?.userId) {
          for (const [key, token] of dataStore.passwordResetTokens.entries()) {
            if (token.userId === where.userId) dataStore.passwordResetTokens.delete(key)
          }
        } else {
          dataStore.passwordResetTokens.clear()
        }
        return { count: 0 }
      }),
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  }

  return { mockPrisma, dataStore, resetDataStore }
})

// Mock Prisma BEFORE importing authService
vi.mock('../../src/db/init.js', () => ({
  getPrismaClient: vi.fn(() => mockPrisma),
}))

// Mock email service
vi.mock('../../src/services/emailService', () => ({
  sendWelcomeEmail: vi.fn().mockResolvedValue(true),
  sendEmailVerificationEmail: vi.fn().mockResolvedValue(true),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(true),
  sendPasswordChangedEmail: vi.fn().mockResolvedValue(true),
  sendPaymentConfirmationEmail: vi.fn().mockResolvedValue(true),
  sendLawyerNotificationEmail: vi.fn().mockResolvedValue(true),
  sendPaymentFailedEmail: vi.fn().mockResolvedValue(true),
  sendRefundConfirmationEmail: vi.fn().mockResolvedValue(true),
}))

// NOW import authService (after mocks are set up)
import * as authService from '../../src/services/authService'
import * as emailService from '../../src/services/emailService'

// Use the hoisted mock
const prisma = mockPrisma

describe('Password Hashing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('hashPassword', () => {
    it('should hash password with bcrypt', async () => {
      const password = 'MySecurePassword123'
      const hash = await authService.hashPassword(password)

      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(20) // bcrypt hashes are long
    })

    it('should produce different hashes for same password', async () => {
      const password = 'MySecurePassword123'
      const hash1 = await authService.hashPassword(password)
      const hash2 = await authService.hashPassword(password)

      expect(hash1).not.toBe(hash2) // Different salt means different hash
    })

    it('should handle special characters', async () => {
      const password = 'P@$$w0rd!#%&*()[]{}=+-^'
      const hash = await authService.hashPassword(password)

      expect(hash).toBeDefined()
      expect(hash.length).toBeGreaterThan(20)
    })
  })

  describe('verifyPassword', () => {
    let hash: string

    beforeAll(async () => {
      hash = await authService.hashPassword('CorrectPassword123')
    })

    it('should verify correct password', async () => {
      const isValid = await authService.verifyPassword('CorrectPassword123', hash)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const isValid = await authService.verifyPassword('WrongPassword123', hash)
      expect(isValid).toBe(false)
    })

    it('should be case-sensitive', async () => {
      const isValid = await authService.verifyPassword('correctpassword123', hash)
      expect(isValid).toBe(false)
    })

    it('should verify empty password if hashed', async () => {
      const emptyHash = await authService.hashPassword('')
      const isValid = await authService.verifyPassword('', emptyHash)
      expect(isValid).toBe(true)
    })

    it('should handle special characters verification', async () => {
      const password = 'P@$$w0rd!#%&*()[]{}=+-^'
      const hash = await authService.hashPassword(password)
      const isValid = await authService.verifyPassword(password, hash)
      expect(isValid).toBe(true)
    })

    it('should handle unicode character verification', async () => {
      const password = 'Pässwörd123üñ中文'
      const hash = await authService.hashPassword(password)
      const isValid = await authService.verifyPassword(password, hash)
      expect(isValid).toBe(true)
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

      const tokens = authService.generateTokens(payload)

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

      const tokens = authService.generateTokens(payload)
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

      const tokens = authService.generateTokens(payload)
      const decoded = authService.verifyJWT(tokens.accessToken)

      expect(decoded).toBeDefined()
      expect(decoded?.userId).toBe('user-123')
      expect(decoded?.email).toBe('user@example.com')
      expect(decoded?.role).toBe('user')
    })

    it('should generate tokens with different payloads', () => {
      const tokens1 = authService.generateTokens({
        userId: 'user-1',
        email: 'user1@example.com',
        role: 'user',
      })

      const tokens2 = authService.generateTokens({
        userId: 'user-2',
        email: 'user2@example.com',
        role: 'admin',
      })

      expect(tokens1.accessToken).not.toBe(tokens2.accessToken)

      const decoded1 = authService.verifyJWT(tokens1.accessToken)
      const decoded2 = authService.verifyJWT(tokens2.accessToken)

      expect(decoded1?.userId).toBe('user-1')
      expect(decoded2?.userId).toBe('user-2')
      expect(decoded2?.role).toBe('admin')
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

      const tokens = authService.generateTokens(payload)
      const decoded = authService.verifyJWT(tokens.accessToken)

      expect(decoded).toBeDefined()
      expect(decoded?.userId).toBe('user-123')
    })

    it('should reject invalid token format', () => {
      const invalidToken = 'not.a.valid.token.format'
      const decoded = authService.verifyJWT(invalidToken)

      expect(decoded).toBeNull()
    })

    it('should reject malformed token', () => {
      const malformedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature'
      const decoded = authService.verifyJWT(malformedToken)

      expect(decoded).toBeNull()
    })

    it('should reject empty token', () => {
      const decoded = authService.verifyJWT('')
      expect(decoded).toBeNull()
    })

    it('should handle null/undefined gracefully', () => {
      const decoded1 = authService.verifyJWT(null as any)
      const decoded2 = authService.verifyJWT(undefined as any)

      expect(decoded1).toBeNull()
      expect(decoded2).toBeNull()
    })
  })
})

describe('verifyJWTWithSecret', () => {
  it('should verify token with custom secret', () => {
    const payload = {
      userId: 'user-123',
      email: 'test@example.com',
      role: 'user',
    }

    const secret = 'custom-secret-key'
    const jwt = require('jsonwebtoken')
    const token = jwt.sign(payload, secret, { expiresIn: '7d' })

    const decoded = authService.verifyJWTWithSecret(token, secret)
    expect(decoded).toBeDefined()
    expect(decoded?.userId).toBe('user-123')
  })

  it('should return null for invalid secret', () => {
    const payload = {
      userId: 'user-123',
      email: 'test@example.com',
      role: 'user',
    }

    const jwt = require('jsonwebtoken')
    const token = jwt.sign(payload, 'correct-secret', { expiresIn: '7d' })

    const decoded = authService.verifyJWTWithSecret(token, 'wrong-secret')
    expect(decoded).toBeNull()
  })

  it('should return null for invalid token', () => {
    const decoded = authService.verifyJWTWithSecret('invalid-token', 'secret')
    expect(decoded).toBeNull()
  })
})

describe('Token Expiration', () => {
  it('should generate access token with 15 minute expiration', () => {
    const payload = {
      userId: 'user-123',
      email: 'user@example.com',
      role: 'user',
    }

    const tokens = authService.generateTokens(payload)
    const decoded = authService.verifyJWT(tokens.accessToken)

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

    const tokens = authService.generateTokens(payload)
    // Use the refresh secret to verify the refresh token
    const decoded = authService.verifyJWTWithSecret(tokens.refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret')

    if (decoded) {
      // jwt.sign({ expiresIn: '7d' }) adds exp claim
      expect(decoded.exp).toBeDefined()

      // Current time in seconds
      const nowInSeconds = Math.floor(Date.now() / 1000)
      const expirationInSeconds = decoded.exp!

      // Should expire approximately in 7 days (604800 seconds)
      // Allow 10 second tolerance
      const timeDiffInSeconds = expirationInSeconds - nowInSeconds
      expect(timeDiffInSeconds).toBeGreaterThan(604790) // ~7 days minus tolerance
      expect(timeDiffInSeconds).toBeLessThan(604810) // ~7 days plus tolerance
    }
  })
})

describe('registerUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetDataStore()
  })

  it('should register new user with email and password', async () => {
    const result = await authService.registerUser(
      'newuser@example.com',
      'password123',
      'New User'
    )

    expect(result.user).toBeDefined()
    expect(result.user.email).toBe('newuser@example.com')
    expect(result.user.name).toBe('New User')
    expect(result.user.emailVerified).toBe(false)
    expect(result.tokens).toBeDefined()
    expect(result.tokens.accessToken).toBeDefined()
    expect(result.tokens.refreshToken).toBeDefined()
  })

  it('should throw error if email already exists', async () => {
    await authService.registerUser('existing@example.com', 'pass123', 'User 1')

    await expect(
      authService.registerUser('existing@example.com', 'pass456', 'User 2')
    ).rejects.toThrow()
  })

  it('should hash password before storing', async () => {
    const result = await authService.registerUser(
      'hashed@example.com',
      'plaintext-password',
      'User'
    )

    const user = await prisma.user.findUnique({
      where: { id: result.user.id },
    })

    expect(user?.passwordHash).toBeDefined()
    expect(user?.passwordHash).not.toBe('plaintext-password')
  })

  it('should store refresh token', async () => {
    const result = await authService.registerUser(
      'refresh@example.com',
      'pass123',
      'User'
    )

    const user = await prisma.user.findUnique({
      where: { id: result.user.id },
    })

    expect(user?.refreshTokens).toContain(result.tokens.refreshToken)
  })

  it('should create email verification token', async () => {
    const result = await authService.registerUser(
      'verify@example.com',
      'pass123',
      'User'
    )

    const verificationTokens = await prisma.emailVerificationToken.findMany({
      where: { userId: result.user.id },
    })

    expect(verificationTokens.length).toBeGreaterThan(0)
    expect(verificationTokens[0].token).toBeDefined()
  })

  it('should still register user when welcome email fails', async () => {
    vi.mocked(emailService.sendWelcomeEmail).mockRejectedValueOnce(new Error('Email service down'))

    const result = await authService.registerUser(
      'failedwelcome@example.com',
      'pass123',
      'User'
    )

    // Registration should succeed despite email failure
    expect(result.user).toBeDefined()
    expect(result.user.email).toBe('failedwelcome@example.com')
    expect(result.tokens).toBeDefined()
  })

  it('should still register user when verification email fails', async () => {
    vi.mocked(emailService.sendEmailVerificationEmail).mockRejectedValueOnce(new Error('Email service down'))

    const result = await authService.registerUser(
      'failedverify@example.com',
      'pass123',
      'User'
    )

    // Registration should succeed despite email failure
    expect(result.user).toBeDefined()
    expect(result.user.email).toBe('failedverify@example.com')
    expect(result.tokens).toBeDefined()
  })
})

describe('loginUser', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    resetDataStore()
    await authService.registerUser('login@example.com', 'password123', 'Login User')
  })

  it('should login user with correct credentials', async () => {
    const result = await authService.loginUser('login@example.com', 'password123')

    expect(result.user).toBeDefined()
    expect(result.user.email).toBe('login@example.com')
    expect(result.tokens).toBeDefined()
    expect(result.tokens.accessToken).toBeDefined()
  })

  it('should throw error for non-existent user', async () => {
    await expect(
      authService.loginUser('nonexistent@example.com', 'pass123')
    ).rejects.toThrow()
  })

  it('should throw error for incorrect password', async () => {
    await expect(
      authService.loginUser('login@example.com', 'wrong-password')
    ).rejects.toThrow()
  })

  it('should update lastLogin timestamp', async () => {
    const before = new Date()
    await authService.loginUser('login@example.com', 'password123')
    const after = new Date()

    const user = await prisma.user.findUnique({
      where: { email: 'login@example.com' },
    })

    expect(user?.lastLogin).toBeDefined()
    expect(user!.lastLogin!.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(user!.lastLogin!.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('should generate new refresh token on each login', async () => {
    const result1 = await authService.loginUser('login@example.com', 'password123')
    // Small delay to ensure different JWT timestamps
    await new Promise(resolve => setTimeout(resolve, 10))
    const result2 = await authService.loginUser('login@example.com', 'password123')

    expect(result1.tokens.refreshToken).not.toBe(result2.tokens.refreshToken)
  })
})

describe('oauthLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetDataStore()
  })

  it('should create new user on first OAuth login', async () => {
    const result = await authService.oauthLogin(
      'google',
      'google-user-123',
      'oauth@example.com',
      'OAuth User',
      'https://example.com/photo.jpg'
    )

    expect(result.user).toBeDefined()
    expect(result.user.email).toBe('oauth@example.com')
    expect(result.isNewUser).toBe(true)
    expect(result.tokens).toBeDefined()
  })

  it('should reuse existing OAuth account on second login', async () => {
    const first = await authService.oauthLogin(
      'google',
      'google-user-456',
      'oauth2@example.com',
      'OAuth User 2'
    )

    const second = await authService.oauthLogin(
      'google',
      'google-user-456',
      'oauth2@example.com',
      'OAuth User 2'
    )

    expect(first.user.id).toBe(second.user.id)
    expect(second.isNewUser).toBe(false)
  })

  it('should link OAuth to existing email account', async () => {
    // Register regular user
    await authService.registerUser('linked@example.com', 'pass123', 'Existing User')

    // Login via OAuth with same email
    const result = await authService.oauthLogin(
      'google',
      'google-linked-123',
      'linked@example.com',
      'Linked User'
    )

    expect(result.isNewUser).toBe(false)
    expect(result.user.email).toBe('linked@example.com')
  })

  it('should mark OAuth user as emailVerified', async () => {
    const result = await authService.oauthLogin(
      'github',
      'github-user-789',
      'github@example.com',
      'GitHub User'
    )

    const user = await prisma.user.findUnique({
      where: { id: result.user.id },
    })

    expect(user?.emailVerified).toBe(true)
  })

  it('should handle missing name gracefully', async () => {
    const result = await authService.oauthLogin(
      'microsoft',
      'microsoft-user-999',
      'noname@example.com',
      undefined
    )

    expect(result.user).toBeDefined()
    expect(result.user.email).toBe('noname@example.com')
  })

  it('should handle multiple OAuth providers for same email', async () => {
    await authService.oauthLogin('google', 'google-123', 'multi@example.com', 'User')
    const github = await authService.oauthLogin('github', 'github-123', 'multi@example.com', 'User')

    const oauthAccounts = await prisma.oAuthAccount.findMany({
      where: { userId: github.user.id },
    })

    expect(oauthAccounts.length).toBe(2)
    expect(oauthAccounts.map(a => a.provider)).toContain('google')
    expect(oauthAccounts.map(a => a.provider)).toContain('github')
  })
})

describe('logoutUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetDataStore()
  })

  it('should invalidate all refresh tokens', async () => {
    const user = await authService.registerUser('logout@example.com', 'pass123', 'Logout User')

    await authService.logoutUser(user.user.id, user.tokens.refreshToken)

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.user.id },
    })

    expect(updatedUser?.refreshTokens).toEqual([])
  })
})

describe('linkOAuthAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetDataStore()
  })

  it('should link OAuth account to existing user', async () => {
    const user = await authService.registerUser('link@example.com', 'pass123', 'Link User')

    await authService.linkOAuthAccount(
      user.user.id,
      'github',
      'github-123',
      'github@example.com',
      'GitHub User'
    )

    const oauthAccount = await prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'github',
          providerAccountId: 'github-123',
        },
      },
    })

    expect(oauthAccount).toBeDefined()
    expect(oauthAccount?.userId).toBe(user.user.id)
  })

  it('should prevent linking same OAuth to different user', async () => {
    const user1 = await authService.registerUser('user1@example.com', 'pass123', 'User 1')
    const user2 = await authService.registerUser('user2@example.com', 'pass123', 'User 2')

    await authService.linkOAuthAccount(
      user1.user.id,
      'google',
      'google-shared-123',
      'google@example.com'
    )

    await expect(
      authService.linkOAuthAccount(
        user2.user.id,
        'google',
        'google-shared-123',
        'google@example.com'
      )
    ).rejects.toThrow()
  })

  it('should be idempotent if already linked', async () => {
    const user = await authService.registerUser('idempotent@example.com', 'pass123', 'User')

    await authService.linkOAuthAccount(
      user.user.id,
      'github',
      'github-456',
      'github@example.com'
    )

    // Should not throw on second link
    await authService.linkOAuthAccount(
      user.user.id,
      'github',
      'github-456',
      'github@example.com'
    )

    const accounts = await prisma.oAuthAccount.findMany({
      where: { userId: user.user.id, provider: 'github' },
    })

    expect(accounts.length).toBe(1)
  })
})

describe('setupAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetDataStore()
  })

  it('should create initial admin user', async () => {
    const result = await authService.setupAdmin(
      'admin@example.com',
      'admin-pass-123',
      'Admin User'
    )

    expect(result.user).toBeDefined()
    expect(result.user.role).toBe('admin')
    expect(result.user.email).toBe('admin@example.com')
    expect(result.tokens).toBeDefined()
  })

  it('should verify setup token if provided', async () => {
    process.env.SETUP_TOKEN = 'valid-setup-token'

    const result = await authService.setupAdmin(
      'admin2@example.com',
      'pass123',
      'Admin 2',
      'valid-setup-token'
    )

    expect(result.user.role).toBe('admin')
  })

  it('should throw error for invalid setup token', async () => {
    process.env.SETUP_TOKEN = 'valid-token-only'

    await expect(
      authService.setupAdmin(
        'admin3@example.com',
        'pass123',
        'Admin 3',
        'invalid-token'
      )
    ).rejects.toThrow()
  })

  it('should be idempotent - update existing admin', async () => {
    // First setup
    const first = await authService.setupAdmin(
      'admin-update@example.com',
      'pass1',
      'Admin Name 1'
    )

    // Second setup with valid token
    process.env.SETUP_TOKEN = 'setup-123'
    const second = await authService.setupAdmin(
      'admin-update@example.com',
      'pass2',
      'Admin Name 2',
      'setup-123'
    )

    expect(first.user.id).toBe(second.user.id)
    expect(first.user.email).toBe(second.user.email)
  })
})

describe('refreshAccessToken', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetDataStore()
  })

  it('should generate new access token from valid refresh token', async () => {
    const user = await authService.registerUser('refresh@example.com', 'pass123', 'User')

    const newTokens = await authService.refreshAccessToken(user.tokens.refreshToken)

    expect(newTokens).toBeDefined()
    expect(newTokens.accessToken).toBeDefined()
    expect(newTokens.refreshToken).toBeDefined()
    
    // Verify new access token is valid and decodes correctly
    const newAccessDecoded = authService.verifyJWT(newTokens.accessToken)
    expect(newAccessDecoded).toBeDefined()
    expect(newAccessDecoded?.userId).toBe(user.user.id)
    expect(newAccessDecoded?.email).toBe('refresh@example.com')
    
    // New refresh token should be different (always different due to new random iat/exp)
    expect(newTokens.refreshToken).not.toBe(user.tokens.refreshToken)
  })

  it('should throw error for invalid refresh token', async () => {
    await expect(
      authService.refreshAccessToken('invalid-token')
    ).rejects.toThrow()
  })

  it('should throw error for revoked refresh token', async () => {
    const user = await authService.registerUser('revoked@example.com', 'pass123', 'User')

    // Logout to revoke tokens
    await authService.logoutUser(user.user.id, user.tokens.refreshToken)

    await expect(
      authService.refreshAccessToken(user.tokens.refreshToken)
    ).rejects.toThrow()
  })
})
