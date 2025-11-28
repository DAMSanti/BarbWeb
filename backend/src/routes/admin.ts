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
import { ValidationError } from '../utils/errors.js'

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
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Listar usuarios
 *     description: Obtener lista paginada de usuarios con filtros
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [user, admin] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Buscar por nombre o email
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, default: createdAt }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: array, items: { $ref: '#/components/schemas/User' } }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol admin)
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
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Detalle de usuario
 *     description: Obtener información detallada de un usuario
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detalle del usuario
 *       404:
 *         description: Usuario no encontrado
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
 * @swagger
 * /api/admin/users/{id}/role:
 *   patch:
 *     summary: Actualizar rol de usuario
 *     description: Cambiar el rol de un usuario (user/admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [user, admin] }
 *     responses:
 *       200:
 *         description: Rol actualizado
 *       404:
 *         description: Usuario no encontrado
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
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Eliminar usuario
 *     description: Eliminar un usuario y todos sus datos relacionados
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       400:
 *         description: No puedes eliminarte a ti mismo
 *       404:
 *         description: Usuario no encontrado
 */
router.delete(
  '/users/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    // Prevent admin from deleting themselves
    if (id === req.user?.userId) {
      throw new ValidationError('Cannot delete yourself')
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
 * @swagger
 * /api/admin/payments:
 *   get:
 *     summary: Listar pagos
 *     description: Obtener lista paginada de todos los pagos con filtros
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, completed, failed, refunded] }
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Lista de pagos con resumen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Payment' } }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalRevenue: { type: number }
 *                     totalPayments: { type: integer }
 *                     averagePayment: { type: number }
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
 * @swagger
 * /api/admin/payments/{id}:
 *   get:
 *     summary: Detalle de pago
 *     description: Obtener información detallada de un pago
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detalle del pago
 *       404:
 *         description: Pago no encontrado
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
 * @swagger
 * /api/admin/payments/{id}/refund:
 *   post:
 *     summary: Reembolsar pago (Admin)
 *     description: Procesar reembolso de un pago como administrador
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string, description: Motivo del reembolso }
 *     responses:
 *       200:
 *         description: Reembolso procesado
 *       400:
 *         description: Pago no elegible para reembolso
 *       404:
 *         description: Pago no encontrado
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
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Resumen de analytics
 *     description: Obtener métricas generales de usuarios, pagos e ingresos
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Métricas de analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Analytics' }
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
 * @swagger
 * /api/admin/analytics/trend:
 *   get:
 *     summary: Tendencias de analytics
 *     description: Obtener datos de tendencia agrupados por día, semana o mes
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: groupBy
 *         schema: { type: string, enum: [day, week, month], default: day }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Datos de tendencia
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     trend:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date: { type: string }
 *                           payments: { type: integer }
 *                           revenue: { type: number }
 *                           users: { type: integer }
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalRevenue: { type: number }
 *                         totalPayments: { type: integer }
 *                         activeUsers: { type: integer }
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
