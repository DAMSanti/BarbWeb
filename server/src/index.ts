import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import apiRoutes from './routes/api.js'

// Force Railway rebuild - Manual CORS headers v2
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

// Servir archivos estáticos del frontend en /barbweb2
const frontendPath = path.join(__dirname, '../../dist')
app.use('/barbweb2', express.static(frontendPath))

// Rutas de la API
app.use('/api', apiRoutes)

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Bufete Jurídico Backend',
    version: '1.0.0',
    status: 'running',
  })
})

// Catch-all para SPA - Cualquier ruta bajo /barbweb2 que no sea un archivo
// debe redirigir al index.html para que React Router funcione
app.get('/barbweb2/*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'))
})

// Error handling
app.use((_err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', _err)
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  })
})

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`)
  console.log(`🔗 CORS enabled for all origins`)
  console.log(`🤖 OpenAI integration: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`)
  console.log(`📁 Serving frontend from: ${frontendPath}`)
})

export default app
