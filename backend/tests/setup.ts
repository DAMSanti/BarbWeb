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

// Mock Prisma client to avoid DB connection during build
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(() => Promise.resolve(0)),
    },
    payment: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(() => Promise.resolve(0)),
    },
    consultation: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(() => Promise.resolve(0)),
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  })),
}))

// Suppress console output during tests (optional)
// vi.spyOn(console, 'log').mockImplementation(() => {})
// vi.spyOn(console, 'warn').mockImplementation(() => {})
// vi.spyOn(console, 'error').mockImplementation(() => {})

export {}
