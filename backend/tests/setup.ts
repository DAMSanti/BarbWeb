/**
 * Test Setup File
 * Configura el entorno global para todos los tests
 */

import { vi } from 'vitest'

// Mock environment variables for tests
process.env.JWT_SECRET = 'test-jwt-secret-32-characters-long'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-32-chars-long'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/barbweb_test'
process.env.NODE_ENV = 'test'
process.env.GEMINI_API_KEY = 'test-gemini-key'
process.env.STRIPE_SECRET_KEY = 'sk_test_test'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
process.env.VITE_FRONTEND_URL = 'http://localhost:5173'

// Suppress console output during tests (optional)
// vi.spyOn(console, 'log').mockImplementation(() => {})
// vi.spyOn(console, 'warn').mockImplementation(() => {})
// vi.spyOn(console, 'error').mockImplementation(() => {})

export {}
