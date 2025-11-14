import express, { Request, Response } from 'express'
import crypto from 'crypto'
import {
  registerUser,
  loginUser,
  oauthLogin,
  refreshAccessToken,
  logoutUser,
  linkOAuthAccount,
  setupAdmin,
} from '../services/authService.js'
import { verifyToken, isAuthenticated } from '../middleware/auth.js'
import { exchangeGoogleCode, exchangeMicrosoftCode } from '../utils/oauthHelper.js'
import { validate } from '../middleware/validation.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { authLimiter } from '../middleware/security.js'
import { getPrismaClient } from '../db/init.js'
import { sendWelcomeWithVerificationEmail } from '../services/emailService.js'
import { logger } from '../utils/logger.js'
import {
  RegisterSchema,
  LoginSchema,
  OAuthCallbackSchema,
  RefreshTokenSchema,
} from '../schemas/auth.schemas.js'

const router = express.Router()

// ============================================================
// EMAIL/PASSWORD AUTHENTICATION
// ============================================================

/**
 * POST /auth/register
 * Register a new user with email and password
 */
router.post(
  '/register',
  authLimiter,
  validate(RegisterSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password, name } = req.body

    const result = await registerUser(email, password, name)

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: result.user,
      tokens: result.tokens,
    })
  }),
)

/**
 * POST /auth/login
 * Login user with email and password
 */
router.post(
  '/login',
  authLimiter,
  validate(LoginSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body

    const result = await loginUser(email, password)

    res.json({
      success: true,
      message: 'Login successful',
      user: result.user,
      tokens: result.tokens,
    })
  }),
)

/**
 * POST /auth/verify-email
 * Verify user email with token
 */
router.post(
  '/verify-email',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { token } = req.body

    if (!token) {
      res.status(400).json({ error: 'Verification token required' })
      return
    }

    // Hash the token to find it in DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Find and verify the token
    const prisma = getPrismaClient()
    const verificationRecord = await prisma.emailVerificationToken.findUnique({
      where: { token: hashedToken },
    })

    if (!verificationRecord) {
      res.status(400).json({ error: 'Invalid or expired verification token' })
      return
    }

    if (new Date() > verificationRecord.expiresAt) {
      res.status(400).json({ error: 'Verification token has expired' })
      return
    }

    // Mark user as verified
    await prisma.user.update({
      where: { id: verificationRecord.userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    })

    // Delete the used token
    await prisma.emailVerificationToken.delete({
      where: { id: verificationRecord.id },
    })

    res.json({
      success: true,
      message: 'Email verified successfully',
    })
  }),
)

/**
 * POST /auth/send-welcome-email
 * Send welcome + verification email to newly registered user
 * Called by frontend after successful registration
 */
router.post(
  '/send-welcome-email',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, name, verificationToken } = req.body

    if (!email || !name || !verificationToken) {
      res.status(400).json({
        error: 'Email, name, and verification token are required',
      })
      return
    }

    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
      
      // Send the combined welcome + verification email
      await sendWelcomeWithVerificationEmail(email, {
        clientName: name,
        verificationLink: `${frontendUrl}/verify-email?token=${verificationToken}`,
        expiresInMinutes: 24 * 60,
      })

      logger.info('Welcome email sent successfully after registration', {
        email,
        name,
      })

      res.json({
        success: true,
        message: 'Welcome email sent successfully',
      })
    } catch (error) {
      logger.error('Failed to send welcome email', {
        error: error instanceof Error ? error.message : String(error),
        email,
      })

      res.status(500).json({
        error: 'Failed to send welcome email. Please try again later.',
      })
    }
  }),
)

// ============================================================
// OAUTH AUTHENTICATION (Google & Microsoft)
// ============================================================

/**
 * GET /auth/google/callback
 * Google OAuth callback - handles redirect from Google with authorization code
 */
router.get('/google/callback', async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, state, error } = req.query

    if (error) {
      res.status(400).json({ error: `Google OAuth error: ${error}` })
      return
    }

    if (!code || typeof code !== 'string') {
      res.status(400).json({ error: 'Authorization code is required' })
      return
    }

    // Exchange code for user info
    const userInfo = await exchangeGoogleCode(code)

    // Login or register user
    const result = await oauthLogin('google', userInfo.sub, userInfo.email, userInfo.name, userInfo.picture)

    // Create response with tokens - send to frontend
    const frontendUrl = (globalThis as any).process?.env?.FRONTEND_URL || 'http://localhost:5173'
    const accessToken = result.tokens.accessToken
    const refreshToken = result.tokens.refreshToken

    // Redirect to frontend with tokens in URL fragment (safer than query)
    res.redirect(`${frontendUrl}?token=${accessToken}&refresh=${refreshToken}`)
  } catch (error: any) {
    console.error('Google OAuth callback error:', error)
    const frontendUrl = (globalThis as any).process?.env?.FRONTEND_URL || 'http://localhost:5173'
    res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.message)}`)
  }
})

/**
 * GET /auth/microsoft/callback
 * Microsoft OAuth callback - handles redirect from Microsoft with authorization code
 */
router.get('/microsoft/callback', async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, state, error, error_description } = req.query

    if (error) {
      res.status(400).json({ error: `Microsoft OAuth error: ${error_description || error}` })
      return
    }

    if (!code || typeof code !== 'string') {
      res.status(400).json({ error: 'Authorization code is required' })
      return
    }

    // Exchange code for user info
    const userInfo = await exchangeMicrosoftCode(code)

    // Login or register user
    const result = await oauthLogin('microsoft', userInfo.sub, userInfo.email, userInfo.name, userInfo.picture)

    // Create response with tokens - send to frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const accessToken = result.tokens.accessToken
    const refreshToken = result.tokens.refreshToken

    // Redirect to frontend with tokens in URL fragment (safer than query)
    res.redirect(`${frontendUrl}?token=${accessToken}&refresh=${refreshToken}`)
  } catch (error: any) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.message)}`)
  }
})

/**
 * POST /auth/oauth/google
 * Google OAuth callback - login or register
 * Body: { idToken, code } from Google
 */
router.post(
  '/oauth/google',
  validate(OAuthCallbackSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { sub: providerAccountId, email, name, picture } = req.body

    const result = await oauthLogin('google', providerAccountId, email, name, picture)

    res.json({
      success: true,
      message: result.isNewUser ? 'Google account created' : 'Login with Google successful',
      user: result.user,
      tokens: result.tokens,
      isNewUser: result.isNewUser,
    })
  }),
)

/**
 * POST /auth/oauth/microsoft
 * Microsoft OAuth callback - login or register
 */
router.post(
  '/oauth/microsoft',
  validate(OAuthCallbackSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { oid: providerAccountId, email, name, picture } = req.body

    const result = await oauthLogin('microsoft', providerAccountId, email, name, picture)

    res.json({
      success: true,
      message: result.isNewUser ? 'Microsoft account created' : 'Login with Microsoft successful',
      user: result.user,
      tokens: result.tokens,
      isNewUser: result.isNewUser,
    })
  }),
)

// ============================================================
// TOKEN MANAGEMENT
// ============================================================

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post(
  '/refresh',
  validate(RefreshTokenSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body

    const result = await refreshAccessToken(refreshToken)

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      accessToken: result.accessToken,
    })
  }),
)

/**
 * POST /auth/logout
 * Logout user (invalidate refresh token)
 */
router.post(
  '/logout',
  verifyToken,
  isAuthenticated,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body
    const userId = req.user!.userId

    await logoutUser(userId, refreshToken || '')

    res.json({
      success: true,
      message: 'Logout successful',
    })
  }),
)

// ============================================================
// ACCOUNT LINKING
// ============================================================

/**
 * POST /auth/link-oauth
 * Link OAuth account to existing authenticated user
 */
router.post(
  '/link-oauth',
  verifyToken,
  isAuthenticated,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId
    const { provider, providerAccountId, email, name, picture } = req.body

    if (!provider || !providerAccountId) {
      const err = new Error('Provider and providerAccountId are required')
      ;(err as any).statusCode = 400
      throw err
    }

    await linkOAuthAccount(userId, provider, providerAccountId, email, name, picture)

    res.json({
      success: true,
      message: `${provider} account linked successfully`,
    })
  }),
)

// ============================================================
// VERIFICATION ENDPOINTS
// ============================================================

/**
 * GET /auth/me
 * Get current user info (requires auth token)
 */
router.get(
  '/me',
  verifyToken,
  isAuthenticated,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    res.json({
      success: true,
      user: req.user,
    })
  }),
)

/**
 * GET /auth/verify-token
 * Verify if token is valid
 */
router.get('/verify-token', verifyToken, (req: Request, res: Response): void => {
  res.json({
    success: true,
    valid: true,
    user: req.user,
  })
})

// ============================================================
// SETUP & INITIALIZATION
// ============================================================

/**
 * POST /auth/setup-admin
 * Setup initial admin user (idempotent)
 * Body: { email, password, name, setupToken? }
 */
router.post(
  '/setup-admin',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password, name, setupToken } = req.body

    // Basic validation
    if (!email || !password || !name) {
      res.status(400).json({
        success: false,
        error: 'email, password, and name are required',
      })
      return
    }

    if (password.length < 8) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters',
      })
      return
    }

    const result = await setupAdmin(email, password, name, setupToken)

    res.status(201).json({
      success: true,
      message: 'Admin user created/updated successfully',
      user: result.user,
      tokens: result.tokens,
    })
  }),
)

export default router
