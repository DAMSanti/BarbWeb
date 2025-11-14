import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { getPrismaClient } from '../db/init.js'
import { AuthenticationError, ConflictError } from '../utils/errors.js'
import { sendWelcomeWithVerificationEmail } from './emailService.js'
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
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: '15m',
  })

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'refresh-secret', {
    expiresIn: '7d',
  })

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

  // NOTE: Email sending is handled by backend through a dedicated endpoint
  // This allows for better retry logic and webhook-based sending
  // Frontend will call a separate endpoint to trigger welcome + verification email

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
      verificationToken: verificationTokenString, // Return token to frontend so it can be used to trigger email sending
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
): Promise<{ accessToken: string }> => {
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

    // Generate new access token
    const accessToken = jwt.sign(
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

    return { accessToken }
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
}
