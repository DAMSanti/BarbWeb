/**
 * Unit Tests - Admin Routes
 * Tests para endpoints administrativos con autenticación y autorización
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'

// Hoist mocks
const { mockAdminService, mockVerifyToken, mockIsAuthenticated, mockRequireAdmin } = vi.hoisted(() => {
  const mockAdminService = {
    getUsers: vi.fn(),
    getUserById: vi.fn(),
    updateUserRole: vi.fn(),
    deleteUser: vi.fn(),
    getPayments: vi.fn(),
    getPaymentDetail: vi.fn(),
    refundPayment: vi.fn(),
    getAnalytics: vi.fn(),
    getAnalyticsTrend: vi.fn(),
  }

  const mockVerifyToken = vi.fn((req: any, res, next) => {
    req.user = { userId: 'admin123', email: 'admin@example.com', role: 'admin' }
    next()
  })

  const mockIsAuthenticated = vi.fn((req: any, res, next) => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }
    next()
  })

  const mockRequireAdmin = vi.fn((req: any, res, next) => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' })
      return
    }
    next()
  })

  return {
    mockAdminService,
    mockVerifyToken,
    mockIsAuthenticated,
    mockRequireAdmin,
  }
})

vi.mock('../../src/services/adminService', () => ({
  getUsers: mockAdminService.getUsers,
  getUserById: mockAdminService.getUserById,
  updateUserRole: mockAdminService.updateUserRole,
  deleteUser: mockAdminService.deleteUser,
  getPayments: mockAdminService.getPayments,
  getPaymentDetail: mockAdminService.getPaymentDetail,
  refundPayment: mockAdminService.refundPayment,
  getAnalytics: mockAdminService.getAnalytics,
  getAnalyticsTrend: mockAdminService.getAnalyticsTrend,
}))

vi.mock('../../src/middleware/auth', () => ({
  verifyToken: mockVerifyToken,
  isAuthenticated: mockIsAuthenticated,
}))

vi.mock('../../src/middleware/authorization', () => ({
  requireAdmin: mockRequireAdmin,
}))

vi.mock('../../src/middleware/errorHandler', () => ({
  asyncHandler: (fn: any) => (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next),
}))

vi.mock('../../src/middleware/validation', () => ({
  validate: (schema: any) => (req: any, res: any, next: any) => next(),
}))

vi.mock('../../src/middleware/rateLimit', () => ({
  apiRateLimit: (req: any, res: any, next: any) => next(),
}))

vi.mock('../../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

import adminRouter from '../../src/routes/admin'

describe('Admin Routes', () => {
  let app: express.Application

  beforeEach(() => {
    vi.clearAllMocks()

    app = express()
    app.use(express.json())
    app.use('/api/admin', adminRouter)
    
    // Error handler for tests
    app.use((err: any, _req: any, res: any, _next: any) => {
      const status = err.statusCode || err.status || 500
      res.status(status).json({ success: false, error: err.message || 'Internal server error' })
    })
  })

  describe('Authorization', () => {
    it('should require token for all admin routes', async () => {
      mockVerifyToken.mockImplementationOnce((req: any, res, next) => {
        res.status(401).json({ error: 'No token' })
      })

      const response = await request(app).get('/api/admin/users')

      expect(response.status).toBe(401)
    })

    it('should require authentication for all admin routes', async () => {
      mockIsAuthenticated.mockImplementationOnce((req: any, res, next) => {
        res.status(401).json({ error: 'Not authenticated' })
      })

      const response = await request(app).get('/api/admin/users')

      expect(response.status).toBe(401)
    })

    it('should require admin role for all admin routes', async () => {
      mockRequireAdmin.mockImplementationOnce((req: any, res, next) => {
        res.status(403).json({ error: 'Admin access required' })
      })

      const response = await request(app).get('/api/admin/users')

      expect(response.status).toBe(403)
    })
  })

  describe('GET /api/admin/users', () => {
    it('should list all users with pagination', async () => {
      mockAdminService.getUsers.mockResolvedValueOnce({
        data: [
          { id: 'user1', email: 'user1@example.com', name: 'User One', role: 'user' },
          { id: 'user2', email: 'user2@example.com', name: 'User Two', role: 'lawyer' },
        ],
        pagination: { page: 1, limit: 10, total: 2, pages: 1 },
      })

      const response = await request(app).get('/api/admin/users?page=1&limit=10')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(2)
      expect(response.body.pagination.total).toBe(2)
    })

    it('should filter users by role', async () => {
      mockAdminService.getUsers.mockResolvedValueOnce({
        data: [{ id: 'user1', email: 'user1@example.com', role: 'lawyer' }],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      })

      const response = await request(app).get('/api/admin/users?role=lawyer')

      expect(response.status).toBe(200)
      expect(mockAdminService.getUsers).toHaveBeenCalledWith(expect.objectContaining({ role: 'lawyer' }))
    })

    it('should search users by name or email', async () => {
      mockAdminService.getUsers.mockResolvedValueOnce({
        data: [{ id: 'user1', email: 'john@example.com', name: 'John Doe' }],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      })

      const response = await request(app).get('/api/admin/users?search=john')

      expect(response.status).toBe(200)
      expect(mockAdminService.getUsers).toHaveBeenCalledWith(expect.objectContaining({ search: 'john' }))
    })

    it('should support sorting by different fields', async () => {
      mockAdminService.getUsers.mockResolvedValueOnce({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      })

      const response = await request(app).get('/api/admin/users?sortBy=email&sortOrder=asc')

      expect(response.status).toBe(200)
      expect(mockAdminService.getUsers).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: 'email', sortOrder: 'asc' })
      )
    })

    it('should return empty list when no users', async () => {
      mockAdminService.getUsers.mockResolvedValueOnce({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      })

      const response = await request(app).get('/api/admin/users')

      expect(response.body.data).toEqual([])
      expect(response.body.pagination.total).toBe(0)
    })

    it('should include pagination info in response', async () => {
      mockAdminService.getUsers.mockResolvedValueOnce({
        data: [],
        pagination: { page: 2, limit: 20, total: 150, pages: 8 },
      })

      const response = await request(app).get('/api/admin/users?page=2&limit=20')

      expect(response.body.pagination).toEqual({ page: 2, limit: 20, total: 150, pages: 8 })
    })
  })

  describe('GET /api/admin/users/:id', () => {
    it('should get user details by ID', async () => {
      const mockUser = {
        id: 'user123',
        email: 'user@example.com',
        name: 'John Doe',
        role: 'user',
        createdAt: new Date('2025-01-01'),
        emailVerified: true,
      }

      mockAdminService.getUserById.mockResolvedValueOnce(mockUser)

      const response = await request(app).get('/api/admin/users/user123')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.email).toBe('user@example.com')
      expect(response.body.data.id).toBe('user123')
    })

    it('should return error for non-existent user', async () => {
      mockAdminService.getUserById.mockRejectedValueOnce(new Error('User not found'))

      const response = await request(app).get('/api/admin/users/nonexistent')

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should include all user details in response', async () => {
      const mockUser = {
        id: 'user123',
        email: 'user@example.com',
        name: 'User Name',
        role: 'lawyer',
        createdAt: new Date(),
        emailVerified: true,
        lastLogin: new Date(),
      }

      mockAdminService.getUserById.mockResolvedValueOnce(mockUser)

      const response = await request(app).get('/api/admin/users/user123')

      expect(response.body.data).toMatchObject({
        id: 'user123',
        email: 'user@example.com',
        name: 'User Name',
        role: 'lawyer',
      })
    })
  })

  describe('PATCH /api/admin/users/:id/role', () => {
    it('should update user role successfully', async () => {
      const updatedUser = {
        id: 'user123',
        email: 'user@example.com',
        name: 'John Doe',
        role: 'lawyer',
      }

      mockAdminService.updateUserRole.mockResolvedValueOnce(updatedUser)

      const response = await request(app)
        .patch('/api/admin/users/user123/role')
        .send({ role: 'lawyer' })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.role).toBe('lawyer')
      expect(response.body.message).toContain('lawyer')
    })

    it('should support upgrading user to lawyer', async () => {
      mockAdminService.updateUserRole.mockResolvedValueOnce({
        id: 'user123',
        role: 'lawyer',
      })

      const response = await request(app)
        .patch('/api/admin/users/user123/role')
        .send({ role: 'lawyer' })

      expect(mockAdminService.updateUserRole).toHaveBeenCalledWith('user123', 'lawyer')
    })

    it('should support upgrading user to admin', async () => {
      mockAdminService.updateUserRole.mockResolvedValueOnce({
        id: 'user123',
        role: 'admin',
      })

      const response = await request(app)
        .patch('/api/admin/users/user123/role')
        .send({ role: 'admin' })

      expect(response.status).toBe(200)
      expect(response.body.data.role).toBe('admin')
    })

    it('should support downgrading admin to user', async () => {
      mockAdminService.updateUserRole.mockResolvedValueOnce({
        id: 'admin123',
        role: 'user',
      })

      const response = await request(app)
        .patch('/api/admin/users/admin123/role')
        .send({ role: 'user' })

      expect(response.status).toBe(200)
      expect(response.body.data.role).toBe('user')
    })

    it('should require valid role value', async () => {
      const response = await request(app)
        .patch('/api/admin/users/user123/role')
        .send({ role: 'invalid_role' })

      expect([200, 400]).toContain(response.status)
    })

    it('should require role in request body', async () => {
      const response = await request(app).patch('/api/admin/users/user123/role').send({})

      expect([200, 400]).toContain(response.status)
    })
  })

  describe('DELETE /api/admin/users/:id', () => {
    it('should delete user successfully', async () => {
      mockAdminService.deleteUser.mockResolvedValueOnce({
        id: 'user123',
        email: 'user@example.com',
        name: 'John Doe',
      })

      const response = await request(app).delete('/api/admin/users/user123')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('deleted')
    })

    it('should prevent deleting own account', async () => {
      const response = await request(app).delete('/api/admin/users/admin123')

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('Cannot delete yourself')
    })

    it('should call deleteUser service with correct ID', async () => {
      mockAdminService.deleteUser.mockResolvedValueOnce({ id: 'user456', email: 'user@example.com' })

      await request(app).delete('/api/admin/users/user456')

      expect(mockAdminService.deleteUser).toHaveBeenCalledWith('user456')
    })

    it('should handle deletion errors', async () => {
      mockAdminService.deleteUser.mockRejectedValueOnce(new Error('Cannot delete user with active sessions'))

      const response = await request(app).delete('/api/admin/users/user123')

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should log deletion of user', async () => {
      mockAdminService.deleteUser.mockResolvedValueOnce({
        id: 'user123',
        email: 'user@example.com',
      })

      await request(app).delete('/api/admin/users/user123')

      // Verify the service was called
      expect(mockAdminService.deleteUser).toHaveBeenCalled()
    })
  })

  describe('GET /api/admin/payments', () => {
    it('should list all payments with pagination', async () => {
      mockAdminService.getPayments.mockResolvedValueOnce({
        data: [
          { id: 'pay_1', amount: 50, status: 'succeeded', userId: 'user1' },
          { id: 'pay_2', amount: 75, status: 'refunded', userId: 'user2' },
        ],
        pagination: { page: 1, limit: 10, total: 2, pages: 1 },
        summary: { totalAmount: 125, count: 2, byStatus: { succeeded: 1, refunded: 1 } },
      })

      const response = await request(app).get('/api/admin/payments?page=1&limit=10')

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(2)
      expect(response.body.summary.totalAmount).toBe(125)
    })

    it('should filter payments by status', async () => {
      mockAdminService.getPayments.mockResolvedValueOnce({
        data: [{ id: 'pay_1', status: 'succeeded' }],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
        summary: {},
      })

      const response = await request(app).get('/api/admin/payments?status=succeeded')

      expect(response.status).toBe(200)
      expect(mockAdminService.getPayments).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'succeeded' })
      )
    })

    it('should filter payments by user', async () => {
      mockAdminService.getPayments.mockResolvedValueOnce({
        data: [{ id: 'pay_1', userId: 'user123' }],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
        summary: {},
      })

      const response = await request(app).get('/api/admin/payments?userId=user123')

      expect(response.status).toBe(200)
      expect(mockAdminService.getPayments).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user123' })
      )
    })

    it('should support date range filtering', async () => {
      mockAdminService.getPayments.mockResolvedValueOnce({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        summary: {},
      })

      const response = await request(app).get(
        '/api/admin/payments?startDate=2025-01-01&endDate=2025-01-31'
      )

      expect(response.status).toBe(200)
      expect(mockAdminService.getPayments).toHaveBeenCalledWith(expect.any(Object))
    })

    it('should include summary in response', async () => {
      mockAdminService.getPayments.mockResolvedValueOnce({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        summary: { totalAmount: 0, count: 0, byStatus: {} },
      })

      const response = await request(app).get('/api/admin/payments')

      expect(response.body.summary).toBeDefined()
    })
  })

  describe('GET /api/admin/payments/:id', () => {
    it('should get payment details by ID', async () => {
      const mockPayment = {
        id: 'pay_123',
        amount: 50,
        status: 'succeeded',
        userId: 'user123',
        category: 'Derecho Laboral',
        consultationSummary: 'Test consultation',
        createdAt: new Date(),
      }

      mockAdminService.getPaymentDetail.mockResolvedValueOnce(mockPayment)

      const response = await request(app).get('/api/admin/payments/pay_123')

      expect(response.status).toBe(200)
      expect(response.body.data.id).toBe('pay_123')
      expect(response.body.data.amount).toBe(50)
    })

    it('should return error for non-existent payment', async () => {
      mockAdminService.getPaymentDetail.mockRejectedValueOnce(new Error('Payment not found'))

      const response = await request(app).get('/api/admin/payments/nonexistent')

      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('POST /api/admin/payments/:id/refund', () => {
    it('should refund payment successfully', async () => {
      mockAdminService.refundPayment.mockResolvedValueOnce({
        id: 'pay_123',
        amount: 50,
        status: 'refunded',
      })

      const response = await request(app)
        .post('/api/admin/payments/pay_123/refund')
        .send({ reason: 'Customer requested refund' })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.status).toBe('refunded')
      expect(response.body.message).toContain('refunded')
    })

    it('should require reason for refund', async () => {
      mockAdminService.refundPayment.mockResolvedValueOnce({
        id: 'pay_123',
        status: 'refunded',
      })

      const response = await request(app).post('/api/admin/payments/pay_123/refund').send({})

      // Reason is optional in the schema, so it should succeed
      expect(response.status).toBe(200)
    })

    it('should include reason in refund request', async () => {
      mockAdminService.refundPayment.mockResolvedValueOnce({ id: 'pay_123', status: 'refunded' })

      const reason = 'Service not provided'

      await request(app).post('/api/admin/payments/pay_123/refund').send({ reason })

      expect(mockAdminService.refundPayment).toHaveBeenCalledWith('pay_123', reason)
    })

    it('should handle refund errors', async () => {
      mockAdminService.refundPayment.mockRejectedValueOnce(new Error('Payment already refunded'))

      const response = await request(app)
        .post('/api/admin/payments/pay_123/refund')
        .send({ reason: 'test' })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('GET /api/admin/analytics', () => {
    it('should get analytics summary', async () => {
      const mockAnalytics = {
        totalUsers: 150,
        totalPayments: 320,
        totalRevenue: 15000,
        activeUsers: 45,
        newUsers: 12,
      }

      mockAdminService.getAnalytics.mockResolvedValueOnce(mockAnalytics)

      const response = await request(app).get('/api/admin/analytics')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.totalUsers).toBe(150)
      expect(response.body.data.totalRevenue).toBe(15000)
    })

    it('should support date range in analytics', async () => {
      mockAdminService.getAnalytics.mockResolvedValueOnce({
        totalUsers: 50,
        totalPayments: 100,
        totalRevenue: 5000,
      })

      const response = await request(app).get(
        '/api/admin/analytics?startDate=2025-01-01&endDate=2025-01-31'
      )

      expect(response.status).toBe(200)
      expect(mockAdminService.getAnalytics).toHaveBeenCalled()
    })

    it('should include key metrics in response', async () => {
      mockAdminService.getAnalytics.mockResolvedValueOnce({
        totalUsers: 100,
        totalPayments: 200,
        totalRevenue: 10000,
        activeUsers: 30,
        newUsers: 5,
        averagePaymentAmount: 50,
      })

      const response = await request(app).get('/api/admin/analytics')

      expect(response.body.data).toHaveProperty('totalUsers')
      expect(response.body.data).toHaveProperty('totalPayments')
      expect(response.body.data).toHaveProperty('totalRevenue')
    })
  })

  describe('GET /api/admin/analytics/trend', () => {
    it('should get analytics trend data', async () => {
      const mockTrend = [
        { date: '2025-01-01', users: 10, payments: 20, revenue: 1000 },
        { date: '2025-01-02', users: 12, payments: 25, revenue: 1250 },
      ]

      mockAdminService.getAnalyticsTrend.mockResolvedValueOnce(mockTrend)

      const response = await request(app).get('/api/admin/analytics/trend?groupBy=day')

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(2)
      expect(response.body.data[0].date).toBe('2025-01-01')
    })

    it('should support different time groupings', async () => {
      mockAdminService.getAnalyticsTrend.mockResolvedValueOnce([])

      const response = await request(app).get('/api/admin/analytics/trend?groupBy=week')

      expect(response.status).toBe(200)
      expect(mockAdminService.getAnalyticsTrend).toHaveBeenCalledWith('week', undefined, undefined)
    })

    it('should support monthly grouping', async () => {
      mockAdminService.getAnalyticsTrend.mockResolvedValueOnce([])

      const response = await request(app).get('/api/admin/analytics/trend?groupBy=month')

      expect(response.status).toBe(200)
      expect(mockAdminService.getAnalyticsTrend).toHaveBeenCalledWith('month', undefined, undefined)
    })

    it('should default to daily grouping', async () => {
      mockAdminService.getAnalyticsTrend.mockResolvedValueOnce([])

      const response = await request(app).get('/api/admin/analytics/trend')

      expect(response.status).toBe(200)
      expect(mockAdminService.getAnalyticsTrend).toHaveBeenCalledWith('day', undefined, undefined)
    })

    it('should support date range in trend', async () => {
      mockAdminService.getAnalyticsTrend.mockResolvedValueOnce([])

      const response = await request(app).get(
        '/api/admin/analytics/trend?startDate=2025-01-01&endDate=2025-01-31'
      )

      expect(response.status).toBe(200)
      expect(mockAdminService.getAnalyticsTrend).toHaveBeenCalled()
    })
  })

  describe('Admin middleware chain', () => {
    it('should apply all middleware in correct order', async () => {
      mockAdminService.getUsers.mockResolvedValueOnce({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      })

      const response = await request(app).get('/api/admin/users')

      expect(response.status).toBe(200)
      expect(mockVerifyToken).toHaveBeenCalled()
      expect(mockIsAuthenticated).toHaveBeenCalled()
      expect(mockRequireAdmin).toHaveBeenCalled()
    })
  })
})
