/**
 * Admin Routes - Endpoints for administrative panel
 * All routes require admin authentication
 * 
 * Routes:
 * GET    /api/admin/users                 - Get all users (paginated)
 * GET    /api/admin/users/:id             - Get user details
 * PATCH  /api/admin/users/:id/role        - Update user role
 * DELETE /api/admin/users/:id             - Delete user
 * 
 * GET    /api/admin/payments              - Get all payments (paginated, filtered)
 * GET    /api/admin/payments/:id          - Get payment details
 * POST   /api/admin/payments/:id/refund   - Refund a payment
 * 
 * GET    /api/admin/analytics             - Get analytics summary
 * GET    /api/admin/analytics/trend       - Get analytics trend data
 */

import { Router, Request, Response } from 'express'
import { asyncHandler } from '../middleware/errorHandler.js'
import { validate } from '../middleware/validation.js'
import { apiRateLimit } from '../middleware/rateLimit.js'
import { verifyToken, isAuthenticated } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/authorization.js'
import * as adminService from '../services/adminService.js'
import * as adminSchemas from '../schemas/admin.schemas.js'
import { logger } from '../utils/logger.js'

const router = Router()

// Apply token verification first, then authentication and rate limiting to all admin routes
router.use(verifyToken)
router.use(isAuthenticated)
router.use(requireAdmin)
router.use(apiRateLimit)

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * GET /api/admin/users
 * Get all users with pagination and filters
 */
router.get(
  '/users',
  validate(adminSchemas.GetUsersSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as any

    const result = await adminService.getUsers({
      page: query.page || 1,
      limit: query.limit || 10,
      role: query.role,
      search: query.search,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
    })

    logger.info('[admin-api] GET /users', { userId: req.user?.userId })
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    })
  }),
)

/**
 * GET /api/admin/users/:id
 * Get user details by ID
 */
router.get(
  '/users/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    const user = await adminService.getUserById(id)

    logger.info('[admin-api] GET /users/:id', { userId: req.user?.userId, targetUserId: id })
    res.json({
      success: true,
      data: user,
    })
  }),
)

/**
 * PATCH /api/admin/users/:id/role
 * Update user role
 */
router.patch(
  '/users/:id/role',
  validate(adminSchemas.UpdateUserRoleSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const { role } = req.body

    const user = await adminService.updateUserRole(id, role)

    logger.info('[admin-api] PATCH /users/:id/role', {
      adminUserId: req.user?.userId,
      targetUserId: id,
      newRole: role,
    })

    res.json({
      success: true,
      data: user,
      message: `User role updated to ${role}`,
    })
  }),
)

/**
 * DELETE /api/admin/users/:id
 * Delete user and all related data
 */
router.delete(
  '/users/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    // Prevent admin from deleting themselves
    if (id === req.user?.userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete yourself',
      })
    }

    const user = await adminService.deleteUser(id)

    logger.info('[admin-api] DELETE /users/:id', {
      adminUserId: req.user?.userId,
      deletedUserId: id,
      email: user.email,
    })

    res.json({
      success: true,
      data: user,
      message: 'User deleted successfully',
    })
  }),
)

// ============================================
// PAYMENT MANAGEMENT
// ============================================

/**
 * GET /api/admin/payments
 * Get all payments with pagination and filters
 */
router.get(
  '/payments',
  validate(adminSchemas.GetPaymentsSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as any

    const result = await adminService.getPayments({
      page: query.page || 1,
      limit: query.limit || 10,
      status: query.status,
      userId: query.userId,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
    })

    logger.info('[admin-api] GET /payments', { userId: req.user?.userId })
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      summary: result.summary,
    })
  }),
)

/**
 * GET /api/admin/payments/:id
 * Get payment details
 */
router.get(
  '/payments/:id',
  validate(adminSchemas.GetPaymentDetailSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    const payment = await adminService.getPaymentDetail(id)

    logger.info('[admin-api] GET /payments/:id', { userId: req.user?.userId, paymentId: id })
    res.json({
      success: true,
      data: payment,
    })
  }),
)

/**
 * POST /api/admin/payments/:id/refund
 * Refund a payment
 */
router.post(
  '/payments/:id/refund',
  validate(adminSchemas.RefundPaymentSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const { reason } = req.body

    const payment = await adminService.refundPayment(id, reason)

    logger.info('[admin-api] POST /payments/:id/refund', {
      adminUserId: req.user?.userId,
      paymentId: id,
      reason,
      amount: payment.amount,
    })

    res.json({
      success: true,
      data: payment,
      message: 'Payment refunded successfully',
    })
  }),
)

// ============================================
// ANALYTICS
// ============================================

/**
 * GET /api/admin/analytics
 * Get analytics summary (users, payments, revenue)
 */
router.get(
  '/analytics',
  validate(adminSchemas.GetAnalyticsSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as any

    const analytics = await adminService.getAnalytics({
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    })

    logger.info('[admin-api] GET /analytics', { userId: req.user?.userId })
    res.json({
      success: true,
      data: analytics,
    })
  }),
)

/**
 * GET /api/admin/analytics/trend
 * Get analytics trend data (daily, weekly, or monthly)
 */
router.get(
  '/analytics/trend',
  asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as any

    const trend = await adminService.getAnalyticsTrend(
      query.groupBy || 'day',
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined,
    )

    logger.info('[admin-api] GET /analytics/trend', { userId: req.user?.userId, groupBy: query.groupBy })
    res.json({
      success: true,
      data: trend,
    })
  }),
)

export default router
