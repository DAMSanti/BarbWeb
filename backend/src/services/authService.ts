import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { getPrismaClient } from '../db/init.js'
import { AuthenticationError, ConflictError, ValidationError } from '../utils/errors.js'
import { sendWelcomeEmail, sendEmailVerificationEmail, sendPasswordResetEmail, sendPasswordChangedEmail } from './emailService.js'
import { logger } from '../utils/logger.js'

const prisma = getPrismaClient()

// Types
export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

// Generate JWT tokens
export const generateTokens = (payload: JWTPayload): TokenPair => {
  const accessToken = jwt.sign(
    { ...payload, jti: crypto.randomUUID() },
    process.env.JWT_SECRET || 'secret',
    {
      expiresIn: '15m',
    }
  )

  const refreshToken = jwt.sign(
    { ...payload, jti: crypto.randomUUID() },
    process.env.JWT_REFRESH_SECRET || 'refresh-secret',
    {
      expiresIn: '7d',
    }
  )

  return { accessToken, refreshToken }
}

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

// Verify password
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}

// Register with email/password
export const registerUser = async (
  email: string,
  password: string,
  name: string
): Promise<{ user: any; tokens: TokenPair }> => {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new ConflictError('El email ya está registrado')
  }

  // Hash password
  const passwordHash = await hashPassword(password)

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      emailVerified: false, // Pendiente de verificación
    },
  })

  // Generate tokens
  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  })

  // Store refresh token
  await storeRefreshToken(user.id, tokens.refreshToken)

  // Generate email verification token
  const verificationTokenString = crypto.randomBytes(32).toString('hex')
  const hashedVerificationToken = crypto.createHash('sha256').update(verificationTokenString).digest('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      token: hashedVerificationToken,
      expiresAt,
    },
  })

  // Send welcome email
  try {
    await sendWelcomeEmail(email, {
      clientName: name,
    })
    logger.info('Welcome email sent successfully', { email })
  } catch (emailError) {
    logger.warn('Failed to send welcome email', {
      error: emailError instanceof Error ? emailError.message : String(emailError),
      email,
    })
  }

  // Send email verification
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationTokenString}`
    
    await sendEmailVerificationEmail(email, {
      clientName: name,
      verificationLink,
      expiresInMinutes: 24 * 60,
    })
    logger.info('Email verification sent successfully', { email })
  } catch (emailError) {
    logger.warn('Failed to send email verification', {
      error: emailError instanceof Error ? emailError.message : String(emailError),
      email,
    })
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
    },
    tokens,
  }
}

// Login with email/password
export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: any; tokens: TokenPair }> => {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user || !user.passwordHash) {
    throw new AuthenticationError('Email o contraseña incorrectos')
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash)
  if (!isPasswordValid) {
    throw new AuthenticationError('Email o contraseña incorrectos')
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  })

  // Generate tokens
  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  })

  // Store refresh token
  await storeRefreshToken(user.id, tokens.refreshToken)

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    tokens,
  }
}

// OAuth login/register (Google, GitHub, etc)
export const oauthLogin = async (
  provider: string,
  providerAccountId: string,
  email: string,
  name: string | undefined,
  picture?: string
): Promise<{ user: any; tokens: TokenPair; isNewUser: boolean }> => {
  // Check if OAuth account exists
  let oauthAccount = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider,
        providerAccountId,
      },
    },
    include: { user: true },
  })

  let isNewUser = false

  if (oauthAccount) {
    // Existing OAuth user
    const user = oauthAccount.user
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    await storeRefreshToken(user.id, tokens.refreshToken)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens,
      isNewUser: false,
    }
  }

  // Check if user exists with same email (linking scenario)
  let user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    // Create new user
    isNewUser = true
    user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        emailVerified: true, // OAuth email ya está verificado
        role: 'user',
      },
    })
  }

  // Create OAuth account
  const newOAuthAccount = await prisma.oAuthAccount.create({
    data: {
      userId: user.id,
      provider,
      providerAccountId,
      email,
      name: name,
      picture,
    },
  })

  // Generate tokens
  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  })

  // Store refresh token
  await storeRefreshToken(user.id, tokens.refreshToken)

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    tokens,
    isNewUser,
  }
}

// Refresh access token
export const refreshAccessToken = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'refresh-secret'
    ) as JWTPayload

    // Check if refresh token is stored
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      throw new AuthenticationError('Refresh token inválido o expirado')
    }

    // Generate new tokens
    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'secret',
      {
        expiresIn: '15m',
      }
    )

    const newRefreshToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      {
        expiresIn: '7d',
      }
    )

    // Remove old refresh token and add new one
    const updatedTokens = user.refreshTokens
      .filter((t: string) => t !== refreshToken)
      .slice(0, 4) // Keep only last 4 old tokens
    updatedTokens.unshift(newRefreshToken) // Add new token at the beginning

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokens: {
          set: updatedTokens,
        },
      },
    })

    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
  } catch (error: any) {
    // Si es un error de autenticación nuestro, re-lanzarlo
    if (error instanceof AuthenticationError) {
      throw error
    }
    // Si es un error JWT (token inválido, expirado, etc), convertir a AuthenticationError
    throw new AuthenticationError('Refresh token inválido o expirado')
  }
}

// Logout - invalidate refresh token
export const logoutUser = async (userId: string, refreshToken: string): Promise<void> => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      refreshTokens: {
        set: [], // Invalidate all tokens
      },
    },
  })
}

// Store refresh token
const storeRefreshToken = async (userId: string, refreshToken: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) return

  // Keep only last 5 refresh tokens
  const updatedTokens = [refreshToken, ...(user.refreshTokens || [])].slice(0, 5)

  await prisma.user.update({
    where: { id: userId },
    data: {
      refreshTokens: {
        set: updatedTokens,
      },
    },
  })
}

// Verify JWT token
export const verifyJWT = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret') as JWTPayload
  } catch {
    return null
  }
}

// Verify JWT token with custom secret (for refresh tokens, etc)
export const verifyJWTWithSecret = (token: string, secret: string): any => {
  try {
    return jwt.verify(token, secret)
  } catch {
    return null
  }
}

// Link OAuth account to existing user (for logged in users)
export const linkOAuthAccount = async (
  userId: string,
  provider: string,
  providerAccountId: string,
  email: string,
  name?: string,
  picture?: string
): Promise<void> => {
  // Check if OAuth account already exists
  const existingOAuth = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider,
        providerAccountId,
      },
    },
  })

  if (existingOAuth && existingOAuth.userId !== userId) {
    throw new Error('Esta cuenta OAuth ya está vinculada a otro usuario')
  }

  if (existingOAuth) {
    return // Already linked
  }

  // Create OAuth account
  await prisma.oAuthAccount.create({
    data: {
      userId,
      provider,
      providerAccountId,
      email,
      name,
      picture,
    },
  })
}

// Setup initial admin user (idempotent - create or update)
export const setupAdmin = async (
  email: string,
  password: string,
  name: string,
  setupToken?: string
): Promise<{ user: any; tokens: TokenPair }> => {
  // Validate setup token if provided (optional security layer)
  if (setupToken) {
    const expectedToken = process.env.SETUP_TOKEN || 'setup-secret-key'
    if (setupToken !== expectedToken) {
      throw new Error('Invalid setup token')
    }
  }

  // Check if any admin already exists (prevent overwrite)
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'admin' },
  })

  if (existingAdmin && setupToken !== process.env.SETUP_TOKEN) {
    throw new Error('Admin user already exists. Use correct setup token to override.')
  }

  // Hash password
  const passwordHash = await hashPassword(password)

  // Create or update user as admin
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'admin',
      passwordHash,
      name,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
    create: {
      email,
      name,
      role: 'admin',
      passwordHash,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  })

  // Generate tokens
  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    tokens,
  }
}

// ============================================================
// PASSWORD RESET FUNCTIONS
// ============================================================

// Request password reset - creates token and sends email
export const requestPasswordReset = async (email: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  // Always return success to prevent email enumeration
  if (!user) {
    logger.info('Password reset requested for non-existent email', { email })
    return
  }

  // Delete any existing reset tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  })

  // Generate reset token
  const resetTokenString = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(resetTokenString).digest('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  // Store hashed token
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: hashedToken,
      expiresAt,
    },
  })

  // Send reset email
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
  const resetLink = `${frontendUrl}/reset-password?token=${resetTokenString}`

  try {
    await sendPasswordResetEmail(email, {
      clientName: user.name || 'Usuario',
      resetLink,
      expiresInMinutes: 60,
    })
    logger.info('Password reset email sent', { email })
  } catch (emailError) {
    logger.error('Failed to send password reset email', {
      error: emailError instanceof Error ? emailError.message : String(emailError),
      email,
    })
    // Don't throw - we don't want to reveal if email exists
  }
}

// Reset password with token
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<void> => {
  // Hash the provided token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  // Find token
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: hashedToken },
    include: { user: true },
  })

  if (!resetToken) {
    throw new AuthenticationError('Token de recuperación inválido o expirado')
  }

  if (resetToken.used) {
    throw new AuthenticationError('Este enlace de recuperación ya ha sido utilizado')
  }

  if (new Date() > resetToken.expiresAt) {
    throw new AuthenticationError('El enlace de recuperación ha expirado')
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword)

  // Update user password and mark token as used
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash,
        refreshTokens: { set: [] }, // Invalidate all sessions
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    }),
  ])

  // Send password changed notification
  try {
    await sendPasswordChangedEmail(resetToken.user.email, {
      clientName: resetToken.user.name || 'Usuario',
      changedAt: new Date(),
    })
    logger.info('Password changed notification sent', { email: resetToken.user.email })
  } catch (emailError) {
    logger.warn('Failed to send password changed notification', {
      error: emailError instanceof Error ? emailError.message : String(emailError),
    })
  }

  logger.info('Password reset successful', { userId: resetToken.userId })
}

// Change password for authenticated user
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user || !user.passwordHash) {
    throw new AuthenticationError('Usuario no encontrado o no tiene contraseña configurada')
  }

  // Verify current password
  const isPasswordValid = await verifyPassword(currentPassword, user.passwordHash)
  if (!isPasswordValid) {
    throw new AuthenticationError('La contraseña actual es incorrecta')
  }

  // Validate new password is different
  const isSamePassword = await verifyPassword(newPassword, user.passwordHash)
  if (isSamePassword) {
    throw new ValidationError('La nueva contraseña debe ser diferente a la actual')
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword)

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      refreshTokens: { set: [] }, // Invalidate all sessions
    },
  })

  // Send notification
  try {
    await sendPasswordChangedEmail(user.email, {
      clientName: user.name || 'Usuario',
      changedAt: new Date(),
    })
    logger.info('Password changed notification sent', { email: user.email })
  } catch (emailError) {
    logger.warn('Failed to send password changed notification', {
      error: emailError instanceof Error ? emailError.message : String(emailError),
    })
  }

  logger.info('Password changed by user', { userId })
}

// ============================================================
// PENDING REGISTRATION FUNCTIONS (Email verification before account creation)
// ============================================================

// Create pending registration (instead of creating user directly)
export const createPendingRegistration = async (
  email: string,
  password: string,
  name: string
): Promise<{ message: string }> => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new ConflictError('El email ya está registrado')
  }

  // Check if there's already a pending registration
  const existingPending = await prisma.pendingRegistration.findUnique({
    where: { email },
  })

  if (existingPending) {
    // Delete old pending registration
    await prisma.pendingRegistration.delete({
      where: { email },
    })
  }

  // Hash password
  const passwordHash = await hashPassword(password)

  // Generate verification token
  const verificationTokenString = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(verificationTokenString).digest('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Create pending registration
  await prisma.pendingRegistration.create({
    data: {
      email,
      name,
      passwordHash,
      token: hashedToken,
      expiresAt,
    },
  })

  // Send verification email
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
  const verificationLink = `${frontendUrl}/verify-email?token=${verificationTokenString}`

  try {
    await sendEmailVerificationEmail(email, {
      clientName: name,
      verificationLink,
      expiresInMinutes: 24 * 60,
    })
    logger.info('Verification email sent for pending registration', { email })
  } catch (emailError) {
    logger.error('Failed to send verification email', {
      error: emailError instanceof Error ? emailError.message : String(emailError),
      email,
    })
    throw new Error('No se pudo enviar el email de verificación. Intenta de nuevo.')
  }

  return {
    message: 'Se ha enviado un email de verificación. Por favor, revisa tu bandeja de entrada.',
  }
}

// Complete registration after email verification
export const completeRegistration = async (
  token: string
): Promise<{ user: any; tokens: TokenPair }> => {
  // Hash the provided token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  // Find pending registration
  const pendingReg = await prisma.pendingRegistration.findUnique({
    where: { token: hashedToken },
  })

  if (!pendingReg) {
    throw new AuthenticationError('Token de verificación inválido o expirado')
  }

  if (new Date() > pendingReg.expiresAt) {
    // Delete expired registration
    await prisma.pendingRegistration.delete({
      where: { id: pendingReg.id },
    })
    throw new AuthenticationError('El enlace de verificación ha expirado. Por favor, regístrate de nuevo.')
  }

  // Check if user was created in the meantime
  const existingUser = await prisma.user.findUnique({
    where: { email: pendingReg.email },
  })

  if (existingUser) {
    // Delete pending registration
    await prisma.pendingRegistration.delete({
      where: { id: pendingReg.id },
    })
    throw new ConflictError('Este email ya ha sido verificado. Puedes iniciar sesión.')
  }

  // Create actual user
  const user = await prisma.user.create({
    data: {
      email: pendingReg.email,
      name: pendingReg.name,
      passwordHash: pendingReg.passwordHash,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  })

  // Delete pending registration
  await prisma.pendingRegistration.delete({
    where: { id: pendingReg.id },
  })

  // Generate tokens
  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  })

  // Store refresh token
  await storeRefreshToken(user.id, tokens.refreshToken)

  // Send welcome email
  try {
    await sendWelcomeEmail(user.email, {
      clientName: user.name || 'Usuario',
    })
    logger.info('Welcome email sent', { email: user.email })
  } catch (emailError) {
    logger.warn('Failed to send welcome email', {
      error: emailError instanceof Error ? emailError.message : String(emailError),
    })
  }

  logger.info('Registration completed after email verification', { userId: user.id })

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
    },
    tokens,
  }
}

// Resend verification email for pending registration
export const resendVerificationEmail = async (email: string): Promise<void> => {
  const pendingReg = await prisma.pendingRegistration.findUnique({
    where: { email },
  })

  if (!pendingReg) {
    // Don't reveal if email exists
    logger.info('Resend verification requested for non-existent pending registration', { email })
    return
  }

  // Generate new token
  const verificationTokenString = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(verificationTokenString).digest('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Update pending registration with new token
  await prisma.pendingRegistration.update({
    where: { email },
    data: {
      token: hashedToken,
      expiresAt,
    },
  })

  // Send verification email
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
  const verificationLink = `${frontendUrl}/verify-email?token=${verificationTokenString}`

  try {
    await sendEmailVerificationEmail(email, {
      clientName: pendingReg.name,
      verificationLink,
      expiresInMinutes: 24 * 60,
    })
    logger.info('Verification email resent', { email })
  } catch (emailError) {
    logger.error('Failed to resend verification email', {
      error: emailError instanceof Error ? emailError.message : String(emailError),
      email,
    })
  }
}

export default {
  registerUser,
  loginUser,
  oauthLogin,
  refreshAccessToken,
  logoutUser,
  setupAdmin,
  generateTokens,
  hashPassword,
  verifyPassword,
  linkOAuthAccount,
  requestPasswordReset,
  resetPassword,
  changePassword,
  createPendingRegistration,
  completeRegistration,
  resendVerificationEmail,
}
