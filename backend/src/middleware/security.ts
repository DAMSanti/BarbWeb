import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cors from 'cors'
import { Express } from 'express'
import { logger } from '../utils/logger.js'

// When @types/node isn't available in some build environments, provide a minimal
// declaration so TypeScript doesn't fail on references to `process.env`.
declare const process: { env: Record<string, string | undefined> }

/**
 * SECURITY MIDDLEWARE CONFIGURATION
 * Includes: Helmet (security headers), CORS, and Rate Limiting
 */

// ============================================================================
// 1. HELMET CONFIGURATION - Security Headers
// ============================================================================

export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: (() => {
      // Build connectSrc dynamic list including the configured API URL origin
      const apiUrl = process.env.VITE_API_URL || 'http://localhost:3000'
      let apiOrigin = 'http://localhost:3000'
      try {
        apiOrigin = new URL(apiUrl).origin
      } catch (err) {
        apiOrigin = apiUrl
      }
      // Also include APP_DOMAIN origin if provided (env may be just a hostname)
      let appDomainOrigin: string | null = null
      if (process.env.APP_DOMAIN) {
        try {
          const raw = process.env.APP_DOMAIN!.startsWith('http') ? process.env.APP_DOMAIN! : `https://${process.env.APP_DOMAIN!}`
          appDomainOrigin = new URL(raw).origin
        } catch (err) {
          appDomainOrigin = null
        }
      }

      const allowedConnectSrc = [
        "'self'", 
        apiOrigin, 
        'https://api.stripe.com', 
        'https://js.stripe.com', 
        'https://api.resend.com',
        // Sentry error tracking
        'https://*.ingest.sentry.io',
        'https://*.ingest.de.sentry.io',
      ]
      if (appDomainOrigin && !allowedConnectSrc.includes(appDomainOrigin)) {
        allowedConnectSrc.push(appDomainOrigin)
      }

      // Production domain
      const productionDomain = 'https://www.damsanti.app'
      if (!allowedConnectSrc.includes(productionDomain)) {
        allowedConnectSrc.push(productionDomain)
      }
      // Fallback for DigitalOcean default app domain
      const doFallback = 'https://back-jqdv9.ondigitalocean.app'
      if (!allowedConnectSrc.includes(doFallback)) {
        allowedConnectSrc.push(doFallback)
      }

      // Log the effective connect-src list for debugging (helps confirm headers)
      logger.info(`CSP connect-src allowed origins: ${JSON.stringify(allowedConnectSrc)}`)

      return {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: [
        "'self'", 
        'https://js.stripe.com', 
        'https://www.googletagmanager.com',
        // Hash for Google Analytics inline script
        "'sha256-0T0TE7u3vy5Z7rw/UlsACfk8b26loBw5EsuBXoHvIFE='",
      ],
      workerSrc: ["'self'", 'blob:'], // Sentry Session Replay uses blob workers
      imgSrc: ["'self'", 'data:', 'https:', 'https://www.googletagmanager.com'],
      connectSrc: [...allowedConnectSrc, 'https://www.google-analytics.com', 'https://analytics.google.com', 'https://www.googletagmanager.com'],
      frameSrc: ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com'],
      objectSrc: ["'none'"],
      }
    })(),
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

// Build CORS options at runtime so we can include diagnostics and a debug allow-all flag
const buildCorsOptions = () => {
  const frontendUrl = getFrontendUrl()
  const allowedOrigins = [
    frontendUrl,
    'http://localhost:5173', // Desarrollo local
    'http://localhost:3000', // Alternativa desarrollo
  ]

  // If ALLOW_ALL_CORS=1 is set, allow any origin (temporary debug mode)
  if (process.env.ALLOW_ALL_CORS === '1') {
    logger.warn('⚠️ ALLOW_ALL_CORS=1 enabled — backend will accept requests from any origin (debug mode)')
    return {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'stripe-signature'],
      maxAge: 86400,
      optionsSuccessStatus: 200,
    }
  }

  return {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Permitir sin origin (requests locales, mobile apps, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        logger.warn(`CORS blocked request from origin: ${origin}`)
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'stripe-signature'],
    maxAge: 86400,
    optionsSuccessStatus: 200,
  }
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
  windowMs: (process.env.AUTH_RATE_WINDOW_MS ? Number(process.env.AUTH_RATE_WINDOW_MS) : 15) * 60 * 1000, // default 15 minutos
  max: Number(process.env.AUTH_RATE_LIMIT || 5), // configurable max intentos
  message: 'Demasiados intentos de login. Intenta más tarde.',
  skipSuccessfulRequests: true, // No contar requests exitosos
  skip: (req) => {
    // Allowlist IPs from env for debug/ops purposes (comma-separated list)
    const whitelist = (process.env.AUTH_WHITELIST || '').split(',').map(s => s.trim()).filter(Boolean)
    if (whitelist.includes(req.ip)) return true
    return false
  },
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
  const corsOptions = buildCorsOptions()
  logger.info(`✅ CORS allowed origins: ${JSON.stringify(corsOptions === null ? 'none' : getFrontendUrl())}`)
  app.use(cors(corsOptions))

  // 3. Global Rate Limiting
  app.use(globalLimiter)

  logger.info('✅ Security middleware initialized: Helmet + CORS + Rate Limiting')
}

// ============================================================================
// 5. EXPORT LIMITERS FOR SPECIFIC ROUTES
// ============================================================================

// Ya están exportadas arriba, no necesitan re-export
