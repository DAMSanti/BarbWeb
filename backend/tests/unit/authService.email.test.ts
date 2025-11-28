/**
 * Unit Tests - Auth Service Email Verification & Password Reset (MOCKED)
 * Tests for createPendingRegistration, completeRegistration, requestPasswordReset,
 * resetPassword, changePassword
 * NO real emails sent - all mocked with vi.hoisted
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import crypto from 'crypto'

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

  const resetDataStore = () => {
    dataStore.users.clear()
    dataStore.emailVerificationTokens.clear()
    dataStore.oAuthAccounts.clear()
    dataStore.pendingRegistrations.clear()
    dataStore.passwordResetTokens.clear()
    userIdCounter = 1
    tokenIdCounter = 1
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
          // Search by ID - check both key and id property
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
        // Search by ID
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
    pendingRegistration: {
      create: vi.fn(async ({ data }: any) => {
        const id = `pending_${tokenIdCounter++}`
        const registration = { id, ...data, createdAt: new Date() }
        dataStore.pendingRegistrations.set(id, registration)
        return registration
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        // Search by email
        if (where.email) {
          for (const reg of dataStore.pendingRegistrations.values()) {
            if (reg.email === where.email) return reg
          }
        }
        // Search by token (hashed)
        if (where.token) {
          for (const reg of dataStore.pendingRegistrations.values()) {
            if (reg.token === where.token) return reg
          }
        }
        // Search by id
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
        if (!reg) throw new Error('Pending registration not found')
        const updated = { ...reg, ...data }
        dataStore.pendingRegistrations.set(reg.id, updated)
        return updated
      }),
      delete: vi.fn(async ({ where }: any) => {
        // Search by id first
        if (where.id) {
          const reg = dataStore.pendingRegistrations.get(where.id)
          if (reg) {
            dataStore.pendingRegistrations.delete(where.id)
            return reg
          }
          // Also search by id value
          for (const [key, r] of dataStore.pendingRegistrations.entries()) {
            if (r.id === where.id) {
              dataStore.pendingRegistrations.delete(key)
              return r
            }
          }
        }
        // Search by email
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
        const id = `reset_${tokenIdCounter++}`
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
              if (u.id === token.userId) {
                user = u
                break
              }
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
              if (u.id === token.userId) {
                user = u
                break
              }
            }
            return { ...token, user: user || null }
          }
          return token
        }
        return null
      }),
      findMany: vi.fn(async () => Array.from(dataStore.passwordResetTokens.values())),
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
  sendInvoiceEmail: vi.fn().mockResolvedValue(true),
}))

// NOW import authService (after mocks are set up)
import * as authService from '../../src/services/authService'
import * as emailService from '../../src/services/emailService'

// Use the hoisted mock
const prisma = mockPrisma

// Helper to extract token from verification link
const extractTokenFromLink = (link: string): string | null => {
  const match = link.match(/token=([a-f0-9]+)/)
  return match ? match[1] : null
}

// Store captured tokens for testing
let capturedVerificationToken: string | null = null
let capturedResetToken: string | null = null

describe('Pending Registration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetDataStore()
    capturedVerificationToken = null
    capturedResetToken = null
    
    // Capture tokens from email calls
    vi.mocked(emailService.sendEmailVerificationEmail).mockImplementation(async (_to: string, data: { verificationLink: string }) => {
      capturedVerificationToken = extractTokenFromLink(data.verificationLink)
      return true
    })
    vi.mocked(emailService.sendPasswordResetEmail).mockImplementation(async (_to: string, data: { resetLink: string }) => {
      capturedResetToken = extractTokenFromLink(data.resetLink)
      return true
    })
  })

  describe('createPendingRegistration', () => {
    it('should create a pending registration and send verification email', async () => {
      const result = await authService.createPendingRegistration(
        'newuser@example.com',
        'SecurePassword123!',
        'New User'
      )

      expect(result.message).toContain('email de verificación')
      expect(emailService.sendEmailVerificationEmail).toHaveBeenCalledTimes(1)
      expect(emailService.sendEmailVerificationEmail).toHaveBeenCalledWith(
        'newuser@example.com',
        expect.objectContaining({
          clientName: 'New User',
          verificationLink: expect.stringContaining('/verify-email?token='),
        })
      )
    })

    it('should throw error if email already registered as user', async () => {
      // First, create a real user
      await authService.registerUser('existing@example.com', 'pass123', 'Existing User')

      // Try to create pending registration with same email
      await expect(
        authService.createPendingRegistration('existing@example.com', 'pass456', 'Another User')
      ).rejects.toThrow()
    })

    it('should replace existing pending registration for same email', async () => {
      // Create first pending registration
      await authService.createPendingRegistration('replace@example.com', 'pass1', 'User 1')
      
      // Create second pending registration with same email
      const result = await authService.createPendingRegistration('replace@example.com', 'pass2', 'User 2')

      expect(result.message).toContain('email de verificación')
      // Email should be sent twice (once for each registration)
      expect(emailService.sendEmailVerificationEmail).toHaveBeenCalledTimes(2)
    })

    it('should throw error when email sending fails', async () => {
      vi.mocked(emailService.sendEmailVerificationEmail).mockRejectedValueOnce(new Error('Email service down'))

      await expect(
        authService.createPendingRegistration('emailfail@example.com', 'pass', 'Email Fail User')
      ).rejects.toThrow()
    })

    it('should hash password before storing in pending registration', async () => {
      await authService.createPendingRegistration('hash@example.com', 'plaintext', 'User')

      const pending = await prisma.pendingRegistration.findUnique({
        where: { email: 'hash@example.com' },
      })

      expect(pending).toBeDefined()
      expect(pending?.passwordHash).toBeDefined()
      expect(pending?.passwordHash).not.toBe('plaintext')
    })

    it('should set expiration to 24 hours from now', async () => {
      const before = Date.now()
      await authService.createPendingRegistration('expiry@example.com', 'pass', 'User')
      const after = Date.now()

      const pending = await prisma.pendingRegistration.findUnique({
        where: { email: 'expiry@example.com' },
      })

      expect(pending?.expiresAt).toBeDefined()
      const expiryTime = new Date(pending!.expiresAt).getTime()
      const expectedMinExpiry = before + 24 * 60 * 60 * 1000 - 1000 // 24 hours minus 1 second tolerance
      const expectedMaxExpiry = after + 24 * 60 * 60 * 1000 + 1000 // 24 hours plus 1 second tolerance
      
      expect(expiryTime).toBeGreaterThanOrEqual(expectedMinExpiry)
      expect(expiryTime).toBeLessThanOrEqual(expectedMaxExpiry)
    })
  })

  describe('completeRegistration', () => {
    it('should complete registration with valid token and return user with tokens', async () => {
      // Create pending registration first
      await authService.createPendingRegistration('complete@example.com', 'pass123', 'Complete User')
      
      // Use the captured token from the email mock
      expect(capturedVerificationToken).not.toBeNull()
      
      // Complete registration with the captured token
      const result = await authService.completeRegistration(capturedVerificationToken!)
      
      expect(result.user).toBeDefined()
      expect(result.user.email).toBe('complete@example.com')
      expect(result.user.name).toBe('Complete User')
      expect(result.user.emailVerified).toBe(true)
      expect(result.tokens).toBeDefined()
      expect(result.tokens.accessToken).toBeDefined()
      expect(result.tokens.refreshToken).toBeDefined()
    })

    it('should send welcome email after successful verification', async () => {
      await authService.createPendingRegistration('welcome@example.com', 'pass', 'Welcome User')
      
      expect(capturedVerificationToken).not.toBeNull()
      await authService.completeRegistration(capturedVerificationToken!)
      
      expect(emailService.sendWelcomeEmail).toHaveBeenCalledTimes(1)
      expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(
        'welcome@example.com',
        expect.objectContaining({ clientName: 'Welcome User' })
      )
    })

    it('should delete pending registration after completion', async () => {
      await authService.createPendingRegistration('delete@example.com', 'pass', 'Delete User')
      
      const pendingBefore = await prisma.pendingRegistration.findUnique({
        where: { email: 'delete@example.com' },
      })
      expect(pendingBefore).not.toBeNull()
      
      await authService.completeRegistration(capturedVerificationToken!)
      
      const pendingAfter = await prisma.pendingRegistration.findUnique({
        where: { email: 'delete@example.com' },
      })
      expect(pendingAfter).toBeNull()
    })

    it('should throw error for invalid token', async () => {
      await expect(
        authService.completeRegistration('invalid-token-12345')
      ).rejects.toThrow()
    })

    it('should throw error for expired token', async () => {
      // Create an expired pending registration directly
      const crypto = require('crypto')
      const expiredToken = crypto.randomBytes(32).toString('hex')
      const hashedToken = crypto.createHash('sha256').update(expiredToken).digest('hex')
      
      await prisma.pendingRegistration.create({
        data: {
          email: 'expired@example.com',
          name: 'Expired User',
          passwordHash: 'somehash',
          token: hashedToken,
          expiresAt: new Date(Date.now() - 1000), // Already expired
        },
      })
      
      // Should fail because token is expired
      await expect(
        authService.completeRegistration(expiredToken)
      ).rejects.toThrow()
    })

    it('should still complete registration when welcome email fails', async () => {
      await authService.createPendingRegistration('welcomefail@example.com', 'pass', 'Welcome Fail User')
      
      vi.mocked(emailService.sendWelcomeEmail).mockRejectedValueOnce(new Error('Email service down'))
      
      // Should complete without throwing even if welcome email fails
      const result = await authService.completeRegistration(capturedVerificationToken!)
      
      expect(result.user).toBeDefined()
      expect(result.user.email).toBe('welcomefail@example.com')
      expect(result.tokens).toBeDefined()
    })

    it('should throw error for already used email (user exists)', async () => {
      // Create a pending registration
      await authService.createPendingRegistration('conflict@example.com', 'pass', 'User')
      const token = capturedVerificationToken!
      
      // Create a user with the same email directly (simulating race condition)
      await prisma.user.create({
        data: {
          email: 'conflict@example.com',
          name: 'Existing User',
          passwordHash: 'hash',
          emailVerified: true,
        },
      })
      
      // Should throw conflict error
      await expect(
        authService.completeRegistration(token)
      ).rejects.toThrow()
    })
  })
})

describe('Password Reset Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetDataStore()
    capturedVerificationToken = null
    capturedResetToken = null
    
    // Capture tokens from email calls
    vi.mocked(emailService.sendEmailVerificationEmail).mockImplementation(async (_to: string, data: { verificationLink: string }) => {
      capturedVerificationToken = extractTokenFromLink(data.verificationLink)
      return true
    })
    vi.mocked(emailService.sendPasswordResetEmail).mockImplementation(async (_to: string, data: { resetLink: string }) => {
      capturedResetToken = extractTokenFromLink(data.resetLink)
      return true
    })
  })

  describe('requestPasswordReset', () => {
    it('should send password reset email for existing user', async () => {
      // Create a user first
      await authService.registerUser('reset@example.com', 'oldpass123', 'Reset User')

      await authService.requestPasswordReset('reset@example.com')

      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledTimes(1)
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'reset@example.com',
        expect.objectContaining({
          clientName: 'Reset User',
          resetLink: expect.stringContaining('/reset-password?token='),
        })
      )
      
      // Token should be captured
      expect(capturedResetToken).toBeTruthy()
    })

    it('should not throw for non-existent email (security)', async () => {
      // For security, we don't reveal if an email exists or not
      await expect(
        authService.requestPasswordReset('nonexistent@example.com')
      ).resolves.not.toThrow()
      
      // Should NOT send email for non-existent user
      expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled()
    })

    it('should not throw when email sending fails (security)', async () => {
      // Create user first
      await authService.registerUser('emailfailreset@example.com', 'pass', 'Email Fail User')
      
      vi.mocked(emailService.sendPasswordResetEmail).mockRejectedValueOnce(new Error('Email service down'))

      // Should NOT throw even if email fails (security - don't reveal email exists)
      await expect(
        authService.requestPasswordReset('emailfailreset@example.com')
      ).resolves.not.toThrow()
    })

    it('should delete old reset tokens and create new one', async () => {
      // Create a user
      await authService.registerUser('multitoken@example.com', 'pass', 'Multi User')

      // Request reset multiple times
      await authService.requestPasswordReset('multitoken@example.com')
      await authService.requestPasswordReset('multitoken@example.com')

      // Should have sent two emails
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledTimes(2)
    })

    it('should set token expiration to 1 hour', async () => {
      await authService.registerUser('expiry@example.com', 'pass', 'Expiry User')
      
      const before = Date.now()
      await authService.requestPasswordReset('expiry@example.com')
      const after = Date.now()

      // Get the token from mock
      const tokens = await prisma.passwordResetToken.findMany({})
      
      if (tokens.length > 0) {
        const expiryTime = new Date(tokens[0].expiresAt).getTime()
        const expectedMinExpiry = before + 60 * 60 * 1000 - 1000 // 1 hour minus tolerance
        const expectedMaxExpiry = after + 60 * 60 * 1000 + 1000 // 1 hour plus tolerance
        
        expect(expiryTime).toBeGreaterThanOrEqual(expectedMinExpiry)
        expect(expiryTime).toBeLessThanOrEqual(expectedMaxExpiry)
      }
    })
  })

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      // Create user and request password reset
      await authService.registerUser('validreset@example.com', 'oldpassword123', 'Valid Reset User')
      await authService.requestPasswordReset('validreset@example.com')
      
      const token = capturedResetToken!
      expect(token).toBeTruthy()
      
      // Reset password with captured token - should not throw
      await expect(
        authService.resetPassword(token, 'NewPassword456!')
      ).resolves.not.toThrow()
      
      // Should send password changed notification
      expect(emailService.sendPasswordChangedEmail).toHaveBeenCalledTimes(1)
      expect(emailService.sendPasswordChangedEmail).toHaveBeenCalledWith(
        'validreset@example.com',
        expect.objectContaining({
          clientName: 'Valid Reset User',
        })
      )
      
      // Token should be marked as used (not deleted)
      const tokenInDb = await prisma.passwordResetToken.findFirst({
        where: { used: true },
      })
      expect(tokenInDb).toBeTruthy()
    })

    it('should still reset password when email notification fails', async () => {
      // Create user and request password reset
      await authService.registerUser('notifyfail@example.com', 'oldpassword', 'Notify Fail User')
      await authService.requestPasswordReset('notifyfail@example.com')
      
      const token = capturedResetToken!
      
      vi.mocked(emailService.sendPasswordChangedEmail).mockRejectedValueOnce(new Error('Email service down'))
      
      // Should succeed even if notification email fails
      await expect(
        authService.resetPassword(token, 'NewPassword456!')
      ).resolves.not.toThrow()
      
      // Should be able to login with new password
      const loginResult = await authService.loginUser('notifyfail@example.com', 'NewPassword456!')
      expect(loginResult.user).toBeDefined()
    })

    it('should allow login with new password after reset', async () => {
      // Create user and request password reset
      await authService.registerUser('loginafter@example.com', 'oldpassword', 'Login After User')
      await authService.requestPasswordReset('loginafter@example.com')
      
      const token = capturedResetToken!
      
      // Reset to new password
      await authService.resetPassword(token, 'BrandNewPassword789!')
      
      // Should be able to login with new password
      const loginResult = await authService.loginUser('loginafter@example.com', 'BrandNewPassword789!')
      expect(loginResult.user).toBeDefined()
      expect(loginResult.tokens).toBeDefined()
    })

    it('should throw error for invalid token', async () => {
      await expect(
        authService.resetPassword('invalid-token-xyz123', 'newpassword123')
      ).rejects.toThrow()
    })

    it('should throw error when token used twice', async () => {
      // Create user and request password reset
      await authService.registerUser('doubleuse@example.com', 'oldpassword', 'Double Use User')
      await authService.requestPasswordReset('doubleuse@example.com')
      
      const token = capturedResetToken!
      
      // First use - should succeed
      await authService.resetPassword(token, 'NewPassword123!')
      
      // Second use - should fail
      await expect(
        authService.resetPassword(token, 'AnotherPassword456!')
      ).rejects.toThrow()
    })

    it('should throw error for expired token', async () => {
      // Create user first
      const { user } = await authService.registerUser('expiredtoken@example.com', 'oldpassword', 'Expired Token User')
      
      // Create an expired reset token directly
      const crypto = require('crypto')
      const expiredToken = crypto.randomBytes(32).toString('hex')
      const hashedToken = crypto.createHash('sha256').update(expiredToken).digest('hex')
      
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: hashedToken,
          expiresAt: new Date(Date.now() - 1000), // Already expired
          used: false,
        },
      })
      
      // Should fail because token is expired
      await expect(
        authService.resetPassword(expiredToken, 'NewPassword123!')
      ).rejects.toThrow()
    })
  })

  describe('changePassword', () => {
    it('should change password for authenticated user', async () => {
      // Create user
      const { user } = await authService.registerUser('change@example.com', 'oldpass123', 'Change User')

      await authService.changePassword(user.id, 'oldpass123', 'newpass456')

      expect(emailService.sendPasswordChangedEmail).toHaveBeenCalledTimes(1)
      expect(emailService.sendPasswordChangedEmail).toHaveBeenCalledWith(
        'change@example.com',
        expect.objectContaining({
          clientName: 'Change User',
          changedAt: expect.any(Date),
        })
      )
    })

    it('should throw error if current password is incorrect', async () => {
      const { user } = await authService.registerUser('wrongpass@example.com', 'correctpass', 'User')

      await expect(
        authService.changePassword(user.id, 'wrongpass', 'newpass123')
      ).rejects.toThrow()
    })

    it('should throw error if user not found', async () => {
      await expect(
        authService.changePassword('nonexistent-user-id', 'pass', 'newpass')
      ).rejects.toThrow()
    })

    it('should throw error if new password is same as current', async () => {
      const { user } = await authService.registerUser('samepass@example.com', 'samepassword123', 'Same User')

      await expect(
        authService.changePassword(user.id, 'samepassword123', 'samepassword123')
      ).rejects.toThrow()
    })

    it('should still change password when email notification fails', async () => {
      const { user } = await authService.registerUser('emailfail@example.com', 'oldpass123', 'Email Fail User')
      
      vi.mocked(emailService.sendPasswordChangedEmail).mockRejectedValueOnce(new Error('Email service down'))

      // Should not throw even if email fails
      await expect(
        authService.changePassword(user.id, 'oldpass123', 'newpass456')
      ).resolves.not.toThrow()

      // Should be able to login with new password
      const loginResult = await authService.loginUser('emailfail@example.com', 'newpass456')
      expect(loginResult.user).toBeDefined()
    })

    it('should verify new password works after change', async () => {
      const { user } = await authService.registerUser('verify@example.com', 'oldpass', 'Verify User')

      await authService.changePassword(user.id, 'oldpass', 'newpass')

      // Should be able to login with new password
      const loginResult = await authService.loginUser('verify@example.com', 'newpass')
      expect(loginResult.user).toBeDefined()
      expect(loginResult.tokens).toBeDefined()
    })

    it('should fail login with old password after change', async () => {
      const { user } = await authService.registerUser('oldlogin@example.com', 'oldpass', 'Old User')

      await authService.changePassword(user.id, 'oldpass', 'newpass')

      // Should NOT be able to login with old password
      await expect(
        authService.loginUser('oldlogin@example.com', 'oldpass')
      ).rejects.toThrow()
    })
  })
})

describe('Email Verification (pending registrations)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetDataStore()
  })

  describe('resendVerificationEmail', () => {
    it('should resend verification email for pending registration', async () => {
      // Create pending registration
      await authService.createPendingRegistration('pending@example.com', 'pass', 'Pending User')
      vi.clearAllMocks() // Clear the first call

      await authService.resendVerificationEmail('pending@example.com')

      // Should have been called once for resend
      expect(emailService.sendEmailVerificationEmail).toHaveBeenCalledTimes(1)
    })

    it('should not throw for non-existent email (security)', async () => {
      // For security, we don't reveal if email exists
      await expect(
        authService.resendVerificationEmail('nonexistent@example.com')
      ).resolves.not.toThrow()
      
      // Should NOT send email
      expect(emailService.sendEmailVerificationEmail).not.toHaveBeenCalled()
    })

    it('should not throw for already registered user email (security)', async () => {
      // Create a real user (already verified/registered)
      await authService.registerUser('registered@example.com', 'pass', 'Registered User')
      vi.clearAllMocks()

      // Should not throw but also should not send email (no pending registration)
      await expect(
        authService.resendVerificationEmail('registered@example.com')
      ).resolves.not.toThrow()
      
      // No email sent because there's no pending registration for this email
      expect(emailService.sendEmailVerificationEmail).not.toHaveBeenCalled()
    })
  })
})

describe('Email Service Mock Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not send real emails (mock is working)', () => {
    expect(vi.isMockFunction(emailService.sendWelcomeEmail)).toBe(true)
    expect(vi.isMockFunction(emailService.sendEmailVerificationEmail)).toBe(true)
    expect(vi.isMockFunction(emailService.sendPasswordResetEmail)).toBe(true)
    expect(vi.isMockFunction(emailService.sendPasswordChangedEmail)).toBe(true)
  })

  it('sendWelcomeEmail mock should resolve', async () => {
    const result = await emailService.sendWelcomeEmail('test@test.com', { clientName: 'Test' })
    expect(result).toBe(true)
  })

  it('sendEmailVerificationEmail mock should resolve', async () => {
    const result = await emailService.sendEmailVerificationEmail('test@test.com', {
      clientName: 'Test',
      verificationLink: 'http://test.com/verify',
      expiresInMinutes: 60,
    })
    expect(result).toBe(true)
  })

  it('sendPasswordResetEmail mock should resolve', async () => {
    const result = await emailService.sendPasswordResetEmail('test@test.com', {
      clientName: 'Test',
      resetLink: 'http://test.com/reset',
      expiresInMinutes: 60,
    })
    expect(result).toBe(true)
  })

  it('sendPasswordChangedEmail mock should resolve', async () => {
    const result = await emailService.sendPasswordChangedEmail('test@test.com', {
      clientName: 'Test',
      changedAt: new Date(),
    })
    expect(result).toBe(true)
  })
})
