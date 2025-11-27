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
  requestPasswordReset,
  resetPassword,
  changePassword,
  createPendingRegistration,
  completeRegistration,
  resendVerificationEmail,
} from '../services/authService.js'
import { verifyToken, isAuthenticated } from '../middleware/auth.js'
import { exchangeGoogleCode, exchangeMicrosoftCode } from '../utils/oauthHelper.js'
import { validate } from '../middleware/validation.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { authLimiter } from '../middleware/security.js'
import { getPrismaClient } from '../db/init.js'
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
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     description: Crea una cuenta de usuario con email y contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *                 tokens: { $ref: '#/components/schemas/AuthTokens' }
 *       400:
 *         description: Datos inválidos o email ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       429:
 *         description: Rate limit excedido
 */
router.post(
  '/register',
  authLimiter,
  validate(RegisterSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password, name } = req.body

    // Nuevo sistema: crear registro pendiente y enviar email de verificación
    const result = await createPendingRegistration(email, password, name)

    res.status(200).json({
      success: true,
      message: result.message,
      requiresVerification: true,
    })
  }),
)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autenticar usuario con email y contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *                 tokens: { $ref: '#/components/schemas/AuthTokens' }
 *       401:
 *         description: Credenciales inválidas
 *       429:
 *         description: Rate limit excedido (anti brute-force)
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
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verificar email y completar registro
 *     description: Verificar el email del usuario con el token enviado por correo. Crea la cuenta y devuelve tokens.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string, description: Token de verificación }
 *     responses:
 *       200:
 *         description: Email verificado y cuenta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *                 tokens: { $ref: '#/components/schemas/AuthTokens' }
 *       400:
 *         description: Token inválido o expirado
 */
router.post(
  '/verify-email',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { token } = req.body

    if (!token) {
      res.status(400).json({ error: 'Verification token required' })
      return
    }

    // Complete registration using the new system
    const result = await completeRegistration(token)

    res.json({
      success: true,
      message: 'Email verificado exitosamente. ¡Bienvenido!',
      user: result.user,
      tokens: result.tokens,
    })
  }),
)

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Reenviar email de verificación
 *     description: Reenviar el email de verificación para un registro pendiente
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Email de verificación reenviado (si existe)
 */
router.post(
  '/resend-verification',
  authLimiter,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body

    if (!email) {
      res.status(400).json({ error: 'Email required' })
      return
    }

    await resendVerificationEmail(email)

    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'Si existe un registro pendiente, recibirás un nuevo email de verificación.',
    })
  }),
)

// ============================================================
// OAUTH AUTHENTICATION (Google & Microsoft)
// ============================================================

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Callback OAuth de Google
 *     description: Endpoint de callback para autenticación OAuth con Google. Redirige al frontend con tokens.
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema: { type: string }
 *         description: Código de autorización de Google
 *       - in: query
 *         name: state
 *         schema: { type: string }
 *         description: Estado para prevenir CSRF
 *     responses:
 *       302:
 *         description: Redirige al frontend con tokens
 *       400:
 *         description: Error de OAuth
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
    logger.error('Google OAuth callback error:', error)
    const frontendUrl = (globalThis as any).process?.env?.FRONTEND_URL || 'http://localhost:5173'
    res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.message)}`)
  }
})

/**
 * @swagger
 * /auth/microsoft/callback:
 *   get:
 *     summary: Callback OAuth de Microsoft
 *     description: Endpoint de callback para autenticación OAuth con Microsoft. Redirige al frontend con tokens.
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema: { type: string }
 *         description: Código de autorización de Microsoft
 *       - in: query
 *         name: state
 *         schema: { type: string }
 *         description: Estado para prevenir CSRF
 *     responses:
 *       302:
 *         description: Redirige al frontend con tokens
 *       400:
 *         description: Error de OAuth
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
 * @swagger
 * /auth/oauth/google:
 *   post:
 *     summary: Login/Registro con Google (API)
 *     description: Autenticación con datos de Google ya intercambiados
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sub, email]
 *             properties:
 *               sub: { type: string, description: ID único de Google }
 *               email: { type: string, format: email }
 *               name: { type: string }
 *               picture: { type: string, format: uri }
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 user: { $ref: '#/components/schemas/User' }
 *                 tokens: { $ref: '#/components/schemas/AuthTokens' }
 *                 isNewUser: { type: boolean }
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
 * @swagger
 * /auth/oauth/microsoft:
 *   post:
 *     summary: Login/Registro con Microsoft (API)
 *     description: Autenticación con datos de Microsoft ya intercambiados
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oid, email]
 *             properties:
 *               oid: { type: string, description: ID único de Microsoft }
 *               email: { type: string, format: email }
 *               name: { type: string }
 *               picture: { type: string, format: uri }
 *     responses:
 *       200:
 *         description: Login exitoso
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
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refrescar access token
 *     description: Obtener nuevo access token usando el refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Token refrescado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 accessToken: { type: string }
 *       401:
 *         description: Refresh token inválido o expirado
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
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: Invalidar refresh token y cerrar sesión del usuario
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string, description: Token a invalidar (opcional) }
 *     responses:
 *       200:
 *         description: Logout exitoso
 *       401:
 *         description: No autenticado
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
 * @swagger
 * /auth/link-oauth:
 *   post:
 *     summary: Vincular cuenta OAuth
 *     description: Vincular una cuenta OAuth (Google/Microsoft) a un usuario autenticado existente
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [provider, providerAccountId]
 *             properties:
 *               provider: { type: string, enum: [google, microsoft] }
 *               providerAccountId: { type: string }
 *               email: { type: string, format: email }
 *               name: { type: string }
 *               picture: { type: string, format: uri }
 *     responses:
 *       200:
 *         description: Cuenta vinculada exitosamente
 *       400:
 *         description: Provider o providerAccountId faltante
 *       401:
 *         description: No autenticado
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
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtener usuario actual
 *     description: Obtener información del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 user: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: No autenticado
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
 * @swagger
 * /auth/verify-token:
 *   get:
 *     summary: Verificar token
 *     description: Verificar si el access token es válido
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 valid: { type: boolean }
 *                 user: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Token inválido o expirado
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
 * @swagger
 * /auth/setup-admin:
 *   post:
 *     summary: Configurar admin inicial
 *     description: Crear o actualizar el usuario administrador inicial. Operación idempotente.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               name: { type: string }
 *               setupToken: { type: string, description: Token de setup (opcional) }
 *     responses:
 *       201:
 *         description: Admin creado/actualizado exitosamente
 *       400:
 *         description: Datos inválidos
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

// ============================================================
// PASSWORD RECOVERY
// ============================================================

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     description: Envía un email con un enlace para restablecer la contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Email enviado (si existe la cuenta)
 *       429:
 *         description: Rate limit excedido
 */
router.post(
  '/forgot-password',
  authLimiter,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body

    if (!email) {
      res.status(400).json({ error: 'Email is required' })
      return
    }

    await requestPasswordReset(email)

    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'Si el email está registrado, recibirás un enlace para restablecer tu contraseña.',
    })
  }),
)

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña
 *     description: Cambiar la contraseña usando el token de recuperación
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token: { type: string, description: Token de recuperación }
 *               password: { type: string, minLength: 8, description: Nueva contraseña }
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *       400:
 *         description: Token inválido o expirado
 */
router.post(
  '/reset-password',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { token, password } = req.body

    if (!token || !password) {
      res.status(400).json({ error: 'Token and password are required' })
      return
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' })
      return
    }

    await resetPassword(token, password)

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.',
    })
  }),
)

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Cambiar contraseña
 *     description: Cambiar la contraseña del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string, description: Contraseña actual }
 *               newPassword: { type: string, minLength: 8, description: Nueva contraseña }
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 *       401:
 *         description: Contraseña actual incorrecta o no autenticado
 */
router.post(
  '/change-password',
  verifyToken,
  isAuthenticated,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body
    const userId = req.user!.userId

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current password and new password are required' })
      return
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters' })
      return
    }

    await changePassword(userId, currentPassword, newPassword)

    res.json({
      success: true,
      message: 'Contraseña cambiada exitosamente. Se han cerrado todas tus sesiones.',
    })
  }),
)

export default router
