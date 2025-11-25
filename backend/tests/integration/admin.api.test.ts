/**
 * Admin API Integration Tests
 * Tests for RBAC, user management, payments, and analytics endpoints
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getPrismaClient } from '../../src/db/init'
import * as adminService from '../../src/services/adminService'

const prisma = getPrismaClient()

describe('Admin Service - RBAC and Management', () => {
  let adminUser: any
  let lawyerUser: any
  let normalUser1: any
  let normalUser2: any

  beforeEach(async () => {
    // Create test users
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        name: 'Admin User',
        role: 'admin',
        passwordHash: 'hashed_password',
      },
    })

    lawyerUser = await prisma.user.create({
      data: {
        email: 'lawyer@test.com',
        name: 'Lawyer User',
        role: 'lawyer',
        passwordHash: 'hashed_password',
      },
    })

    normalUser1 = await prisma.user.create({
      data: {
        email: 'user1@test.com',
        name: 'User One',
        role: 'user',
        passwordHash: 'hashed_password',
      },
    })

    normalUser2 = await prisma.user.create({
      data: {
        email: 'user2@test.com',
        name: 'User Two',
        role: 'user',
        passwordHash: 'hashed_password',
      },
    })
  })

  afterEach(async () => {
    // Clean up
    await prisma.payment.deleteMany()
    await prisma.user.deleteMany()
  })

  describe('User Management', () => {
    it('should get all users with pagination', async () => {
      const result = await adminService.getUsers({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      expect(result.data).toBeDefined()
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.limit).toBe(10)
      expect(result.pagination.total).toBeGreaterThanOrEqual(4)
    })

    it('should filter users by role', async () => {
      const result = await adminService.getUsers({
        page: 1,
        limit: 10,
        role: 'user',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      expect(result.data.every((u: any) => u.role === 'user')).toBe(true)
      expect(result.pagination.total).toBe(2) // 2 normal users
    })

    it('should search users by email', async () => {
      const result = await adminService.getUsers({
        page: 1,
        limit: 10,
        search: 'admin@test.com',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      expect(result.data.length).toBeGreaterThanOrEqual(1)
      expect(result.data[0].email).toBe('admin@test.com')
    })

    it('should search users by name', async () => {
      const result = await adminService.getUsers({
        page: 1,
        limit: 10,
        search: 'Lawyer',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      expect(result.data.length).toBeGreaterThanOrEqual(1)
      expect(result.data[0].name).toContain('Lawyer')
    })

    it('should get user by ID', async () => {
      const user = await adminService.getUserById(adminUser.id)

      expect(user.id).toBe(adminUser.id)
      expect(user.email).toBe('admin@test.com')
      expect(user.role).toBe('admin')
    })

    it('should throw error for non-existent user', async () => {
      await expect(adminService.getUserById('non-existent-id')).rejects.toThrow('User non-existent-id not found')
    })

    it('should update user role', async () => {
      const updated = await adminService.updateUserRole(normalUser1.id, 'lawyer')

      expect(updated.role).toBe('lawyer')

      const verify = await prisma.user.findUnique({
        where: { id: normalUser1.id },
      })
      expect(verify?.role).toBe('lawyer')
    })

    it('should throw error for invalid role', async () => {
      await expect(adminService.updateUserRole(normalUser1.id, 'invalid-role')).rejects.toThrow(
        'Invalid role',
      )
    })

    it('should delete user', async () => {
      const deleted = await adminService.deleteUser(normalUser1.id)

      expect(deleted.id).toBe(normalUser1.id)

      const verify = await prisma.user.findUnique({
        where: { id: normalUser1.id },
      })
      expect(verify).toBeNull()
    })

    it('should handle pagination correctly', async () => {
      const page1 = await adminService.getUsers({
        page: 1,
        limit: 2,
        sortBy: 'createdAt',
        sortOrder: 'asc',
      })

      const page2 = await adminService.getUsers({
        page: 2,
        limit: 2,
        sortBy: 'createdAt',
        sortOrder: 'asc',
      })

      expect(page1.data.length).toBeLessThanOrEqual(2)
      expect(page2.data.length).toBeLessThanOrEqual(2)
      expect(page1.pagination.totalPages).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Payment Management', () => {
    beforeEach(async () => {
      // Create test payments
      await prisma.payment.create({
        data: {
          userId: normalUser1.id,
          stripeSessionId: 'cs_test_1',
          amount: 50.0,
          currency: 'usd',
          status: 'succeeded',
          question: 'Test question 1',
          category: 'Laboral',
        },
      })

      await prisma.payment.create({
        data: {
          userId: normalUser1.id,
          stripeSessionId: 'cs_test_2',
          amount: 100.0,
          currency: 'usd',
          status: 'succeeded',
          question: 'Test question 2',
          category: 'Civil',
        },
      })

      await prisma.payment.create({
        data: {
          userId: normalUser2.id,
          stripeSessionId: 'cs_test_3',
          amount: 75.0,
          currency: 'usd',
          status: 'failed',
          question: 'Test question 3',
          category: 'Penal',
        },
      })
    })

    it('should get all payments with pagination', async () => {
      const result = await adminService.getPayments({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      expect(result.data).toBeDefined()
      expect(result.pagination.total).toBe(3)
    })

    it('should filter payments by status', async () => {
      const result = await adminService.getPayments({
        page: 1,
        limit: 10,
        status: 'succeeded',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      expect(result.data.every((p: any) => p.status === 'succeeded')).toBe(true)
      expect(result.pagination.total).toBe(2)
    })

    it('should filter payments by user', async () => {
      const result = await adminService.getPayments({
        page: 1,
        limit: 10,
        userId: normalUser1.id,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      expect(result.data.every((p: any) => p.userId === normalUser1.id)).toBe(true)
      expect(result.pagination.total).toBe(2)
    })

    it('should get payment detail', async () => {
      const payments = await prisma.payment.findMany({
        take: 1,
      })

      const payment = await adminService.getPaymentDetail(payments[0].id)

      expect(payment.id).toBe(payments[0].id)
      expect(payment.user).toBeDefined()
    })

    it('should throw error for non-existent payment', async () => {
      await expect(adminService.getPaymentDetail('non-existent-id')).rejects.toThrow('Payment non-existent-id not found')
    })

    it('should refund a payment', async () => {
      const payments = await prisma.payment.findMany({
        where: { status: 'succeeded' },
        take: 1,
      })

      const refunded = await adminService.refundPayment(payments[0].id, 'Test refund')

      expect(refunded.status).toBe('refunded')
      expect(refunded.refundedAmount).toEqual(payments[0].amount)

      const verify = await prisma.payment.findUnique({
        where: { id: payments[0].id },
      })
      expect(verify?.status).toBe('refunded')
    })

    it('should throw error when refunding already refunded payment', async () => {
      const payments = await prisma.payment.findMany({
        where: { status: 'succeeded' },
        take: 1,
      })

      await adminService.refundPayment(payments[0].id)

      await expect(adminService.refundPayment(payments[0].id)).rejects.toThrow('already refunded')
    })

    it('should throw error when refunding failed payment', async () => {
      const payments = await prisma.payment.findMany({
        where: { status: 'failed' },
        take: 1,
      })

      await expect(adminService.refundPayment(payments[0].id)).rejects.toThrow('Cannot refund a failed payment')
    })

    it('should include payment summary statistics', async () => {
      const result = await adminService.getPayments({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      expect(result.summary).toBeDefined()
      expect(result.summary.successedCount).toBe(2)
      expect(result.summary.successedTotal).toBeDefined()
    })
  })

  describe('Analytics', () => {
    beforeEach(async () => {
      // Create test payments for analytics
      await prisma.payment.create({
        data: {
          userId: normalUser1.id,
          stripeSessionId: 'cs_analytics_1',
          amount: 50.0,
          currency: 'usd',
          status: 'succeeded',
          question: 'Test question 1',
          category: 'Laboral',
        },
      })

      await prisma.payment.create({
        data: {
          userId: normalUser2.id,
          stripeSessionId: 'cs_analytics_2',
          amount: 100.0,
          currency: 'usd',
          status: 'succeeded',
          question: 'Test question 2',
          category: 'Civil',
        },
      })

      await prisma.payment.create({
        data: {
          userId: normalUser2.id,
          stripeSessionId: 'cs_analytics_3',
          amount: 75.0,
          currency: 'usd',
          status: 'succeeded',
          question: 'Test question 3',
          category: 'Laboral',
        },
      })
    })

    it('should get analytics summary', async () => {
      const analytics = await adminService.getAnalytics({})

      expect(analytics.users).toBeDefined()
      expect(analytics.users.total).toBeGreaterThanOrEqual(4)
      expect(analytics.users.byRole).toBeDefined()

      expect(analytics.payments).toBeDefined()
      expect(analytics.payments.total).toBeGreaterThanOrEqual(3)

      expect(analytics.revenue).toBeDefined()
      expect(analytics.revenue.total).toBeDefined()
      expect(analytics.revenue.netRevenue).toBeDefined()
    })

    it('should breakdown users by role', async () => {
      const analytics = await adminService.getAnalytics({})

      const roles = analytics.users.byRole.map((r: any) => r.role)
      expect(roles).toContain('admin')
      expect(roles).toContain('lawyer')
      expect(roles).toContain('user')
    })

    it('should breakdown payments by status', async () => {
      const analytics = await adminService.getAnalytics({})

      const statuses = analytics.payments.byStatus.map((s: any) => s.status)
      expect(statuses.length).toBeGreaterThan(0)
    })

    it('should calculate revenue correctly', async () => {
      const analytics = await adminService.getAnalytics({})

      // We have 3 succeeded payments: 50 + 100 + 75 = 225
      expect(Number(analytics.revenue.total)).toBeGreaterThanOrEqual(225)
    })

    it('should breakdown payments by category', async () => {
      const analytics = await adminService.getAnalytics({})

      const categories = analytics.categories.map((c: any) => c.category)
      expect(categories).toContain('Laboral')
      expect(categories).toContain('Civil')
    })

    it('should filter analytics by date range', async () => {
      const now = new Date()
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

      const analytics = await adminService.getAnalytics({
        startDate: new Date(1970, 0, 1), // Very old date
        endDate: tomorrow,
      })

      expect(analytics.payments.total).toBeGreaterThanOrEqual(3)
    })

    it('should get analytics trend', async () => {
      const trend = await adminService.getAnalyticsTrend('day')

      expect(Array.isArray(trend)).toBe(true)
      expect(trend.length).toBeGreaterThanOrEqual(1)

      if (trend.length > 0) {
        expect(trend[0]).toHaveProperty('date')
        expect(trend[0]).toHaveProperty('count')
        expect(trend[0]).toHaveProperty('total')
        expect(trend[0]).toHaveProperty('average')
      }
    })
  })
})
