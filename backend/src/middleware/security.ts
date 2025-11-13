import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cors from 'cors'
import { Express } from 'express'
import { logger } from '../utils/logger.js'

/**
 * SECURITY MIDDLEWARE CONFIGURATION
 * Includes: Helmet (security headers), CORS, and Rate Limiting
 */

// ============================================================================
// 1. HELMET CONFIGURATION - Security Headers
// ============================================================================

export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.stripe.com', 'https://js.stripe.com'],
      frameSrc: ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com'],
      objectSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000, // 1 año en segundos
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  xssFilter: true,
})

// ============================================================================
// 2. CORS CONFIGURATION - Cross-Origin Resource Sharing
// ============================================================================

const getFrontendUrl = (): string => {
  // En producción: https://front-xxxxx.ondigitalocean.app
  // En desarrollo: http://localhost:5173
  return process.env.VITE_FRONTEND_URL || 'http://localhost:5173'
}

export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      getFrontendUrl(),
      'http://localhost:5173', // Desarrollo local
      'http://localhost:3000', // Alternativa desarrollo
    ]

    // Permitir sin origin (requests locales, mobile apps, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true, // Permitir cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'stripe-signature',
  ],
  maxAge: 86400, // 24 horas en segundos
  optionsSuccessStatus: 200,
}

// ============================================================================
// 3. RATE LIMITING CONFIGURATION
// ============================================================================

// Global rate limiter: 100 requests per 15 minutes
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests
  message: 'Demasiadas solicitudes desde esta IP, intenta más tarde',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  skip: (req) => {
    // No aplicar rate limiting a health checks o webhooks de Stripe
    return req.path === '/health' || req.path.includes('/webhooks/stripe')
  },
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`)
    res.status(429).json({
      success: false,
      error: 'Demasiadas solicitudes. Intenta más tarde.',
    })
  },
})

// Auth rate limiter: 5 requests per 15 minutes (prevent brute force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos
  message: 'Demasiados intentos de login. Intenta más tarde.',
  skipSuccessfulRequests: true, // No contar requests exitosos
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`)
    res.status(429).json({
      success: false,
      error: 'Demasiados intentos de login. Intenta más tarde.',
    })
  },
})

// Payment rate limiter: 10 requests per minute
export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // máximo 10 requests
  message: 'Demasiadas solicitudes de pago. Intenta más tarde.',
  handler: (req, res) => {
    logger.warn(`Payment rate limit exceeded for IP: ${req.ip}`)
    res.status(429).json({
      success: false,
      error: 'Demasiadas solicitudes de pago. Intenta más tarde.',
    })
  },
})

// ============================================================================
// 4. INITIALIZE ALL SECURITY MIDDLEWARE
// ============================================================================

export const initializeSecurityMiddleware = (app: Express): void => {
  // 1. Helmet - Security headers (debe ir primero)
  app.use(helmetConfig)

  // 2. CORS - Cross-origin requests
  app.use(cors(corsOptions))

  // 3. Global Rate Limiting
  app.use(globalLimiter)

  logger.info('✅ Security middleware initialized: Helmet + CORS + Rate Limiting')
}

// ============================================================================
// 5. EXPORT LIMITERS FOR SPECIFIC ROUTES
// ============================================================================

// Ya están exportadas arriba, no necesitan re-export
