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

const router = express.Router()

// ============================================================
// EMAIL/PASSWORD AUTHENTICATION
// ============================================================

/**
 * POST /auth/register
 * Register a new user with email and password
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body

    // Validation
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' })
      return
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' })
      return
    }

    if (!email.includes('@')) {
      res.status(400).json({ error: 'Invalid email format' })
      return
    }

    const result = await registerUser(email, password, name)

    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      tokens: result.tokens,
    })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

/**
 * POST /auth/login
 * Login user with email and password
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' })
      return
    }

    const result = await loginUser(email, password)

    res.json({
      message: 'Login successful',
      user: result.user,
      tokens: result.tokens,
    })
  } catch (error: any) {
    res.status(401).json({ error: error.message })
  }
})

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
    const frontendUrl = (globalThis as any).process?.env?.FRONTEND_URL || 'http://localhost:5173'
    const accessToken = result.tokens.accessToken
    const refreshToken = result.tokens.refreshToken

    // Redirect to frontend with tokens in URL
    res.redirect(`${frontendUrl}?token=${accessToken}&refresh=${refreshToken}`)
  } catch (error: any) {
    const frontendUrl = (globalThis as any).process?.env?.FRONTEND_URL || 'http://localhost:5173'
    res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.message)}`)
  }
})

/**
 * POST /auth/oauth/google
 * Google OAuth callback - login or register
 * Body: { idToken, code } from Google
 */
router.post('/oauth/google', async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken, code } = req.body

    if (!idToken && !code) {
      res.status(400).json({ error: 'idToken or code is required' })
      return
    }

    // In production: verify idToken with Google API
    // For now, we'll receive already-verified data from frontend
    const { sub: providerAccountId, email, name, picture } = req.body

    if (!providerAccountId || !email) {
      res.status(400).json({ error: 'Invalid Google data' })
      return
    }

    const result = await oauthLogin('google', providerAccountId, email, name, picture)

    res.json({
      message: result.isNewUser ? 'Google account created' : 'Login with Google successful',
      user: result.user,
      tokens: result.tokens,
      isNewUser: result.isNewUser,
    })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

/**
 * POST /auth/oauth/microsoft
 * Microsoft OAuth callback - login or register
 */
router.post('/oauth/microsoft', async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken, code } = req.body

    if (!idToken && !code) {
      res.status(400).json({ error: 'idToken or code is required' })
      return
    }

    // In production: verify idToken with Microsoft API
    // For now, we'll receive already-verified data from frontend
    const { oid: providerAccountId, email, name, picture } = req.body

    if (!providerAccountId || !email) {
      res.status(400).json({ error: 'Invalid Microsoft data' })
      return
    }

    const result = await oauthLogin('microsoft', providerAccountId, email, name, picture)

    res.json({
      message: result.isNewUser ? 'Microsoft account created' : 'Login with Microsoft successful',
      user: result.user,
      tokens: result.tokens,
      isNewUser: result.isNewUser,
    })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// ============================================================
// TOKEN MANAGEMENT
// ============================================================

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' })
      return
    }

    const result = await refreshAccessToken(refreshToken)

    res.json({
      message: 'Token refreshed successfully',
      accessToken: result.accessToken,
    })
  } catch (error: any) {
    res.status(401).json({ error: error.message })
  }
})

/**
 * POST /auth/logout
 * Logout user - invalidate refresh tokens
 */
router.post('/logout', verifyToken, isAuthenticated, async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body
    const userId = req.user!.userId

    await logoutUser(userId, refreshToken || '')

    res.json({ message: 'Logout successful' })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// ============================================================
// ACCOUNT LINKING
// ============================================================

/**
 * POST /auth/link-oauth
 * Link OAuth account to existing authenticated user
 */
router.post('/link-oauth', verifyToken, isAuthenticated, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId
    const { provider, providerAccountId, email, name, picture } = req.body

    if (!provider || !providerAccountId) {
      res.status(400).json({ error: 'Provider and providerAccountId are required' })
      return
    }

    await linkOAuthAccount(userId, provider, providerAccountId, email, name, picture)

    res.json({
      message: `${provider} account linked successfully`,
    })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// ============================================================
// VERIFICATION ENDPOINTS
// ============================================================

/**
 * GET /auth/me
 * Get current user info (requires auth token)
 */
router.get('/me', verifyToken, isAuthenticated, async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      user: req.user,
    })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

/**
 * GET /auth/verify-token
 * Verify if token is valid
 */
router.get('/verify-token', verifyToken, (req: Request, res: Response): void => {
  res.json({
    valid: true,
    user: req.user,
  })
})

export default router
