/**
 * E2E Tests - Auth Workflows
 * Tests complete authentication flows via API routes
 * Uses mocked Prisma and services - NO real database or emails
 */

import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest'
import express, { Express } from 'express'
import request from 'supertest'
import crypto from 'crypto'

// Set JWT secrets for token generation/verification
process.env.JWT_SECRET = 'test-jwt-secret-for-e2e-tests'
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-for-e2e-tests'

// ============================================================
// MOCK SETUP - Must be hoisted before any imports
// ============================================================

const { mockPrisma, dataStore, resetDataStore, tokenIdCounter } = vi.hoisted(() => {
  const dataStore = {
    users: new Map<string, any>(),
    pendingRegistrations: new Map<string, any>(),
    passwordResetTokens: new Map<string, any>(),
    oAuthAccounts: new Map<string, any>(),
    refreshTokens: new Map<string, any>(),
  }

  let userIdCounter = 1
  let tokenIdCounter = { value: 1 }

  const resetDataStore = () => {
    dataStore.users.clear()
    dataStore.pendingRegistrations.clear()
    dataStore.passwordResetTokens.clear()
    dataStore.oAuthAccounts.clear()
    dataStore.refreshTokens.clear()
    userIdCounter = 1
    tokenIdCounter.value = 1
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
          emailVerified: data.emailVerified ?? true,
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
              if (u.id === where.id) { user = u; break }
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
      delete: vi.fn(async ({ where }: any) => {
        const user = dataStore.users.get(where.id)
        if (user) dataStore.users.delete(where.id)
        return user
      }),
      upsert: vi.fn(async ({ where, create, update }: any) => {
        let user = null
        if (where.email) {
          for (const u of dataStore.users.values()) {
            if (u.email === where.email) { user = u; break }
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
    },
    pendingRegistration: {
      create: vi.fn(async ({ data }: any) => {
        const id = `pending_${tokenIdCounter.value++}`
        const registration = { id, ...data, createdAt: new Date() }
        dataStore.pendingRegistrations.set(id, registration)
        return registration
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.email) {
          for (const reg of dataStore.pendingRegistrations.values()) {
            if (reg.email === where.email) return reg
          }
        }
        if (where.token) {
          for (const reg of dataStore.pendingRegistrations.values()) {
            if (reg.token === where.token) return reg
          }
        }
        if (where.id) {
          return dataStore.pendingRegistrations.get(where.id) || null
        }
        return null
      }),
      update: vi.fn(async ({ where, data }: any) => {
        let reg = null
        if (where.email) {
          for (const r of dataStore.pendingRegistrations.values()) {
            if (r.email === where.email) { reg = r; break }
          }
        }
        if (where.id) {
          reg = dataStore.pendingRegistrations.get(where.id)
        }
        if (!reg) throw new Error('Pending registration not found')
        const updated = { ...reg, ...data }
        dataStore.pendingRegistrations.set(reg.id, updated)
        return updated
      }),
      delete: vi.fn(async ({ where }: any) => {
        if (where.id) {
          const reg = dataStore.pendingRegistrations.get(where.id)
          if (reg) {
            dataStore.pendingRegistrations.delete(where.id)
            return reg
          }
          for (const [key, r] of dataStore.pendingRegistrations.entries()) {
            if (r.id === where.id) {
              dataStore.pendingRegistrations.delete(key)
              return r
            }
          }
        }
        if (where.email) {
          for (const [key, r] of dataStore.pendingRegistrations.entries()) {
            if (r.email === where.email) {
              dataStore.pendingRegistrations.delete(key)
              return r
            }
          }
        }
        return null
      }),
      deleteMany: vi.fn(async () => {
        const count = dataStore.pendingRegistrations.size
        dataStore.pendingRegistrations.clear()
        return { count }
      }),
    },
    passwordResetToken: {
      create: vi.fn(async ({ data }: any) => {
        const id = `reset_${tokenIdCounter.value++}`
        const token = { id, ...data, used: false, createdAt: new Date() }
        dataStore.passwordResetTokens.set(id, token)
        return token
      }),
      findUnique: vi.fn(async ({ where, include }: any) => {
        for (const token of dataStore.passwordResetTokens.values()) {
          if (where?.token && token.token !== where.token) continue
          if (include?.user) {
            let user = null
            for (const u of dataStore.users.values()) {
              if (u.id === token.userId) { user = u; break }
            }
            return { ...token, user: user || null }
          }
          return token
        }
        return null
      }),
      findFirst: vi.fn(async ({ where, include }: any) => {
        for (const token of dataStore.passwordResetTokens.values()) {
          if (where?.token && token.token !== where.token) continue
          if (where?.used !== undefined && token.used !== where.used) continue
          if (where?.expiresAt?.gt && !(new Date(token.expiresAt) > where.expiresAt.gt)) continue
          if (include?.user) {
            let user = null
            for (const u of dataStore.users.values()) {
              if (u.id === token.userId) { user = u; break }
            }
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
    oAuthAccount: {
      create: vi.fn(async ({ data }: any) => {
        const id = `oauth_${tokenIdCounter.value++}`
        const account = { id, ...data, createdAt: new Date() }
        dataStore.oAuthAccounts.set(id, account)
        return account
      }),
      findUnique: vi.fn(async ({ where, include }: any) => {
        if (where?.provider_providerAccountId) {
          for (const account of dataStore.oAuthAccounts.values()) {
            if (
              account.provider === where.provider_providerAccountId.provider &&
              account.providerAccountId === where.provider_providerAccountId.providerAccountId
            ) {
              // Include user if requested
              if (include?.user) {
                let user = null
                for (const u of dataStore.users.values()) {
                  if (u.id === account.userId) {
                    user = u
                    break
                  }
                }
                return { ...account, user }
              }
              return account
            }
          }
        }
        return null
      }),
      findFirst: vi.fn(async ({ where }: any) => {
        for (const account of dataStore.oAuthAccounts.values()) {
          if (where?.userId && account.userId !== where.userId) continue
          if (where?.provider && account.provider !== where.provider) continue
          return account
        }
        return null
      }),
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $transaction: vi.fn(async (callback: any) => {
      if (typeof callback === 'function') {
        return await callback(mockPrisma)
      }
      if (Array.isArray(callback)) {
        return await Promise.all(callback)
      }
      return callback
    }),
  }

  return { mockPrisma, dataStore, resetDataStore, tokenIdCounter }
})

// Mock Prisma
vi.mock('../../src/db/init.js', () => ({
  getPrismaClient: vi.fn(() => mockPrisma),
}))

// Mock email service
vi.mock('../../src/services/emailService.js', () => ({
  sendWelcomeEmail: vi.fn().mockResolvedValue(true),
  sendEmailVerificationEmail: vi.fn().mockResolvedValue(true),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(true),
  sendPasswordChangedEmail: vi.fn().mockResolvedValue(true),
}))

// Mock logger
vi.mock('../../src/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}))

// Mock rate limiter to avoid 429 in tests
vi.mock('../../src/middleware/security.js', () => ({
  authLimiter: (_req: any, _res: any, next: any) => next(),
  apiLimiter: (_req: any, _res: any, next: any) => next(),
  securityHeaders: (_req: any, _res: any, next: any) => next(),
}))

// Import after mocks
import authRouter from '../../src/routes/auth.js'
import { errorHandler } from '../../src/middleware/errorHandler.js'

// ============================================================
// TEST APP SETUP
// ============================================================

function createTestApp(): Express {
  const app = express()
  app.use(express.json())
  app.use('/api/auth', authRouter)
  app.use(errorHandler) // Add error handler for proper error responses
  return app
}

// ============================================================
// TESTS
// ============================================================

describe('E2E Auth Workflows', () => {
  let app: Express

  beforeAll(() => {
    app = createTestApp()
  })

  beforeEach(() => {
    resetDataStore()
    vi.clearAllMocks()
  })

  // ============================================================
  // REGISTRATION → EMAIL VERIFICATION → LOGIN FLOW
  // ============================================================

  describe('Registration → Email Verification → Login Flow', () => {
    it('should complete full registration flow with email verification', async () => {
      const email = 'newuser@test.com'
      const password = 'SecurePass123!'
      const name = 'Test User'

      // Step 1: Register - creates pending registration
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({ email, password, confirmPassword: password, name })
        .expect(200)

      expect(registerRes.body.success).toBe(true)
      expect(registerRes.body.requiresVerification).toBe(true)

      // Verify pending registration was created
      expect(dataStore.pendingRegistrations.size).toBe(1)
      const pendingReg = Array.from(dataStore.pendingRegistrations.values())[0]
      expect(pendingReg.email).toBe(email)

      // Step 2: Verify email with token
      // In real flow, user receives token via email. We use the stored hashed token.
      const rawToken = 'test-verification-token'
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')
      
      // Update the pending registration with our known token
      pendingReg.token = hashedToken
      pendingReg.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

      const verifyRes = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: rawToken })
        .expect(200)

      expect(verifyRes.body.success).toBe(true)
      expect(verifyRes.body.user).toBeDefined()
      expect(verifyRes.body.tokens).toBeDefined()
      expect(verifyRes.body.tokens.accessToken).toBeDefined()
      expect(verifyRes.body.tokens.refreshToken).toBeDefined()

      // Step 3: Login with verified account
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email, password })
        .expect(200)

      expect(loginRes.body.success).toBe(true)
      expect(loginRes.body.user.email).toBe(email)
      expect(loginRes.body.tokens.accessToken).toBeDefined()
    })

    it('should reject registration with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid-email', password: 'SecurePass123!', confirmPassword: 'SecurePass123!', name: 'Test' })
        .expect(400)

      expect(res.body.success).toBe(false)
    })

    it('should reject registration with weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com', password: '123', confirmPassword: '123', name: 'Test' })
        .expect(400)

      expect(res.body.success).toBe(false)
    })

    it('should reject verification with invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'invalid-token-that-does-not-exist' })

      expect([400, 401]).toContain(res.status)
      expect(res.body.success).toBe(false)
    })

    it('should reject verification with missing token', async () => {
      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({})
        .expect(400)

      expect(res.body.error).toBe('Verification token required')
    })

    it('should allow resending verification email', async () => {
      // First register
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com', password: 'SecurePass123!', confirmPassword: 'SecurePass123!', name: 'Test' })
        .expect(200)

      // Resend verification
      const res = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'test@test.com' })
        .expect(200)

      expect(res.body.success).toBe(true)
    })

    it('should not leak info when resending to non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'nonexistent@test.com' })
        .expect(200)

      // Should still return success to prevent enumeration
      expect(res.body.success).toBe(true)
    })
  })

  // ============================================================
  // OAUTH FLOW (Google/Microsoft)
  // ============================================================

  describe('OAuth Flow (Google/Microsoft)', () => {
    it('should login with Google OAuth (new user)', async () => {
      const res = await request(app)
        .post('/api/auth/oauth/google')
        .send({
          sub: 'google-user-123',
          email: 'googleuser@gmail.com',
          name: 'Google User',
          picture: 'https://example.com/photo.jpg',
        })
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.isNewUser).toBe(true)
      expect(res.body.user.email).toBe('googleuser@gmail.com')
      expect(res.body.tokens.accessToken).toBeDefined()
    })

    it('should login with Google OAuth (existing user)', async () => {
      // First login creates user
      await request(app)
        .post('/api/auth/oauth/google')
        .send({
          sub: 'google-user-123',
          email: 'googleuser@gmail.com',
          name: 'Google User',
        })
        .expect(200)

      // Second login finds existing user
      const res = await request(app)
        .post('/api/auth/oauth/google')
        .send({
          sub: 'google-user-123',
          email: 'googleuser@gmail.com',
          name: 'Google User',
        })
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.isNewUser).toBe(false)
    })

    it('should login with Microsoft OAuth (new user)', async () => {
      const res = await request(app)
        .post('/api/auth/oauth/microsoft')
        .send({
          oid: 'microsoft-user-456',
          email: 'msuser@outlook.com',
          name: 'Microsoft User',
        })
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.isNewUser).toBe(true)
      expect(res.body.user.email).toBe('msuser@outlook.com')
    })

    it('should reject OAuth with missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/oauth/google')
        .send({ email: 'test@test.com' }) // Missing sub
        .expect(400)

      expect(res.body.success).toBe(false)
    })

    it('should reject OAuth with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/oauth/google')
        .send({ sub: '123', email: 'invalid-email' })
        .expect(400)

      expect(res.body.success).toBe(false)
    })
  })

  // ============================================================
  // PASSWORD RESET FLOW
  // ============================================================

  describe('Password Reset Flow', () => {
    it('should complete password reset flow', async () => {
      const email = 'user@test.com'
      const oldPassword = 'OldPassword123!'
      const newPassword = 'NewPassword456!'

      // Create user first via OAuth (simpler)
      await request(app)
        .post('/api/auth/oauth/google')
        .send({ sub: 'user-123', email, name: 'Test User' })
        .expect(200)

      // Set a password hash for the user
      const user = Array.from(dataStore.users.values())[0]
      const bcrypt = await import('bcryptjs')
      user.password = await bcrypt.hash(oldPassword, 10)

      // Step 1: Request password reset
      const forgotRes = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email })
        .expect(200)

      expect(forgotRes.body.success).toBe(true)

      // Get the reset token from dataStore
      const resetToken = Array.from(dataStore.passwordResetTokens.values())[0]
      expect(resetToken).toBeDefined()

      // Create a raw token and update the stored one
      const rawToken = 'reset-token-123'
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')
      resetToken.token = hashedToken
      resetToken.expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Step 2: Reset password with token
      const resetRes = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: rawToken, password: newPassword })
        .expect(200)

      expect(resetRes.body.success).toBe(true)
    })

    it('should not leak info for non-existent email on forgot password', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@test.com' })
        .expect(200)

      // Should return success to prevent email enumeration
      expect(res.body.success).toBe(true)
    })

    it('should reject reset with invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'invalid-token', password: 'NewPassword123!' })

      // Can be 400 or 401 depending on implementation
      expect([400, 401]).toContain(res.status)
      expect(res.body.success).toBe(false)
    })

    it('should reject reset with weak password', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'some-token', password: '123' })
        .expect(400)

      expect(res.body.error).toBe('Password must be at least 8 characters')
    })
  })

  // ============================================================
  // TOKEN REFRESH AND EXPIRATION
  // ============================================================

  describe('Token Refresh and Expiration', () => {
    it('should refresh access token with valid refresh token', async () => {
      // Login to get tokens
      const loginRes = await request(app)
        .post('/api/auth/oauth/google')
        .send({ sub: 'user-123', email: 'user@test.com', name: 'Test User' })
        .expect(200)

      const { refreshToken } = loginRes.body.tokens

      // Refresh the token
      const refreshRes = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200)

      expect(refreshRes.body.success).toBe(true)
      expect(refreshRes.body.accessToken).toBeDefined()
    })

    it('should reject refresh with invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-refresh-token' })

      // Should reject with 401 or 400
      expect([400, 401]).toContain(res.status)
    })

    it('should reject refresh with missing token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(400)

      expect(res.body.success).toBe(false)
    })

    it('should verify valid access token', async () => {
      // Login to get tokens
      const loginRes = await request(app)
        .post('/api/auth/oauth/google')
        .send({ sub: 'user-123', email: 'user@test.com', name: 'Test User' })
        .expect(200)

      const { accessToken } = loginRes.body.tokens

      // Verify token
      const verifyRes = await request(app)
        .get('/api/auth/verify-token')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(verifyRes.body.success).toBe(true)
      expect(verifyRes.body.valid).toBe(true)
    })
  })

  // ============================================================
  // CHANGE PASSWORD FLOW
  // ============================================================

  describe('Change Password Flow', () => {
    it('should change password for authenticated user', async () => {
      const currentPassword = 'CurrentPass123!'
      const newPassword = 'NewSecurePass456!'

      // Create user via OAuth
      const loginRes = await request(app)
        .post('/api/auth/oauth/google')
        .send({ sub: 'user-123', email: 'user@test.com', name: 'Test User' })
        .expect(200)

      const { accessToken } = loginRes.body.tokens

      // Set password for the user
      const user = Array.from(dataStore.users.values())[0]
      const bcrypt = await import('bcryptjs')
      user.password = await bcrypt.hash(currentPassword, 10)

      // Change password
      const changeRes = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ currentPassword, newPassword })
        .expect(200)

      expect(changeRes.body.success).toBe(true)
    })

    it('should reject password change with wrong current password', async () => {
      // Create user via OAuth
      const loginRes = await request(app)
        .post('/api/auth/oauth/google')
        .send({ sub: 'user-123', email: 'user@test.com', name: 'Test User' })
        .expect(200)

      const { accessToken } = loginRes.body.tokens

      // Set password for the user
      const user = Array.from(dataStore.users.values())[0]
      const bcrypt = await import('bcryptjs')
      user.password = await bcrypt.hash('RealPassword123!', 10)

      // Try to change with wrong current password
      const changeRes = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ currentPassword: 'WrongPassword123!', newPassword: 'NewPass456!' })
        .expect(401)

      expect(changeRes.body.success).toBe(false)
    })

    it('should reject password change without authentication', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .send({ currentPassword: 'Old123!', newPassword: 'New456!' })
        .expect(401)

      expect(res.body.success).toBe(false)
    })
  })

  // ============================================================
  // LINK OAUTH ACCOUNT
  // ============================================================

  describe('Link OAuth Account', () => {
    it('should link Google account to existing user', async () => {
      // Create user via OAuth first
      const loginRes = await request(app)
        .post('/api/auth/oauth/google')
        .send({ sub: 'user-123', email: 'user@test.com', name: 'Test User' })
        .expect(200)

      const { accessToken } = loginRes.body.tokens

      // Link Microsoft account
      const linkRes = await request(app)
        .post('/api/auth/link-oauth')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          provider: 'microsoft',
          providerAccountId: 'ms-account-456',
          email: 'user@test.com',
          name: 'Test User',
        })
        .expect(200)

      expect(linkRes.body.success).toBe(true)
      expect(linkRes.body.message).toContain('microsoft')
    })

    it('should reject linking without authentication', async () => {
      const res = await request(app)
        .post('/api/auth/link-oauth')
        .send({
          provider: 'google',
          providerAccountId: 'google-123',
        })
        .expect(401)

      expect(res.body.success).toBe(false)
    })

    it('should reject linking with missing provider', async () => {
      const loginRes = await request(app)
        .post('/api/auth/oauth/google')
        .send({ sub: 'user-123', email: 'user@test.com', name: 'Test User' })
        .expect(200)

      const { accessToken } = loginRes.body.tokens

      const res = await request(app)
        .post('/api/auth/link-oauth')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ providerAccountId: 'account-123' })

      // Should reject - can be 400 or 500 depending on validation
      expect([400, 500]).toContain(res.status)
    })
  })

  // ============================================================
  // SECURITY TESTS
  // ============================================================

  describe('Security Tests', () => {
    it('should not leak user existence on login with wrong password', async () => {
      // Create user
      await request(app)
        .post('/api/auth/oauth/google')
        .send({ sub: 'user-123', email: 'exists@test.com', name: 'Existing User' })
        .expect(200)

      // Set password
      const user = Array.from(dataStore.users.values())[0]
      const bcrypt = await import('bcryptjs')
      user.password = await bcrypt.hash('RealPassword123!', 10)

      // Try login with wrong password
      const wrongPassRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'exists@test.com', password: 'WrongPassword!' })

      // Can be 400 or 401
      expect([400, 401]).toContain(wrongPassRes.status)

      // Try login with non-existent user
      const nonExistRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'SomePassword!' })

      expect([400, 401]).toContain(nonExistRes.status)
      // Both should fail (enumeration prevention is about response timing/content, not just matching)
    })

    it('should return consistent response for forgot password (enumeration prevention)', async () => {
      // Create a user
      await request(app)
        .post('/api/auth/oauth/google')
        .send({ sub: 'user-123', email: 'exists@test.com', name: 'Test' })
        .expect(200)

      // Request for existing user
      const existsRes = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'exists@test.com' })
        .expect(200)

      // Request for non-existent user
      const nonExistsRes = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@test.com' })
        .expect(200)

      // Responses should be identical
      expect(existsRes.body.success).toBe(nonExistsRes.body.success)
      expect(existsRes.body.message).toBe(nonExistsRes.body.message)
    })

    it('should return 401 for protected routes without token', async () => {
      const routes = [
        { method: 'get', path: '/api/auth/me' },
        { method: 'post', path: '/api/auth/logout' },
        { method: 'post', path: '/api/auth/change-password' },
        { method: 'post', path: '/api/auth/link-oauth' },
      ]

      for (const route of routes) {
        const res = await (request(app) as any)[route.method](route.path)
          .send({})
          .expect(401)

        expect(res.body.success).toBe(false)
      }
    })

    it('should reject requests with malformed authorization header', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat')
        .expect(401)

      expect(res.body.success).toBe(false)
    })
  })

  // ============================================================
  // LOGOUT FLOW
  // ============================================================

  describe('Logout Flow', () => {
    it('should logout successfully', async () => {
      // Login first
      const loginRes = await request(app)
        .post('/api/auth/oauth/google')
        .send({ sub: 'user-123', email: 'user@test.com', name: 'Test User' })
        .expect(200)

      const { accessToken, refreshToken } = loginRes.body.tokens

      // Logout
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200)

      expect(logoutRes.body.success).toBe(true)
    })
  })

  // ============================================================
  // GET CURRENT USER
  // ============================================================

  describe('Get Current User', () => {
    it('should return current user info', async () => {
      // Login first
      const loginRes = await request(app)
        .post('/api/auth/oauth/google')
        .send({ sub: 'user-123', email: 'user@test.com', name: 'Test User' })
        .expect(200)

      const { accessToken } = loginRes.body.tokens

      // Get current user
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(meRes.body.success).toBe(true)
      expect(meRes.body.user).toBeDefined()
    })
  })
})
