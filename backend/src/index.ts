import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import apiRoutes from './routes/api.js'
import authRoutes from './routes/auth.js'
import paymentRoutes from './routes/payments.js'
import webhookRoutes from './routes/webhooks.js'
import { initializeDatabase } from './db/init.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { initializeSecurityMiddleware, authLimiter, paymentLimiter } from './middleware/security.js'
import { logger } from './utils/logger.js'

// Force DigitalOcean rebuild - Database initialization v3
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = Number(process.env.PORT || 3000)

// ============================================================================
// SECURITY MIDDLEWARE (MUST BE FIRST)
// ============================================================================
initializeSecurityMiddleware(app)

// ============================================================================
// BODY PARSER MIDDLEWARE
// ============================================================================
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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

// Auth routes
app.use('/auth', authRoutes)

// Payment routes
app.use('/api/payments', paymentRoutes)

// Webhook routes
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
