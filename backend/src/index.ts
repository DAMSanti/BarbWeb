import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import apiRoutes from './routes/api.js'
import authRoutes from './routes/auth.js'
import paymentRoutes from './routes/payments.js'
import webhookRoutes from './routes/webhooks.js'
import { initializeDatabase } from './db/init.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { logger } from './utils/logger.js'

// Force DigitalOcean rebuild - Database initialization v3
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = Number(process.env.PORT || 3000)

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

// Helmet.js - Security Headers (CSRF, XSS, Clickjacking protection, etc)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.stripe.com', 'https://js.stripe.com'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },
}))

// Rate Limiting - Proteger contra brute force y DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 requests por IP cada 15 minutos
  message: 'Demasiadas solicitudes, intenta más tarde',
  standardHeaders: true, // Retorna info de rate limit en headers
  legacyHeaders: false, // Deshabilita X-RateLimit-* headers
  skip: (req) => {
    // No aplicar rate limit a health check
    return req.path === '/'
  },
})

// Rate limiting más estricto para auth (login, register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 intentos por IP cada 15 minutos
  message: 'Demasiados intentos de login. Intenta más tarde.',
  skipSuccessfulRequests: true, // No contar requests exitosos
})

// Rate limiting estricto para pagos
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 50, // Máximo 50 requests por IP cada hora
  message: 'Demasiadas transacciones. Intenta más tarde.',
})

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Aplicar rate limiting global
app.use(limiter)

// Add custom CORS headers manually - Override any Railway proxy headers
app.use((_req, res, next) => {
  const origin = _req.headers.origin || '*'
  
  // Always respond with the requesting origin, never railway.com
  res.header('Access-Control-Allow-Origin', origin === 'https://railway.com' ? '*' : origin)
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Credentials', 'false')
  res.header('Vary', 'Origin')
  
  if (_req.method === 'OPTIONS') {
    res.sendStatus(200)
    return
  }
  next()
})

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Bufete Jurídico Backend',
    version: '1.0.0',
    status: 'running',
  })
})

// Rutas de la API - ANTES que las rutas estáticas
app.use('/api', apiRoutes)

// Auth routes - Con rate limiting más estricto
app.use('/auth', authLimiter, authRoutes)

// Payment routes - Con rate limiting para pagos
app.use('/api/payments', paymentLimiter, paymentRoutes)

// Webhook routes - SIN rate limiting (confiamos en Stripe)
app.use('/webhooks', webhookRoutes)

// Servir archivos estáticos del frontend en /barbweb2
// En producción, el backend/dist está en /workspace/backend/dist, así que ../../../ nos lleva a /workspace/frontend/dist
// En desarrollo local, la ruta relativa también funciona
const frontendPath = process.env.NODE_ENV === 'production' 
  ? path.resolve('/workspace/frontend/dist')
  : path.join(__dirname, '../../../frontend/dist')

// Servir archivos estáticos (CSS, JS, imágenes)
app.use('/barbweb2', express.static(frontendPath, {
  index: false, // No servir index.html automáticamente
  setHeaders: (res) => {
    res.set('Cache-Control', 'public, max-age=3600')
  }
}))

// Catch-all para SPA - Cualquier ruta bajo /barbweb2 que no sea un archivo estático
// debe redirigir al index.html para que React Router funcione
app.get('/barbweb2/*', (req, res) => {
  const indexPath = path.join(frontendPath, 'index.html')
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err)
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
app.listen(PORT, '0.0.0.0', async () => {
  logger.info(`✅ Server running on http://0.0.0.0:${PORT}`)
  logger.info(`🔗 CORS enabled for all origins`)
  logger.info(`🛡️  Helmet.js: ✅ Security headers configured`)
  logger.info(`⏱️  Rate Limiting: ✅ Configured (100 req/15min global, 5 req/15min auth, 50 req/1h payments)`)
  logger.info(`🤖 Gemini AI integration: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured'}`)
  logger.info(`🔐 JWT Authentication: ✅ Configured (JWT + OAuth2)`)
  logger.info(`📝 Logging: ✅ Winston logger configured`)
  logger.info(`✔️ Validation: ✅ Zod schemas ready`)
  
  // Initialize database
  logger.info('🔄 Initializing database tables...')
  const dbReady = await initializeDatabase()
  if (!dbReady) {
    logger.error('❌ Failed to initialize database')
    process.exit(1)
  }
  
  logger.info(`💾 Database: ✅ Connected and initialized`)
  logger.info(`📁 Serving frontend from: ${frontendPath}`)
})

export default app
