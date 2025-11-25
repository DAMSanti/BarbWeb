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

// In-memory data store for mocking
const dataStore = {
  users: new Map<string, any>(),
  payments: new Map<string, any>(),
  consultations: new Map<string, any>(),
}

// Helper to generate IDs
let userIdCounter = 1
let paymentIdCounter = 1
let consultationIdCounter = 1

// Mock Prisma client with full functionality
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => {
    return {
      user: {
        create: vi.fn(async ({ data }: any) => {
          const id = `user_${userIdCounter++}`
          const user = { id, ...data, createdAt: new Date(), updatedAt: new Date() }
          dataStore.users.set(id, user)
          return user
        }),
        findUnique: vi.fn(async ({ where }: any) => {
          if (where.id) return dataStore.users.get(where.id) || null
          if (where.email) {
            for (const user of dataStore.users.values()) {
              if (user.email === where.email) return user
            }
          }
          return null
        }),
        findMany: vi.fn(async (params: any = {}) => {
          const { where = {}, skip = 0, take = 10, orderBy, select } = params
          let results = Array.from(dataStore.users.values())
          
          if (where?.role) {
            results = results.filter(u => u.role === where.role)
          }
          
          // Handle OR conditions for search (email or name contains)
          if (where?.OR) {
            results = results.filter(u => {
              return where.OR.some((condition: any) => {
                if (condition.email?.contains) {
                  return u.email?.toLowerCase().includes(condition.email.contains.toLowerCase())
                }
                if (condition.name?.contains) {
                  return u.name?.toLowerCase().includes(condition.name.contains.toLowerCase())
                }
                return false
              })
            })
          }
          
          if (where?.email?.contains) {
            results = results.filter(u => u.email?.toLowerCase().includes(where.email.contains.toLowerCase()))
          }
          
          // Add _count if requested in select
          const processed = results.slice(skip, skip + take).map(u => {
            const user: any = u
            if (select?._count) {
              user._count = { payments: 0 } // Mock payment count
            }
            return user
          })
          
          return processed
        }),
        update: vi.fn(async ({ where, data }: any) => {
          const user = dataStore.users.get(where.id)
          if (!user) throw new Error('User not found')
          const updated = { ...user, ...data, updatedAt: new Date() }
          dataStore.users.set(where.id, updated)
          return updated
        }),
        delete: vi.fn(async ({ where }: any) => {
          const user = dataStore.users.get(where.id)
          if (!user) throw new Error('User not found')
          dataStore.users.delete(where.id)
          return user
        }),
        deleteMany: vi.fn(async () => {
          // When users are deleted, also delete their payments (cascade)
          const userIds = Array.from(dataStore.users.keys())
          for (const paymentId of dataStore.payments.keys()) {
            const payment = dataStore.payments.get(paymentId)
            if (payment && userIds.includes(payment.userId)) {
              dataStore.payments.delete(paymentId)
            }
          }
          dataStore.users.clear()
          return { count: dataStore.users.size }
        }),
        count: vi.fn(async ({ where }: any) => {
          if (!where) return dataStore.users.size
          let count = 0
          for (const user of dataStore.users.values()) {
            if (where.role && user.role !== where.role) continue
            
            if (where.OR) {
              const matches = where.OR.some((condition: any) => {
                if (condition.email?.contains) {
                  return user.email?.toLowerCase().includes(condition.email.contains.toLowerCase())
                }
                if (condition.name?.contains) {
                  return user.name?.toLowerCase().includes(condition.name.contains.toLowerCase())
                }
                return false
              })
              if (!matches) continue
            }
            count++
          }
          return count
        }),
      },
      payment: {
        create: vi.fn(async ({ data }: any) => {
          const id = `payment_${paymentIdCounter++}`
          const payment = { 
            id, 
            ...data,
            refundedAmount: data.refundedAmount || 0,
            amount: { toNumber: () => typeof data.amount === 'number' ? data.amount : parseFloat(data.amount) },
            createdAt: new Date(), 
            updatedAt: new Date() 
          }
          dataStore.payments.set(id, payment)
          return payment
        }),
        findUnique: vi.fn(async ({ where }: any) => {
          const p = dataStore.payments.get(where.id)
          if (!p) return null
          const user = dataStore.users.get(p.userId)
          return { 
            ...p, 
            amount: { toNumber: () => typeof p.amount === 'number' ? p.amount : parseFloat(p.amount?.toString?.() || '0') },
            refundedAmount: p.refundedAmount || 0,
            user: user ? { email: user.email, name: user.name } : null
          }
        }),
        findMany: vi.fn(async (params: any = {}) => {
          const { where = {}, skip = 0, take = 10, select, orderBy } = params
          let results = Array.from(dataStore.payments.values())
          
          if (where?.userId) {
            results = results.filter(p => p.userId === where.userId)
          }
          if (where?.status) {
            results = results.filter(p => p.status === where.status)
          }
          if (where?.createdAt?.gte) {
            results = results.filter(p => new Date(p.createdAt) >= where.createdAt.gte)
          }
          if (where?.createdAt?.lte) {
            results = results.filter(p => new Date(p.createdAt) <= where.createdAt.lte)
          }
          
          // Add related user data if select includes it
          const processed = results.slice(skip, skip + take).map(p => {
            const payment: any = {
              ...p,
              refundedAmount: p.refundedAmount || 0,
              amount: { toNumber: () => typeof p.amount === 'number' ? p.amount : parseFloat(p.amount?.toString?.() || '0') }
            }
            
            if (select?.user) {
              const user = dataStore.users.get(p.userId)
              payment.user = user ? { email: user.email, name: user.name } : null
            }
            
            return payment
          })
          
          return processed
        }),
        update: vi.fn(async ({ where, data, include, select }: any) => {
          const payment = dataStore.payments.get(where.id)
          if (!payment) throw new Error('Payment not found')
          const updated = { ...payment, ...data, updatedAt: new Date(), refundedAmount: payment.refundedAmount || 0 }
          dataStore.payments.set(where.id, updated)
          const user = dataStore.users.get(updated.userId)
          
          const result: any = {
            ...updated,
            amount: { toNumber: () => typeof updated.amount === 'number' ? updated.amount : parseFloat(updated.amount?.toString?.() || '0') },
          }
          
          // Handle include for relations
          if (include?.user || select?.user) {
            result.user = user ? { email: user.email, name: user.name } : null
          }
          
          return result
        }),
        delete: vi.fn(async ({ where }: any) => {
          const payment = dataStore.payments.get(where.id)
          if (!payment) throw new Error('Payment not found')
          dataStore.payments.delete(where.id)
          return payment
        }),
        deleteMany: vi.fn(async () => {
          const count = dataStore.payments.size
          dataStore.payments.clear()
          return { count }
        }),
        count: vi.fn(async ({ where }: any) => {
          if (!where) return dataStore.payments.size
          let count = 0
          for (const payment of dataStore.payments.values()) {
            if (where.userId && payment.userId !== where.userId) continue
            if (where.status && payment.status !== where.status) continue
            if (where.createdAt?.gte && new Date(payment.createdAt) < where.createdAt.gte) continue
            if (where.createdAt?.lte && new Date(payment.createdAt) > where.createdAt.lte) continue
            count++
          }
          return count
        }),
        aggregate: vi.fn(async ({ where = {}, _sum, _avg, _count }: any) => {
          let payments = Array.from(dataStore.payments.values())
          
          if (where.userId) {
            payments = payments.filter(p => p.userId === where.userId)
          }
          if (where.status) {
            payments = payments.filter(p => p.status === where.status)
          }
          
          const result: any = {}
          if (_count) {
            result._count = payments.length
          }
          if (_sum?.amount) {
            result._sum = { amount: payments.reduce((sum, p) => sum + (typeof p.amount === 'number' ? p.amount : parseFloat(p.amount?.toString?.() || '0')), 0) }
          }
          if (_sum?.refundedAmount) {
            result._sum = result._sum || {}
            result._sum.refundedAmount = payments.reduce((sum, p) => sum + (p.refundedAmount || 0), 0)
          }
          if (_avg?.amount) {
            const total = payments.reduce((sum, p) => sum + (typeof p.amount === 'number' ? p.amount : parseFloat(p.amount?.toString?.() || '0')), 0)
            result._avg = { amount: payments.length > 0 ? total / payments.length : 0 }
          }
          return result
        }),
      },
      consultation: {
        create: vi.fn(async ({ data }: any) => {
          const id = `consultation_${consultationIdCounter++}`
          const consultation = { id, ...data, createdAt: new Date(), updatedAt: new Date() }
          dataStore.consultations.set(id, consultation)
          return consultation
        }),
        findUnique: vi.fn(async ({ where }: any) => {
          return dataStore.consultations.get(where.id) || null
        }),
        findMany: vi.fn(async ({ where, skip = 0, take = 10 }: any) => {
          let results = Array.from(dataStore.consultations.values())
          
          if (where?.userId) {
            results = results.filter(c => c.userId === where.userId)
          }
          
          return results.slice(skip, skip + take)
        }),
        update: vi.fn(async ({ where, data }: any) => {
          const consultation = dataStore.consultations.get(where.id)
          if (!consultation) throw new Error('Consultation not found')
          const updated = { ...consultation, ...data, updatedAt: new Date() }
          dataStore.consultations.set(where.id, updated)
          return updated
        }),
        delete: vi.fn(async ({ where }: any) => {
          const consultation = dataStore.consultations.get(where.id)
          if (!consultation) throw new Error('Consultation not found')
          dataStore.consultations.delete(where.id)
          return consultation
        }),
        deleteMany: vi.fn(async () => {
          const count = dataStore.consultations.size
          dataStore.consultations.clear()
          return { count }
        }),
        count: vi.fn(async ({ where }: any) => {
          if (!where) return dataStore.consultations.size
          let count = 0
          for (const consultation of dataStore.consultations.values()) {
            if (where.userId && consultation.userId !== where.userId) continue
            count++
          }
          return count
        }),
      },
      $connect: vi.fn(async () => {}),
      $disconnect: vi.fn(async () => {}),
    }
  }),
}))

// Suppress console output during tests (optional)
// vi.spyOn(console, 'log').mockImplementation(() => {})
// vi.spyOn(console, 'warn').mockImplementation(() => {})
// vi.spyOn(console, 'error').mockImplementation(() => {})

export {}
