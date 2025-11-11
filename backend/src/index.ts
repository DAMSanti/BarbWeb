import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import apiRoutes from './routes/api.js'
import authRoutes from './routes/auth.js'
import { initializeDatabase } from './db/init.js'

// Force DigitalOcean rebuild - Database initialization v3
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = Number(process.env.PORT || 3000)

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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

// Auth routes
app.use('/auth', authRoutes)

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

// Error handling - Al final
app.use((_err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', _err)
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  })
})

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`)
  console.log(`🔗 CORS enabled for all origins`)
  console.log(`🤖 Gemini AI integration: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured'}`)
  console.log(`🔐 JWT Authentication: ✅ Configured (JWT + OAuth2)`)
  
  // Initialize database
  const dbReady = await initializeDatabase()
  if (!dbReady) {
    console.error('❌ Failed to initialize database')
    process.exit(1)
  }
  
  console.log(`💾 Database: ✅ Connected`)
  console.log(`📁 Serving frontend from: ${frontendPath}`)
})

export default app
