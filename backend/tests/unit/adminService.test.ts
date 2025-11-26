/**
 * Unit Tests - Admin Service
 * Tests para getUsers, updateUserRole, getPayments, refundPayment, getAnalytics
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Crear un Decimal mock que se comporta como el Decimal real
class MockDecimal {
  constructor(private value: number) {}
  toNumber() {
    return this.value
  }
}

// Use hoisted to define mocks BEFORE module import
const { mockPrisma } = vi.hoisted(() => {
  const mockPrisma = {
    user: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    payment: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      aggregate: vi.fn(),
    },
  }
  return { mockPrisma }
})

vi.mock('../../src/db/init.js', () => ({
  getPrismaClient: () => mockPrisma,
}))

vi.mock('../../src/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

// Import AFTER mocks are defined
import * as adminService from '../../src/services/adminService'

// ============================================
// USER MANAGEMENT TESTS
// ============================================

describe('Admin Service - User Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUsers', () => {
    it('should return paginated users with default options', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
          emailVerified: true,
          lastLogin: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { payments: 5, customAgents: 0, oauthAccounts: 0 },
        },
        {
          id: '2',
          email: 'user@example.com',
          name: 'Regular User',
          role: 'user',
          emailVerified: true,
          lastLogin: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { payments: 2, customAgents: 0, oauthAccounts: 0 },
        },
      ]

      mockPrisma.user.count.mockResolvedValue(2)
      mockPrisma.user.findMany.mockResolvedValue(mockUsers)

      const result = await adminService.getUsers({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      expect(result.data).toHaveLength(2)
      expect(result.pagination.total).toBe(2)
      expect(result.pagination.totalPages).toBe(1)
      expect(result.data[0].role).toBe('admin')
    })

    it('should filter users by role', async () => {
      mockPrisma.user.count.mockResolvedValue(1)
      mockPrisma.user.findMany.mockResolvedValue([
        {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
          emailVerified: true,
          lastLogin: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { payments: 0, customAgents: 0, oauthAccounts: 0 },
        },
      ])

      const result = await adminService.getUsers({
        page: 1,
        limit: 10,
        role: 'admin',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      expect(result.data).toHaveLength(1)
      expect(result.data[0].role).toBe('admin')
    })

    it('should handle pagination correctly', async () => {
      mockPrisma.user.count.mockResolvedValue(25)
      mockPrisma.user.findMany.mockResolvedValue(Array(10).fill({
        id: '1',
        email: 'user@example.com',
        name: 'User',
        role: 'user',
        emailVerified: true,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { payments: 0, customAgents: 0, oauthAccounts: 0 },
      }))

      const result = await adminService.getUsers({
        page: 2,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      expect(result.pagination.page).toBe(2)
      expect(result.pagination.limit).toBe(10)
      expect(result.pagination.total).toBe(25)
      expect(result.pagination.totalPages).toBe(3)
    })
  })

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        name: 'Test User',
        role: 'user',
        emailVerified: true,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { payments: 0, customAgents: 0, oauthAccounts: 0 },
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await adminService.getUserById('1')

      expect(result).toEqual(mockUser)
      expect(result.id).toBe('1')
    })

    it('should throw error if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      await expect(adminService.getUserById('nonexistent')).rejects.toThrow('not found')
    })
  })

  describe('updateUserRole', () => {
    it('should validate role values', async () => {
      await expect(adminService.updateUserRole('1', 'invalid_role')).rejects.toThrow('Invalid role')
    })

    it('should update user role to lawyer', async () => {
      const updatedUser = {
        id: '1',
        email: 'user@example.com',
        name: 'Test User',
        role: 'lawyer',
        updatedAt: new Date(),
      }

      mockPrisma.user.update.mockResolvedValue(updatedUser)

      const result = await adminService.updateUserRole('1', 'lawyer')

      expect(result.role).toBe('lawyer')
    })

    it('should throw error if user not found', async () => {
      mockPrisma.user.update.mockRejectedValue(new Error('User not found'))

      await expect(adminService.updateUserRole('nonexistent', 'lawyer')).rejects.toThrow()
    })
  })

  describe('deleteUser', () => {
    it('should delete user by ID', async () => {
      mockPrisma.user.delete.mockResolvedValue({
        id: '1',
        email: 'user@example.com',
        name: 'Test User',
      })

      const result = await adminService.deleteUser('1')

      expect(result.id).toBe('1')
    })

    it('should throw error if user not found', async () => {
      mockPrisma.user.delete.mockRejectedValue(new Error('User not found'))

      await expect(adminService.deleteUser('nonexistent')).rejects.toThrow()
    })
  })
})

// ============================================
// PAYMENT MANAGEMENT TESTS
// ============================================

describe('Admin Service - Payment Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPayments', () => {
    it('should return paginated payments', async () => {
      const mockPayments = [
        {
          id: '1',
          userId: '1',
          user: { email: 'user@example.com', name: 'User' },
          stripeSessionId: 'session_123',
          amount: new MockDecimal(100),
          currency: 'usd',
          status: 'succeeded',
          question: 'How to sue?',
          category: 'Litigation',
          refundedAmount: new MockDecimal(0),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.payment.count.mockResolvedValue(1)
      mockPrisma.payment.findMany.mockResolvedValue(mockPayments)
      mockPrisma.payment.aggregate
        .mockResolvedValueOnce({ _count: 1, _sum: { amount: new MockDecimal(100) } })
        .mockResolvedValueOnce({ _count: 0, _sum: { refundedAmount: new MockDecimal(0) } })

      const result = await adminService.getPayments({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      expect(result.data).toHaveLength(1)
      expect(result.data[0].status).toBe('succeeded')
    })

    it('should filter payments by status', async () => {
      mockPrisma.payment.count.mockResolvedValue(1)
      mockPrisma.payment.findMany.mockResolvedValue([
        {
          id: '1',
          userId: '1',
          user: { email: 'user@example.com', name: 'User' },
          stripeSessionId: 'session_123',
          amount: new MockDecimal(100),
          currency: 'usd',
          status: 'succeeded',
          question: 'How to sue?',
          category: 'Litigation',
          refundedAmount: new MockDecimal(0),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
      mockPrisma.payment.aggregate
        .mockResolvedValueOnce({ _count: 1, _sum: { amount: new MockDecimal(100) } })
        .mockResolvedValueOnce({ _count: 0, _sum: { refundedAmount: new MockDecimal(0) } })

      const result = await adminService.getPayments({
        page: 1,
        limit: 10,
        status: 'succeeded',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      expect(result.data[0].status).toBe('succeeded')
    })
  })

  describe('getPaymentDetail', () => {
    it('should return payment details', async () => {
      const mockPayment = {
        id: '1',
        userId: '1',
        user: {
          id: '1',
          email: 'user@example.com',
          name: 'User',
          role: 'user',
        },
        stripeSessionId: 'session_123',
        amount: new MockDecimal(100),
        currency: 'usd',
        status: 'succeeded',
        question: 'How to sue?',
        category: 'Litigation',
        consultationSummary: 'Summary text',
        refundedAmount: new MockDecimal(0),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.payment.findUnique.mockResolvedValue(mockPayment)

      const result = await adminService.getPaymentDetail('1')

      expect(result).toBeDefined()
      expect(result.id).toBe('1')
    })

    it('should throw error if payment not found', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(null)

      await expect(adminService.getPaymentDetail('nonexistent')).rejects.toThrow('not found')
    })
  })

  describe('refundPayment', () => {
    it('should refund a successful payment', async () => {
      const originalPayment = {
        id: '1',
        amount: new MockDecimal(100),
        status: 'succeeded',
        refundedAmount: new MockDecimal(0),
      }

      const refundedPayment = {
        ...originalPayment,
        status: 'refunded',
        refundedAmount: new MockDecimal(100),
        user: { email: 'user@example.com', name: 'User' },
      }

      mockPrisma.payment.findUnique.mockResolvedValue(originalPayment)
      mockPrisma.payment.update.mockResolvedValue(refundedPayment)

      const result = await adminService.refundPayment('1', 'Customer request')

      expect(result.status).toBe('refunded')
    })

    it('should not refund already refunded payment', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: '1',
        amount: new MockDecimal(100),
        status: 'refunded',
        refundedAmount: new MockDecimal(100),
      })

      await expect(adminService.refundPayment('1')).rejects.toThrow()
    })

    it('should throw error if payment not found', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(null)

      await expect(adminService.refundPayment('nonexistent')).rejects.toThrow('not found')
    })
  })
})

// ============================================
// ANALYTICS TESTS
// ============================================

describe('Admin Service - Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAnalytics', () => {
    it('should return analytics summary', async () => {
      mockPrisma.user.count.mockResolvedValue(10)
      mockPrisma.payment.count.mockResolvedValue(5)
      mockPrisma.payment.aggregate
        .mockResolvedValueOnce({ _sum: { amount: new MockDecimal(500) } })
        .mockResolvedValueOnce({ _avg: { amount: new MockDecimal(100) } })
        .mockResolvedValueOnce({ _sum: { amount: new MockDecimal(200) } })

      mockPrisma.payment.findMany.mockResolvedValue([])

      const result = await adminService.getAnalytics({
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
      })

      expect(result).toHaveProperty('totalRevenue')
      expect(result).toHaveProperty('totalPayments')
      expect(result).toHaveProperty('averagePayment')
      expect(result).toHaveProperty('activeUsers')
      expect(result.totalPayments).toBe(5)
      expect(result.activeUsers).toBe(10)
    })

    it('should handle date range filtering', async () => {
      mockPrisma.user.count.mockResolvedValue(5)
      mockPrisma.payment.count.mockResolvedValue(2)
      mockPrisma.payment.aggregate
        .mockResolvedValueOnce({ _sum: { amount: new MockDecimal(200) } })
        .mockResolvedValueOnce({ _avg: { amount: new MockDecimal(100) } })
        .mockResolvedValueOnce({ _sum: { amount: new MockDecimal(0) } })
      mockPrisma.payment.findMany.mockResolvedValue([])

      const result = await adminService.getAnalytics({
        startDate: new Date('2025-11-01'),
        endDate: new Date('2025-11-30'),
      })

      expect(result.totalPayments).toBe(2)
    })
  })

  describe('getAnalyticsTrend', () => {
    it('should return trend data grouped by day', async () => {
      mockPrisma.payment.findMany.mockResolvedValue([
        {
          amount: new MockDecimal(100),
          createdAt: new Date('2025-11-26'),
        },
        {
          amount: new MockDecimal(200),
          createdAt: new Date('2025-11-27'),
        },
      ])
      mockPrisma.user.findMany.mockResolvedValue([
        {
          createdAt: new Date('2025-11-26'),
        },
      ])
      mockPrisma.user.count.mockResolvedValue(1)

      const result = await adminService.getAnalyticsTrend(
        'day',
        new Date('2025-11-01'),
        new Date('2025-11-30'),
      )

      expect(result).toBeDefined()
      expect(result).toHaveProperty('trend')
      expect(result).toHaveProperty('summary')
      expect(Array.isArray(result.trend)).toBe(true)
    })

    it('should support weekly grouping', async () => {
      mockPrisma.payment.findMany.mockResolvedValue([
        {
          amount: new MockDecimal(500),
          createdAt: new Date('2025-11-24'),
        },
      ])
      mockPrisma.user.findMany.mockResolvedValue([])
      mockPrisma.user.count.mockResolvedValue(5)

      const result = await adminService.getAnalyticsTrend(
        'week',
        new Date('2025-11-01'),
        new Date('2025-11-30'),
      )

      expect(result).toBeDefined()
      expect(result).toHaveProperty('trend')
      expect(result).toHaveProperty('summary')
    })

    it('should support monthly grouping', async () => {
      mockPrisma.payment.findMany.mockResolvedValue([
        {
          amount: new MockDecimal(1000),
          createdAt: new Date('2025-11-15'),
        },
      ])
      mockPrisma.user.findMany.mockResolvedValue([])
      mockPrisma.user.count.mockResolvedValue(10)

      const result = await adminService.getAnalyticsTrend(
        'month',
        new Date('2025-01-01'),
        new Date('2025-12-31'),
      )

      expect(result).toBeDefined()
      expect(result).toHaveProperty('trend')
      expect(result).toHaveProperty('summary')
    })
  })
})
