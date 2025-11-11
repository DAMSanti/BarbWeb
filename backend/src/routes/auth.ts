import express, { Request, Response } from 'express'
import {
  registerUser,
  loginUser,
  oauthLogin,
  refreshAccessToken,
  logoutUser,
  linkOAuthAccount,
} from '../services/authService.js'
import { verifyToken, isAuthenticated } from '../middleware/auth.js'
import { exchangeGoogleCode, exchangeMicrosoftCode } from '../utils/oauthHelper.js'
import { validate } from '../middleware/validation.js'
import { asyncHandler } from '../middleware/errorHandler.js'
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

export default router
