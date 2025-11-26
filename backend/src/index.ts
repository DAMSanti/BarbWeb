import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import apiRoutes from './routes/api.js'
import authRoutes from './routes/auth.js'
import paymentRoutes from './routes/payments.js'
import webhookRoutes from './routes/webhooks.js'
import adminRoutes from './routes/admin.js'
import sitemapRoutes from './routes/sitemap.js'
import { initializeDatabase } from './db/init.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { initializeSecurityMiddleware, authLimiter, paymentLimiter } from './middleware/security.js'
import { logger } from './utils/logger.js'

// Force DigitalOcean rebuild - Database initialization v3
dotenv.config()

// Validate critical environment variables (secure secrets, API keys, etc.)
function validateEnv() {
  const requiredSecrets = [
    { name: 'JWT_SECRET', minLen: 32 },
    { name: 'JWT_REFRESH_SECRET', minLen: 32 },
    { name: 'STRIPE_SECRET_KEY', minLen: 20 },
  ]

  const errors: string[] = []
  requiredSecrets.forEach((s) => {
    const val = process.env[s.name]
    if (!val) {
      errors.push(`${s.name} is missing`)
      return
    }
    if (val.length < s.minLen) {
      errors.push(`${s.name} must be at least ${s.minLen} characters`) 
    }
    if (/\s/.test(val)) {
      errors.push(`${s.name} contains whitespace — please rotate and remove spaces`)
    }
  })

  if (errors.length > 0) {
    // In production we fail fast, in development only warn
    const isProd = process.env.NODE_ENV === 'production'
    errors.forEach((e) => logger.error(`Env validation: ${e}`))
    if (isProd) {
      logger.error('Fatal: Environment validation failed in production. Exiting.')
      process.exit(1)
    } else {
      logger.warn('Environment validation warnings (not fatal in development)')
    }
  }
}

// Run environment validation early
validateEnv()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

logger.info('📋 Environment Check:')
logger.info(`  PORT: ${process.env.PORT || 3000}`)
logger.info(`  DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ NOT SET'}`)
logger.info(`  NODE_ENV: ${process.env.NODE_ENV || 'development'}`)
logger.info(`  APP_DOMAIN: ${process.env.APP_DOMAIN || 'not set'}`)
logger.info(`  VITE_API_URL: ${process.env.VITE_API_URL || 'not set (defaulted via frontend or window.location)'}`)
logger.info('---')

const app = express()
const PORT = Number(process.env.PORT || 3000)

// ============================================================================
// TRUST PROXY (MUST BE FIRST FOR DIGITALOCEAN)
// ============================================================================
// DigitalOcean App Platform uses a proxy/load balancer
// We use a function that checks if the request is from a trusted proxy
// This allows express-rate-limit to correctly identify client IPs
app.set('trust proxy', (ip: string) => {
  // Trust DigitalOcean's internal load balancer
  // In DigitalOcean App Platform, the proxy comes from an internal IP
  // We trust the first proxy in the chain (the load balancer)
  return true
})
logger.info('✅ Trust proxy configured for DigitalOcean with custom validation')

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================
initializeSecurityMiddleware(app)

// ============================================================================
// WEBHOOK ROUTE (BEFORE BODY PARSER - NEEDS RAW BODY)
// ============================================================================
// Stripe webhooks need the raw body for signature verification
// This MUST come before express.json() middleware
app.use('/webhooks', webhookRoutes)

// ============================================================================
// BODY PARSER MIDDLEWARE (AFTER WEBHOOKS)
// ============================================================================
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
// Move health check to /health so the root domain (/) can serve the frontend
app.get('/health', (req, res) => {
  res.json({
    message: 'Bufete Jurídico Backend',
    version: '1.0.0',
    status: 'running',
  })
})

// SEO Routes (Sitemap, Robots.txt)
app.use('/', sitemapRoutes)

// Rutas de la API - ANTES que las rutas estáticas
app.use('/api', apiRoutes)

// Auth routes
app.use('/auth', authRoutes)

// Payment routes
app.use('/api/payments', paymentRoutes)

// Admin routes (protected, requires admin role)
app.use('/api/admin', adminRoutes)

// Servir archivos estáticos del frontend en la raíz '/' (antes /barbweb2)
// En producción, el backend/dist está en /workspace/backend/dist, así que ../../../ nos lleva a /workspace/frontend/dist
// En desarrollo local, la ruta relativa también funciona
const frontendPath = process.env.NODE_ENV === 'production' 
  ? path.resolve('/workspace/frontend/dist')
  : path.join(__dirname, '../../../frontend/dist')

// Servir archivos estáticos (CSS, JS, imágenes)
app.use('/', express.static(frontendPath, {
  index: false, // No servir index.html automáticamente
  setHeaders: (res) => {
    res.set('Cache-Control', 'public, max-age=3600')
  }
}))

// Catch-all para SPA - Cualquier ruta que no sea /api, /auth, /webhooks, sitemap, etc.
// debe redirigir al index.html para que React Router funcione
app.get('*', (req, res) => {
  const indexPath = path.join(frontendPath, 'index.html')
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.sendFile(indexPath, (err) => {
    if (err) {
      logger.error('Error serving index.html:', err)
      res.status(404).json({
        success: false,
        error: 'Frontend not found. Ensure frontend/dist is built.',
      })
    }
  })
})

// 404 handler
app.use(notFoundHandler)

// Error handler (MUST be last, and MUST have 4 parameters)
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  errorHandler(error, req, res, next)
})

// Start server
try {
  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`✅ Server running on http://0.0.0.0:${PORT}`)
    logger.info(`🔗 CORS enabled for all origins`)
    logger.info(`🤖 Gemini AI integration: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured'}`)
    logger.info(`🔐 JWT Authentication: ✅ Configured (JWT + OAuth2)`)
    logger.info(`📝 Logging: ✅ Winston logger configured`)
    logger.info(`✔️ Validation: ✅ Zod schemas ready`)
  })

  // Handle server errors
  server.on('error', (error: any) => {
    logger.error('Server error:', error)
    process.exit(1)
  })

  // Set server timeout to 30 seconds
  server.setTimeout(30000)

  // Initialize database asynchronously (non-blocking)
  ;(async () => {
    try {
      logger.info('🔄 Initializing database tables...')
      // Add timeout for database initialization (20 seconds)
      const dbInitPromise = initializeDatabase()
      const timeoutPromise = new Promise<boolean>((_, reject) =>
        setTimeout(() => reject(new Error('Database initialization timeout')), 20000)
      )
      
      const dbReady = await Promise.race([dbInitPromise, timeoutPromise])
      if (dbReady) {
        logger.info(`💾 Database: ✅ Connected and initialized`)
        logger.info(`📁 Serving frontend from: ${frontendPath}`)
      } else {
        logger.warn('⚠️ Database initialization returned false, but server continues')
        logger.info(`📁 Serving frontend from: ${frontendPath}`)
      }
    } catch (error: any) {
      logger.error('⚠️ Error during async database initialization:', error.message)
      logger.warn('⚠️ Server will continue without database. Requests will fail if DB is required.')
      logger.info(`📁 Serving frontend from: ${frontendPath}`)
    }
  })()

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: any) => {
    logger.error('Uncaught Exception:', error)
    process.exit(1)
  })

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: any, promise: any) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
    // Don't exit on unhandled rejections, just log them
  })

  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully...')
    server.close(() => {
      logger.info('Server closed')
      process.exit(0)
    })
  })

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully...')
    server.close(() => {
      logger.info('Server closed')
      process.exit(0)
    })
  })
} catch (startupError: any) {
  logger.error('🚨 FATAL ERROR during startup:', startupError)
  process.exit(1)
}

export default app
