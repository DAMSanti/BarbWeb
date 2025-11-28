/**
 * Unit Tests - Auth Routes
 * Tests para endpoints de autenticación, OAuth, y gestión de tokens
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import crypto from 'crypto'

// Hoist mocks
const {
  mockPrisma,
  mockAuthService,
  mockOauthHelper,
  mockVerifyToken,
  mockIsAuthenticated,
} = vi.hoisted(() => {
  const mockAuthService = {
    registerUser: vi.fn(),
    loginUser: vi.fn(),
    oauthLogin: vi.fn(),
    refreshAccessToken: vi.fn(),
    logoutUser: vi.fn(),
    linkOAuthAccount: vi.fn(),
    setupAdmin: vi.fn(),
    createPendingRegistration: vi.fn(),
    completeRegistration: vi.fn(),
    resendVerificationEmail: vi.fn(),
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
    changePassword: vi.fn(),
  }

  const mockOauthHelper = {
    exchangeGoogleCode: vi.fn(),
    exchangeMicrosoftCode: vi.fn(),
  }

  const mockVerifyToken = vi.fn((req: any, res: any, next: any) => {
    req.user = { userId: 'user123', email: 'test@example.com', role: 'user' }
    next()
  })

  const mockIsAuthenticated = vi.fn((req: any, res: any, next: any) => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }
    next()
  })

  return {
    mockPrisma: {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      emailVerificationToken: {
        findUnique: vi.fn(),
        delete: vi.fn(),
        create: vi.fn(),
      },
      session: {
        deleteMany: vi.fn(),
      },
    },
    mockAuthService,
    mockOauthHelper,
    mockVerifyToken,
    mockIsAuthenticated,
  }
})

// Set env vars before mocking
process.env.JWT_SECRET = 'test_secret'
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret'
process.env.FRONTEND_URL = 'http://localhost:5173'

vi.mock('../../src/db/init', () => ({
  getPrismaClient: () => mockPrisma,
}))

vi.mock('../../src/services/authService', () => ({
  registerUser: mockAuthService.registerUser,
  loginUser: mockAuthService.loginUser,
  oauthLogin: mockAuthService.oauthLogin,
  refreshAccessToken: mockAuthService.refreshAccessToken,
  logoutUser: mockAuthService.logoutUser,
  linkOAuthAccount: mockAuthService.linkOAuthAccount,
  setupAdmin: mockAuthService.setupAdmin,
  createPendingRegistration: mockAuthService.createPendingRegistration,
  completeRegistration: mockAuthService.completeRegistration,
  resendVerificationEmail: mockAuthService.resendVerificationEmail,
  requestPasswordReset: mockAuthService.requestPasswordReset,
  resetPassword: mockAuthService.resetPassword,
  changePassword: mockAuthService.changePassword,
}))

vi.mock('../../src/utils/oauthHelper', () => ({
  exchangeGoogleCode: mockOauthHelper.exchangeGoogleCode,
  exchangeMicrosoftCode: mockOauthHelper.exchangeMicrosoftCode,
}))

vi.mock('../../src/middleware/auth', () => ({
  verifyToken: mockVerifyToken,
  isAuthenticated: mockIsAuthenticated,
}))

vi.mock('../../src/middleware/security', () => ({
  authLimiter: (req: any, res: any, next: any) => next(),
}))

vi.mock('../../src/middleware/errorHandler', () => ({
  asyncHandler: (fn: any) => (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next),
}))

vi.mock('../../src/middleware/validation', () => ({
  validate: (schema: any) => (req: any, res: any, next: any) => next(),
}))

import authRouter from '../../src/routes/auth'

describe('Auth Routes', () => {
  let app: express.Application

  beforeEach(() => {
    vi.clearAllMocks()

    app = express()
    app.use(express.json())
    app.use('/auth', authRouter)
    
    // Error handler for tests
    app.use((err: any, _req: any, res: any, _next: any) => {
      const status = err.statusCode || err.status || 400
      res.status(status).json({ error: err.message || 'Error' })
    })
  })

  describe('POST /auth/register', () => {
    it('should create pending registration and require email verification', async () => {
      mockAuthService.createPendingRegistration.mockResolvedValueOnce(undefined)

      const response = await request(app).post('/auth/register').send({
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
        name: 'John Doe',
      })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.requiresVerification).toBe(true)
      expect(response.body.message).toContain('verificación')
      expect(mockAuthService.createPendingRegistration).toHaveBeenCalledWith(
        'newuser@example.com',
        'SecurePassword123!',
        'John Doe'
      )
    })

    it('should reject duplicate email registration', async () => {
      mockAuthService.createPendingRegistration.mockRejectedValueOnce(new Error('El email ya está registrado'))

      const response = await request(app).post('/auth/register').send({
        email: 'existing@example.com',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
        name: 'John Doe',
      })

      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(response.body).toBeDefined()
    })

    it('should validate password strength', async () => {
      const response = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        name: 'John Doe',
      })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should validate email format', async () => {
      const response = await request(app).post('/auth/register').send({
        email: 'invalid-email',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
        name: 'John Doe',
      })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('POST /auth/login', () => {
    it('should login user with valid credentials', async () => {
      mockAuthService.loginUser.mockResolvedValueOnce({
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'John Doe',
          role: 'user',
        },
        tokens: {
          accessToken: 'access_token_123',
          refreshToken: 'refresh_token_123',
        },
      })

      const response = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'SecurePassword123!',
      })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.user.email).toBe('test@example.com')
      expect(response.body.tokens.accessToken).toBeDefined()
    })

    it('should reject invalid email', async () => {
      const response = await request(app).post('/auth/login').send({
        email: 'invalid-email',
        password: 'password',
      })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should reject missing password', async () => {
      const response = await request(app).post('/auth/login').send({
        email: 'test@example.com',
      })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should reject invalid credentials', async () => {
      mockAuthService.loginUser.mockRejectedValueOnce(new Error('Invalid credentials'))

      const response = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('POST /auth/verify-email', () => {
    it('should verify email with valid token', async () => {
      const token = 'verification_token_123'
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

      mockPrisma.emailVerificationToken.findUnique.mockResolvedValueOnce({
        id: 'token_123',
        token: hashedToken,
        userId: 'user123',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })

      mockPrisma.user.update.mockResolvedValueOnce({
        id: 'user123',
        email: 'test@example.com',
        emailVerified: true,
      })

      mockPrisma.emailVerificationToken.delete.mockResolvedValueOnce({})

      const response = await request(app).post('/auth/verify-email').send({
        token,
      })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should reject missing verification token', async () => {
      const response = await request(app).post('/auth/verify-email').send({})

      expect(response.status).toBe(400)
      expect(response.body.error).toBeDefined()
    })

    it('should reject invalid verification token', async () => {
      mockPrisma.emailVerificationToken.findUnique.mockResolvedValueOnce(null)

      const response = await request(app).post('/auth/verify-email').send({
        token: 'invalid_token',
      })

      expect(response.status).toBe(400)
      expect(response.body.error).toBeDefined()
    })

    it('should reject expired verification token', async () => {
      const token = 'expired_token'
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

      mockPrisma.emailVerificationToken.findUnique.mockResolvedValueOnce({
        id: 'token_123',
        token: hashedToken,
        userId: 'user123',
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
      })

      const response = await request(app).post('/auth/verify-email').send({
        token,
      })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('expired')
    })
  })

  describe('POST /auth/oauth/google', () => {
    it('should login with Google OAuth', async () => {
      mockAuthService.oauthLogin.mockResolvedValueOnce({
        user: {
          id: 'user123',
          email: 'user@gmail.com',
          name: 'Google User',
          provider: 'google',
        },
        tokens: {
          accessToken: 'access_token_123',
          refreshToken: 'refresh_token_123',
        },
        isNewUser: true,
      })

      const response = await request(app).post('/auth/oauth/google').send({
        token: 'google_id_token',
        provider: 'google',
        sub: 'google_sub_123',
        email: 'user@gmail.com',
        name: 'Google User',
        picture: 'https://example.com/pic.jpg',
      })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.tokens.accessToken).toBeDefined()
    })

    it('should indicate if Google user is new', async () => {
      mockAuthService.oauthLogin.mockResolvedValueOnce({
        user: { id: 'user123', email: 'user@gmail.com' },
        tokens: { accessToken: 'token', refreshToken: 'refresh' },
        isNewUser: false,
      })

      const response = await request(app).post('/auth/oauth/google').send({
        token: 'google_id_token',
        provider: 'google',
      })

      expect(response.status).toBe(200)
      expect(response.body.isNewUser).toBe(false)
    })

    it('should reject missing token', async () => {
      const response = await request(app).post('/auth/oauth/google').send({
        provider: 'google',
      })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('POST /auth/oauth/microsoft', () => {
    it('should login with Microsoft OAuth', async () => {
      mockAuthService.oauthLogin.mockResolvedValueOnce({
        user: {
          id: 'user123',
          email: 'user@outlook.com',
          name: 'Microsoft User',
          provider: 'microsoft',
        },
        tokens: {
          accessToken: 'access_token_123',
          refreshToken: 'refresh_token_123',
        },
        isNewUser: true,
      })

      const response = await request(app).post('/auth/oauth/microsoft').send({
        token: 'microsoft_token',
        provider: 'microsoft',
        oid: 'microsoft_oid_123',
        email: 'user@outlook.com',
        name: 'Microsoft User',
        picture: 'https://example.com/pic.jpg',
      })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.tokens.accessToken).toBeDefined()
    })

    it('should handle Microsoft OAuth errors gracefully', async () => {
      mockAuthService.oauthLogin.mockRejectedValueOnce(new Error('OAuth error'))

      const response = await request(app).post('/auth/oauth/microsoft').send({
        token: 'microsoft_token',
        provider: 'microsoft',
      })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('POST /auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      mockAuthService.refreshAccessToken.mockResolvedValueOnce({
        accessToken: 'new_access_token_123',
      })

      const response = await request(app).post('/auth/refresh').send({
        refreshToken: 'valid_refresh_token',
      })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.accessToken).toBe('new_access_token_123')
    })

    it('should reject invalid refresh token', async () => {
      mockAuthService.refreshAccessToken.mockRejectedValueOnce(new Error('Invalid refresh token'))

      const response = await request(app).post('/auth/refresh').send({
        refreshToken: 'invalid_token',
      })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should reject missing refresh token', async () => {
      const response = await request(app).post('/auth/refresh').send({})

      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('POST /auth/logout', () => {
    it('should logout authenticated user', async () => {
      mockAuthService.logoutUser.mockResolvedValueOnce(undefined)

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer valid_token')
        .send({
          refreshToken: 'refresh_token_123',
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should require authentication for logout', async () => {
      mockIsAuthenticated.mockImplementationOnce((req: any, res, next) => {
        res.status(401).json({ error: 'Not authenticated' })
      })

      const response = await request(app).post('/auth/logout').send({
        refreshToken: 'token',
      })

      expect(response.status).toBe(401)
    })

    it('should invalidate refresh token on logout', async () => {
      mockAuthService.logoutUser.mockResolvedValueOnce(undefined)

      await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer valid_token')
        .send({
          refreshToken: 'refresh_token_123',
        })

      expect(mockAuthService.logoutUser).toHaveBeenCalledWith('user123', 'refresh_token_123')
    })
  })

  describe('POST /auth/link-oauth', () => {
    it('should link OAuth account to existing user', async () => {
      mockAuthService.linkOAuthAccount.mockResolvedValueOnce(undefined)

      const response = await request(app)
        .post('/auth/link-oauth')
        .set('Authorization', 'Bearer valid_token')
        .send({
          provider: 'google',
          providerAccountId: 'google_sub_123',
          email: 'user@gmail.com',
          name: 'Google User',
          picture: 'https://example.com/pic.jpg',
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should require provider and providerAccountId', async () => {
      const response = await request(app)
        .post('/auth/link-oauth')
        .set('Authorization', 'Bearer valid_token')
        .send({
          email: 'user@gmail.com',
        })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should require authentication to link OAuth', async () => {
      mockIsAuthenticated.mockImplementationOnce((req: any, res, next) => {
        res.status(401).json({ error: 'Not authenticated' })
      })

      const response = await request(app).post('/auth/link-oauth').send({
        provider: 'google',
        providerAccountId: 'sub_123',
      })

      expect(response.status).toBe(401)
    })

    it('should link Microsoft account to user', async () => {
      mockAuthService.linkOAuthAccount.mockResolvedValueOnce(undefined)

      const response = await request(app)
        .post('/auth/link-oauth')
        .set('Authorization', 'Bearer valid_token')
        .send({
          provider: 'microsoft',
          providerAccountId: 'microsoft_oid_123',
          email: 'user@outlook.com',
          name: 'Microsoft User',
          picture: 'https://example.com/pic.jpg',
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })
  })

  describe('GET /auth/me', () => {
    it('should return current user info when authenticated', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer valid_token')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.user.userId).toBe('user123')
      expect(response.body.user.email).toBe('test@example.com')
    })

    it('should require authentication for /me endpoint', async () => {
      mockIsAuthenticated.mockImplementationOnce((req: any, res, next) => {
        res.status(401).json({ error: 'Not authenticated' })
      })

      const response = await request(app).get('/auth/me')

      expect(response.status).toBe(401)
    })
  })

  describe('GET /auth/verify-token', () => {
    it('should verify valid token', async () => {
      const response = await request(app)
        .get('/auth/verify-token')
        .set('Authorization', 'Bearer valid_token')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.valid).toBe(true)
      expect(response.body.user.userId).toBe('user123')
    })

    it('should return user info in verify-token response', async () => {
      const response = await request(app)
        .get('/auth/verify-token')
        .set('Authorization', 'Bearer valid_token')

      expect(response.body.user).toBeDefined()
      expect(response.body.user.email).toBe('test@example.com')
    })

    it('should require valid token for verification', async () => {
      mockVerifyToken.mockImplementationOnce((req: any, res, next) => {
        res.status(401).json({ error: 'Invalid token' })
      })

      const response = await request(app).get('/auth/verify-token')

      expect(response.status).toBe(401)
    })
  })

  describe('POST /auth/setup-admin', () => {
    it('should setup initial admin user', async () => {
      mockAuthService.setupAdmin.mockResolvedValueOnce({
        user: {
          id: 'admin123',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
        },
        tokens: {
          accessToken: 'admin_access_token',
          refreshToken: 'admin_refresh_token',
        },
      })

      const response = await request(app).post('/auth/setup-admin').send({
        email: 'admin@example.com',
        password: 'AdminPassword123!',
        name: 'Admin User',
      })

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.user.role).toBe('admin')
    })

    it('should validate password length in setup-admin', async () => {
      const response = await request(app).post('/auth/setup-admin').send({
        email: 'admin@example.com',
        password: 'short',
        name: 'Admin User',
      })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('8 characters')
    })

    it('should require email, password, and name', async () => {
      const response = await request(app).post('/auth/setup-admin').send({
        email: 'admin@example.com',
        // missing password and name
      })

      expect(response.status).toBe(400)
    })

    it('should be idempotent for admin setup', async () => {
      mockAuthService.setupAdmin.mockResolvedValueOnce({
        user: {
          id: 'admin123',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
        },
        tokens: {
          accessToken: 'token',
          refreshToken: 'refresh',
        },
      })

      const response = await request(app).post('/auth/setup-admin').send({
        email: 'admin@example.com',
        password: 'AdminPassword123!',
        name: 'Admin User',
        setupToken: 'setup_token_123',
      })

      expect(response.status).toBe(201)
      expect(response.body.user.email).toBe('admin@example.com')
    })

    it('should accept setupToken parameter', async () => {
      mockAuthService.setupAdmin.mockResolvedValueOnce({
        user: { id: 'admin123', email: 'admin@example.com' },
        tokens: { accessToken: 'token', refreshToken: 'refresh' },
      })

      const response = await request(app).post('/auth/setup-admin').send({
        email: 'admin@example.com',
        password: 'AdminPassword123!',
        name: 'Admin User',
        setupToken: 'token_123',
      })

      expect(mockAuthService.setupAdmin).toHaveBeenCalledWith(
        'admin@example.com',
        'AdminPassword123!',
        'Admin User',
        'token_123'
      )
    })
  })

  describe('GET /auth/google/callback', () => {
    it('should handle Google OAuth callback with code', async () => {
      mockOauthHelper.exchangeGoogleCode.mockResolvedValueOnce({
        sub: 'google_sub_123',
        email: 'user@gmail.com',
        name: 'Google User',
        picture: 'https://example.com/pic.jpg',
      })

      mockAuthService.oauthLogin.mockResolvedValueOnce({
        user: { id: 'user123', email: 'user@gmail.com' },
        tokens: {
          accessToken: 'access_token_123',
          refreshToken: 'refresh_token_123',
        },
        isNewUser: true,
      })

      const response = await request(app).get('/auth/google/callback?code=auth_code_123&state=state_123')

      expect(response.status).toBe(302) // Redirect
      expect(response.headers.location).toContain('http://localhost:5173')
      expect(response.headers.location).toContain('token=access_token_123')
    })

    it('should reject Google callback without code', async () => {
      const response = await request(app).get('/auth/google/callback?state=state_123')

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('Authorization code')
    })

    it('should handle Google OAuth errors', async () => {
      const response = await request(app).get(
        '/auth/google/callback?error=access_denied&error_description=User%20denied'
      )

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('Google OAuth error')
    })

    it('should redirect to frontend on success', async () => {
      mockOauthHelper.exchangeGoogleCode.mockResolvedValueOnce({
        sub: 'google_sub_123',
        email: 'user@gmail.com',
        name: 'User',
        picture: 'pic',
      })

      mockAuthService.oauthLogin.mockResolvedValueOnce({
        user: { id: 'user123' },
        tokens: {
          accessToken: 'token_123',
          refreshToken: 'refresh_123',
        },
      })

      const response = await request(app).get('/auth/google/callback?code=code_123')

      expect(response.status).toBe(302)
      expect(response.headers.location).toContain('token=token_123')
      expect(response.headers.location).toContain('refresh=refresh_123')
    })
  })

  describe('GET /auth/microsoft/callback', () => {
    it('should handle Microsoft OAuth callback with code', async () => {
      mockOauthHelper.exchangeMicrosoftCode.mockResolvedValueOnce({
        sub: 'microsoft_oid_123',
        email: 'user@outlook.com',
        name: 'Microsoft User',
        picture: 'https://example.com/pic.jpg',
      })

      mockAuthService.oauthLogin.mockResolvedValueOnce({
        user: { id: 'user123', email: 'user@outlook.com' },
        tokens: {
          accessToken: 'access_token_123',
          refreshToken: 'refresh_token_123',
        },
        isNewUser: true,
      })

      const response = await request(app).get('/auth/microsoft/callback?code=auth_code_123&state=state_123')

      expect(response.status).toBe(302) // Redirect
      expect(response.headers.location).toContain('http://localhost:5173')
      expect(response.headers.location).toContain('token=access_token_123')
    })

    it('should reject Microsoft callback without code', async () => {
      const response = await request(app).get('/auth/microsoft/callback?state=state_123')

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('Authorization code')
    })

    it('should handle Microsoft OAuth errors', async () => {
      const response = await request(app).get(
        '/auth/microsoft/callback?error=access_denied&error_description=User%20denied%20access'
      )

      expect(response.status).toBe(400)
      expect(response.body.error).toBeDefined()
    })

    it('should redirect on Microsoft OAuth success', async () => {
      mockOauthHelper.exchangeMicrosoftCode.mockResolvedValueOnce({
        sub: 'microsoft_oid_123',
        email: 'user@outlook.com',
        name: 'User',
        picture: 'pic',
      })

      mockAuthService.oauthLogin.mockResolvedValueOnce({
        user: { id: 'user123' },
        tokens: {
          accessToken: 'token_123',
          refreshToken: 'refresh_123',
        },
      })

      const response = await request(app).get('/auth/microsoft/callback?code=code_123')

      expect(response.status).toBe(302)
      expect(response.headers.location).toContain('token=token_123')
    })

    it('should redirect to frontend with error on Google OAuth failure', async () => {
      mockOauthHelper.exchangeGoogleCode.mockRejectedValueOnce(
        new Error('Google auth failed')
      )

      const response = await request(app).get('/auth/google/callback?code=invalid_code')

      expect(response.status).toBe(302)
      expect(response.headers.location).toContain('/login?error=')
    })

    it('should redirect to frontend with error on Microsoft OAuth failure', async () => {
      mockOauthHelper.exchangeMicrosoftCode.mockRejectedValueOnce(
        new Error('Microsoft auth failed')
      )

      const response = await request(app).get('/auth/microsoft/callback?code=invalid_code')

      expect(response.status).toBe(302)
      expect(response.headers.location).toContain('/login?error=')
    })
  })

  describe('POST /auth/verify-email', () => {
    it('should complete registration with valid token', async () => {
      mockAuthService.completeRegistration.mockResolvedValueOnce({
        user: { id: 'user123', email: 'test@example.com', name: 'Test User', role: 'user' },
        tokens: { accessToken: 'access_123', refreshToken: 'refresh_123' },
      })

      const response = await request(app)
        .post('/auth/verify-email')
        .send({ token: 'valid_token_123' })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.user).toBeDefined()
      expect(response.body.tokens).toBeDefined()
      expect(mockAuthService.completeRegistration).toHaveBeenCalledWith('valid_token_123')
    })

    it('should reject invalid or expired token', async () => {
      mockAuthService.completeRegistration.mockRejectedValueOnce(
        new Error('Token inválido o expirado')
      )

      const response = await request(app)
        .post('/auth/verify-email')
        .send({ token: 'invalid_token' })

      expect(response.status).toBe(400)
      expect(response.body.error).toBeDefined()
    })

    it('should require token parameter', async () => {
      const response = await request(app)
        .post('/auth/verify-email')
        .send({})

      expect(response.status).toBe(400)
    })
  })

  describe('POST /auth/resend-verification', () => {
    it('should resend verification email', async () => {
      mockAuthService.resendVerificationEmail.mockResolvedValueOnce(undefined)

      const response = await request(app)
        .post('/auth/resend-verification')
        .send({ email: 'test@example.com' })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(mockAuthService.resendVerificationEmail).toHaveBeenCalledWith('test@example.com')
    })

    it('should always return success for security', async () => {
      // resendVerificationEmail no lanza error aunque el email no exista
      mockAuthService.resendVerificationEmail.mockResolvedValueOnce(undefined)

      const response = await request(app)
        .post('/auth/resend-verification')
        .send({ email: 'nonexistent@example.com' })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })
  })

  describe('POST /auth/forgot-password', () => {
    it('should request password reset', async () => {
      mockAuthService.requestPasswordReset.mockResolvedValueOnce(undefined)

      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'test@example.com' })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(mockAuthService.requestPasswordReset).toHaveBeenCalledWith('test@example.com')
    })

    it('should always return success for security', async () => {
      mockAuthService.requestPasswordReset.mockResolvedValueOnce(undefined)

      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })
  })

  describe('POST /auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      mockAuthService.resetPassword.mockResolvedValueOnce(undefined)

      const response = await request(app)
        .post('/auth/reset-password')
        .send({ token: 'valid_reset_token', password: 'NewSecurePass123!' })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        'valid_reset_token',
        'NewSecurePass123!'
      )
    })

    it('should reject invalid token', async () => {
      mockAuthService.resetPassword.mockRejectedValueOnce(
        new Error('Token inválido o expirado')
      )

      const response = await request(app)
        .post('/auth/reset-password')
        .send({ token: 'invalid_token', password: 'NewSecurePass123!' })

      expect(response.status).toBe(400)
      expect(response.body.error).toBeDefined()
    })
  })

  describe('POST /auth/change-password', () => {
    it('should change password for authenticated user', async () => {
      mockIsAuthenticated.mockImplementation((req, _res, next) => {
        req.user = { id: 'user123', email: 'test@example.com', role: 'user' }
        next()
      })
      mockAuthService.changePassword.mockResolvedValueOnce(undefined)

      const response = await request(app)
        .post('/auth/change-password')
        .send({ currentPassword: 'OldPass123!', newPassword: 'NewSecurePass123!' })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(mockAuthService.changePassword).toHaveBeenCalledWith(
        'user123',
        'OldPass123!',
        'NewSecurePass123!'
      )
    })

    it('should reject wrong current password', async () => {
      mockIsAuthenticated.mockImplementation((req, _res, next) => {
        req.user = { id: 'user123', email: 'test@example.com', role: 'user' }
        next()
      })
      mockAuthService.changePassword.mockRejectedValueOnce(
        new Error('Contraseña actual incorrecta')
      )

      const response = await request(app)
        .post('/auth/change-password')
        .send({ currentPassword: 'WrongPass123!', newPassword: 'NewSecurePass123!' })

      expect(response.status).toBe(400)
      expect(response.body.error).toBeDefined()
    })
  })
})
