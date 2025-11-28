/**
 * E2E Workflow Tests - Authentication Flows
 * Complete user journeys: Registration → Email Verification → Login
 * OAuth flows, Password Reset, Token Refresh
 * Uses mocked services - NO real database or emails
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'

// Hoist mocks before imports
const {
  mockPrisma,
  mockAuthService,
  mockEmailService,
  mockOauthHelper,
} = vi.hoisted(() => {
  const mockAuthService = {
    createPendingRegistration: vi.fn(),
    completeRegistration: vi.fn(),
    loginUser: vi.fn(),
    oauthLogin: vi.fn(),
    refreshAccessToken: vi.fn(),
    logoutUser: vi.fn(),
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
    changePassword: vi.fn(),
    linkOAuthAccount: vi.fn(),
  }

  const mockEmailService = {
    sendWelcomeEmail: vi.fn().mockResolvedValue(true),
    sendEmailVerificationEmail: vi.fn().mockResolvedValue(true),
    sendPasswordResetEmail: vi.fn().mockResolvedValue(true),
    sendPasswordChangedEmail: vi.fn().mockResolvedValue(true),
  }

  const mockOauthHelper = {
    exchangeGoogleCode: vi.fn(),
    exchangeMicrosoftCode: vi.fn(),
  }

  return {
    mockPrisma: {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      pendingRegistration: {
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
      refreshToken: {
        create: vi.fn(),
        findUnique: vi.fn(),
        delete: vi.fn(),
      },
    },
    mockAuthService,
    mockEmailService,
    mockOauthHelper,
  }
})

// Set env vars
process.env.JWT_SECRET = 'test_jwt_secret_for_e2e_tests'
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_for_e2e_tests'
process.env.FRONTEND_URL = 'http://localhost:5173'

vi.mock('../../src/db/init', () => ({
  getPrismaClient: () => mockPrisma,
}))

vi.mock('../../src/services/authService', () => mockAuthService)

vi.mock('../../src/services/emailService', () => mockEmailService)

vi.mock('../../src/utils/oauthHelper', () => mockOauthHelper)

vi.mock('../../src/middleware/auth', () => ({
  verifyToken: vi.fn((req: any, _res: any, next: any) => {
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      req.user = { userId: 'user123', email: 'test@example.com', role: 'user' }
    }
    next()
  }),
  isAuthenticated: vi.fn((req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' })
    }
    next()
  }),
}))

vi.mock('../../src/middleware/security', () => ({
  authLimiter: (_req: any, _res: any, next: any) => next(),
}))

vi.mock('../../src/middleware/errorHandler', () => ({
  asyncHandler: (fn: any) => (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next),
}))

vi.mock('../../src/middleware/validation', () => ({
  validate: () => (_req: any, _res: any, next: any) => next(),
}))

import authRouter from '../../src/routes/auth'

describe('E2E Auth Workflows', () => {
  let app: express.Application

  beforeEach(() => {
    vi.clearAllMocks()

    app = express()
    app.use(express.json())
    app.use('/auth', authRouter)

    // Error handler
    app.use((err: any, _req: any, res: any, _next: any) => {
      res.status(err.statusCode || 400).json({ error: err.message })
    })
  })

  // ============================================
  // WORKFLOW 1: Registration → Email Verification → Login
  // ============================================
  describe('WORKFLOW: Registration → Email Verification → Login', () => {
    const testUser = {
      email: 'newuser@example.com',
      password: 'SecurePassword123!',
      name: 'John Doe',
    }

    it('should complete full registration flow', async () => {
      // Step 1: Register - Creates pending registration
      mockAuthService.createPendingRegistration.mockResolvedValueOnce({
        message: 'Se ha enviado un email de verificación',
      })

      const registerResponse = await request(app)
        .post('/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          confirmPassword: testUser.password,
          name: testUser.name,
        })

      expect(registerResponse.status).toBe(200)
      expect(registerResponse.body.success).toBe(true)
      expect(registerResponse.body.requiresVerification).toBe(true)
      expect(mockAuthService.createPendingRegistration).toHaveBeenCalledWith(
        testUser.email,
        testUser.password,
        testUser.name
      )

      // Step 2: Verify email with token
      const verificationToken = 'valid_verification_token_123'
      mockAuthService.completeRegistration.mockResolvedValueOnce({
        user: {
          id: 'user123',
          email: testUser.email,
          name: testUser.name,
          emailVerified: true,
          role: 'user',
        },
        tokens: {
          accessToken: 'access_token_after_verification',
          refreshToken: 'refresh_token_after_verification',
        },
      })

      const verifyResponse = await request(app)
        .post('/auth/verify-email')
        .send({ token: verificationToken })

      expect(verifyResponse.status).toBe(200)
      expect(verifyResponse.body.success).toBe(true)
      expect(verifyResponse.body.user.emailVerified).toBe(true)
      expect(verifyResponse.body.tokens.accessToken).toBeDefined()

      // Step 3: Login with verified account
      mockAuthService.loginUser.mockResolvedValueOnce({
        user: {
          id: 'user123',
          email: testUser.email,
          name: testUser.name,
          role: 'user',
        },
        tokens: {
          accessToken: 'access_token_login',
          refreshToken: 'refresh_token_login',
        },
      })

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })

      expect(loginResponse.status).toBe(200)
      expect(loginResponse.body.success).toBe(true)
      expect(loginResponse.body.user.email).toBe(testUser.email)
      expect(loginResponse.body.tokens.accessToken).toBeDefined()
    })

    it('should reject login for unverified email', async () => {
      mockAuthService.loginUser.mockRejectedValueOnce(
        new Error('Email no verificado. Por favor verifica tu email.')
      )

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })

      expect(loginResponse.status).toBe(400)
      expect(loginResponse.body.error).toContain('verificado')
    })

    it('should allow resending verification email', async () => {
      mockAuthService.resendVerificationEmail = vi.fn().mockResolvedValueOnce(undefined)

      const resendResponse = await request(app)
        .post('/auth/resend-verification')
        .send({ email: testUser.email })

      expect(resendResponse.status).toBe(200)
      expect(resendResponse.body.success).toBe(true)
    })
  })

  // ============================================
  // WORKFLOW 2: OAuth Login Flow (Google)
  // ============================================
  describe('WORKFLOW: Google OAuth Login', () => {
    it('should complete Google OAuth flow for new user', async () => {
      // Step 1: Exchange authorization code
      mockOauthHelper.exchangeGoogleCode.mockResolvedValueOnce({
        sub: 'google_user_id_123',
        email: 'googleuser@gmail.com',
        name: 'Google User',
        picture: 'https://example.com/photo.jpg',
      })

      // Step 2: Create/login user
      mockAuthService.oauthLogin.mockResolvedValueOnce({
        user: {
          id: 'user_google_123',
          email: 'googleuser@gmail.com',
          name: 'Google User',
          role: 'user',
        },
        tokens: {
          accessToken: 'google_access_token',
          refreshToken: 'google_refresh_token',
        },
        isNewUser: true,
      })

      // Simulate callback from Google
      const callbackResponse = await request(app)
        .get('/auth/google/callback?code=google_auth_code_123&state=random_state')

      expect(callbackResponse.status).toBe(302)
      expect(callbackResponse.headers.location).toContain('token=google_access_token')
      expect(callbackResponse.headers.location).toContain('refresh=google_refresh_token')
      expect(callbackResponse.headers.location).toContain('isNew=true')
    })

    it('should complete Google OAuth flow for existing user', async () => {
      mockOauthHelper.exchangeGoogleCode.mockResolvedValueOnce({
        sub: 'google_user_id_123',
        email: 'existing@gmail.com',
        name: 'Existing User',
        picture: 'https://example.com/photo.jpg',
      })

      mockAuthService.oauthLogin.mockResolvedValueOnce({
        user: {
          id: 'existing_user_id',
          email: 'existing@gmail.com',
          name: 'Existing User',
          role: 'user',
        },
        tokens: {
          accessToken: 'existing_user_token',
          refreshToken: 'existing_refresh_token',
        },
        isNewUser: false,
      })

      const callbackResponse = await request(app)
        .get('/auth/google/callback?code=google_auth_code')

      expect(callbackResponse.status).toBe(302)
      expect(callbackResponse.headers.location).not.toContain('isNew=true')
    })

    it('should handle Google OAuth errors gracefully', async () => {
      const errorResponse = await request(app)
        .get('/auth/google/callback?error=access_denied&error_description=User%20denied%20access')

      expect(errorResponse.status).toBe(400)
      expect(errorResponse.body.error).toContain('Google OAuth error')
    })

    it('should redirect to login page on OAuth failure', async () => {
      mockOauthHelper.exchangeGoogleCode.mockRejectedValueOnce(
        new Error('Invalid authorization code')
      )

      const callbackResponse = await request(app)
        .get('/auth/google/callback?code=invalid_code')

      expect(callbackResponse.status).toBe(302)
      expect(callbackResponse.headers.location).toContain('/login?error=')
    })
  })

  // ============================================
  // WORKFLOW 3: Microsoft OAuth Login Flow
  // ============================================
  describe('WORKFLOW: Microsoft OAuth Login', () => {
    it('should complete Microsoft OAuth flow', async () => {
      mockOauthHelper.exchangeMicrosoftCode.mockResolvedValueOnce({
        sub: 'microsoft_oid_123',
        email: 'msuser@outlook.com',
        name: 'Microsoft User',
        picture: 'https://example.com/ms_photo.jpg',
      })

      mockAuthService.oauthLogin.mockResolvedValueOnce({
        user: {
          id: 'user_ms_123',
          email: 'msuser@outlook.com',
          name: 'Microsoft User',
          role: 'user',
        },
        tokens: {
          accessToken: 'ms_access_token',
          refreshToken: 'ms_refresh_token',
        },
        isNewUser: true,
      })

      const callbackResponse = await request(app)
        .get('/auth/microsoft/callback?code=microsoft_auth_code_123')

      expect(callbackResponse.status).toBe(302)
      expect(callbackResponse.headers.location).toContain('token=ms_access_token')
    })

    it('should handle Microsoft OAuth errors', async () => {
      const errorResponse = await request(app)
        .get('/auth/microsoft/callback?error=access_denied')

      expect(errorResponse.status).toBe(400)
    })
  })

  // ============================================
  // WORKFLOW 4: Password Reset Flow
  // ============================================
  describe('WORKFLOW: Password Reset', () => {
    const userEmail = 'forgotpassword@example.com'

    it('should complete password reset flow', async () => {
      // Step 1: Request password reset
      mockAuthService.requestPasswordReset.mockResolvedValueOnce(undefined)

      const requestResponse = await request(app)
        .post('/auth/forgot-password')
        .send({ email: userEmail })

      expect(requestResponse.status).toBe(200)
      expect(requestResponse.body.success).toBe(true)
      expect(requestResponse.body.message).toContain('email')
      expect(mockAuthService.requestPasswordReset).toHaveBeenCalledWith(userEmail)

      // Step 2: Reset password with token
      const resetToken = 'valid_reset_token_xyz'
      const newPassword = 'NewSecurePassword456!'

      mockAuthService.resetPassword.mockResolvedValueOnce(undefined)

      const resetResponse = await request(app)
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          password: newPassword,
        })

      expect(resetResponse.status).toBe(200)
      expect(resetResponse.body.success).toBe(true)
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(resetToken, newPassword)

      // Step 3: Login with new password
      mockAuthService.loginUser.mockResolvedValueOnce({
        user: { id: 'user123', email: userEmail },
        tokens: { accessToken: 'new_token', refreshToken: 'new_refresh' },
      })

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: userEmail,
          password: newPassword,
        })

      expect(loginResponse.status).toBe(200)
      expect(loginResponse.body.success).toBe(true)
    })

    it('should return success even for non-existent email (security)', async () => {
      mockAuthService.requestPasswordReset.mockResolvedValueOnce(undefined)

      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })

      // Always return success to prevent email enumeration
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should reject invalid reset token', async () => {
      mockAuthService.resetPassword.mockRejectedValueOnce(
        new Error('Token inválido o expirado')
      )

      const response = await request(app)
        .post('/auth/reset-password')
        .send({
          token: 'invalid_token',
          password: 'NewPassword123!',
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('inválido')
    })

    it('should reject weak new password', async () => {
      const response = await request(app)
        .post('/auth/reset-password')
        .send({
          token: 'valid_token',
          password: 'weak',
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('8 characters')
    })
  })

  // ============================================
  // WORKFLOW 5: Token Refresh Flow
  // ============================================
  describe('WORKFLOW: Token Refresh and Expiration', () => {
    it('should refresh access token successfully', async () => {
      const refreshToken = 'valid_refresh_token_abc'

      mockAuthService.refreshAccessToken.mockResolvedValueOnce({
        accessToken: 'new_access_token_xyz',
      })

      const refreshResponse = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken })

      expect(refreshResponse.status).toBe(200)
      expect(refreshResponse.body.success).toBe(true)
      expect(refreshResponse.body.accessToken).toBe('new_access_token_xyz')
    })

    it('should reject expired refresh token', async () => {
      mockAuthService.refreshAccessToken.mockRejectedValueOnce(
        new Error('Refresh token expirado')
      )

      const refreshResponse = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'expired_refresh_token' })

      expect(refreshResponse.status).toBe(400)
      expect(refreshResponse.body.error).toContain('expirado')
    })

    it('should reject invalid refresh token', async () => {
      mockAuthService.refreshAccessToken.mockRejectedValueOnce(
        new Error('Refresh token inválido')
      )

      const refreshResponse = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid_token' })

      expect(refreshResponse.status).toBe(400)
    })

    it('should complete refresh → access protected route → logout flow', async () => {
      // Step 1: Refresh token
      mockAuthService.refreshAccessToken.mockResolvedValueOnce({
        accessToken: 'fresh_access_token',
      })

      const refreshResponse = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'valid_refresh' })

      expect(refreshResponse.status).toBe(200)
      const newAccessToken = refreshResponse.body.accessToken

      // Step 2: Access protected route with new token
      const meResponse = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${newAccessToken}`)

      expect(meResponse.status).toBe(200)
      expect(meResponse.body.success).toBe(true)

      // Step 3: Logout
      mockAuthService.logoutUser.mockResolvedValueOnce(undefined)

      const logoutResponse = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .send({ refreshToken: 'valid_refresh' })

      expect(logoutResponse.status).toBe(200)
      expect(logoutResponse.body.success).toBe(true)
    })
  })

  // ============================================
  // WORKFLOW 6: Change Password (Authenticated)
  // ============================================
  describe('WORKFLOW: Change Password', () => {
    it('should change password for authenticated user', async () => {
      mockAuthService.changePassword.mockResolvedValueOnce(undefined)

      const response = await request(app)
        .post('/auth/change-password')
        .set('Authorization', 'Bearer valid_token')
        .send({
          currentPassword: 'OldPassword123!',
          newPassword: 'NewPassword456!',
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(mockAuthService.changePassword).toHaveBeenCalledWith(
        'user123',
        'OldPassword123!',
        'NewPassword456!'
      )
    })

    it('should reject wrong current password', async () => {
      mockAuthService.changePassword.mockRejectedValueOnce(
        new Error('Contraseña actual incorrecta')
      )

      const response = await request(app)
        .post('/auth/change-password')
        .set('Authorization', 'Bearer valid_token')
        .send({
          currentPassword: 'WrongPassword!',
          newPassword: 'NewPassword456!',
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('incorrecta')
    })
  })

  // ============================================
  // WORKFLOW 7: Link OAuth Account
  // ============================================
  describe('WORKFLOW: Link OAuth Account', () => {
    it('should link Google account to existing user', async () => {
      mockAuthService.linkOAuthAccount.mockResolvedValueOnce(undefined)

      const response = await request(app)
        .post('/auth/link-oauth')
        .set('Authorization', 'Bearer valid_token')
        .send({
          provider: 'google',
          providerAccountId: 'google_sub_123',
          email: 'user@gmail.com',
          name: 'Google Name',
          picture: 'https://example.com/pic.jpg',
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should link Microsoft account to existing user', async () => {
      mockAuthService.linkOAuthAccount.mockResolvedValueOnce(undefined)

      const response = await request(app)
        .post('/auth/link-oauth')
        .set('Authorization', 'Bearer valid_token')
        .send({
          provider: 'microsoft',
          providerAccountId: 'microsoft_oid_123',
          email: 'user@outlook.com',
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should reject linking without authentication', async () => {
      const response = await request(app)
        .post('/auth/link-oauth')
        .send({
          provider: 'google',
          providerAccountId: 'sub_123',
        })

      expect(response.status).toBe(401)
    })
  })

  // ============================================
  // SECURITY TESTS
  // ============================================
  describe('Security: Rate Limiting and Abuse Prevention', () => {
    it('should handle rapid registration attempts', async () => {
      mockAuthService.createPendingRegistration
        .mockResolvedValueOnce({ message: 'Email sent' })
        .mockRejectedValueOnce(new Error('Rate limited'))

      // First attempt succeeds
      const first = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
          name: 'Test',
        })
      expect(first.status).toBe(200)

      // Second rapid attempt fails
      const second = await request(app)
        .post('/auth/register')
        .send({
          email: 'test2@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
          name: 'Test 2',
        })
      expect(second.status).toBe(400)
    })

    it('should not leak user existence on login failure', async () => {
      mockAuthService.loginUser.mockRejectedValueOnce(
        new Error('Credenciales inválidas') // Generic message
      )

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword',
        })

      expect(response.status).toBe(400)
      // Should be generic error, not "user not found"
      expect(response.body.error).not.toContain('not found')
      expect(response.body.error).not.toContain('no existe')
    })
  })
})
