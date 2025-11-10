import express from 'express'
import dotenv from 'dotenv'
import apiRoutes from './routes/api.js'

// Force Railway rebuild - Manual CORS headers v2
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Add custom CORS headers manually - Override any Railway proxy headers
app.use((req, res, next) => {
  const origin = req.headers.origin || '*'
  
  // Always respond with the requesting origin, never railway.com
  res.header('Access-Control-Allow-Origin', origin === 'https://railway.com' ? '*' : origin)
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Credentials', 'false')
  res.header('Vary', 'Origin')
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

// Rutas
app.use('/api', apiRoutes)

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Bufete Jurídico Backend',
    version: '1.0.0',
    status: 'running',
  })
})

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
  console.log(`🔗 CORS enabled for all origins`)
  console.log(`🤖 OpenAI integration: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`)
})

export default app
