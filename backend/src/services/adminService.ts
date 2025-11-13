/**
 * Admin Service - Lógica de negocio para panel administrativo
 * Gestiona usuarios, pagos y analytics
 */

import { getPrismaClient } from '../db/init.js'
import { logger } from '../utils/logger.js'

const prisma = getPrismaClient()

// ============================================
// USER MANAGEMENT
// ============================================

interface GetUsersOptions {
  page: number
  limit: number
  role?: string
  search?: string
  sortBy: 'createdAt' | 'email' | 'name'
  sortOrder: 'asc' | 'desc'
}

/**
 * Get users with pagination and filters
 */
export const getUsers = async (options: GetUsersOptions) => {
  const { page = 1, limit = 10, role, search, sortBy = 'createdAt', sortOrder = 'desc' } = options

  const skip = (page - 1) * limit

  // Build where clause
  const where: any = {}

  if (role) {
    where.role = role
  }

  if (search) {
    where.OR = [{ email: { contains: search, mode: 'insensitive' } }, { name: { contains: search, mode: 'insensitive' } }]
  }

  // Get total count
  const total = await prisma.user.count({ where })

  // Get users
  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      lastLogin: true,
      createdAt: true,
      _count: {
        select: { payments: true },
      },
    },
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  })

  const totalPages = Math.ceil(total / limit)

  logger.info('[admin] getUsers', {
    page,
    limit,
    role,
    search,
    total,
    returned: users.length,
    totalPages,
  })

  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  }
}

/**
 * Get user details by ID
 */
export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { payments: true, customAgents: true, oauthAccounts: true },
      },
    },
  })

  if (!user) {
    throw new Error(`User ${userId} not found`)
  }

  logger.info('[admin] getUserById', { userId })
  return user
}

/**
 * Update user role
 */
export const updateUserRole = async (userId: string, newRole: string) => {
  // Validate role
  const validRoles = ['user', 'lawyer', 'admin']
  if (!validRoles.includes(newRole)) {
    throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`)
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      updatedAt: true,
    },
  })

  logger.info('[admin] updateUserRole', { userId, newRole })
  return user
}

/**
 * Delete user and all related data
 */
export const deleteUser = async (userId: string) => {
  // Delete user (cascade will handle related records)
  const user = await prisma.user.delete({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
    },
  })

  logger.info('[admin] deleteUser', { userId, email: user.email })
  return user
}

// ============================================
// PAYMENT MANAGEMENT
// ============================================

interface GetPaymentsOptions {
  page: number
  limit: number
  status?: string
  userId?: string
  startDate?: Date
  endDate?: Date
  sortBy: 'createdAt' | 'amount' | 'status'
  sortOrder: 'asc' | 'desc'
}

/**
 * Get payments with filters and pagination
 */
export const getPayments = async (options: GetPaymentsOptions) => {
  const { page = 1, limit = 10, status, userId, startDate, endDate, sortBy = 'createdAt', sortOrder = 'desc' } = options

  const skip = (page - 1) * limit

  // Build where clause
  const where: any = {}

  if (status) {
    where.status = status
  }

  if (userId) {
    where.userId = userId
  }

  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) {
      where.createdAt.gte = startDate
    }
    if (endDate) {
      where.createdAt.lte = endDate
    }
  }

  // Get total count
  const total = await prisma.payment.count({ where })

  // Get payments
  const payments = await prisma.payment.findMany({
    where,
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          email: true,
          name: true,
        },
      },
      stripeSessionId: true,
      amount: true,
      currency: true,
      status: true,
      question: true,
      category: true,
      refundedAmount: true,
      createdAt: true,
      updatedAt: true,
    },
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  })

  const totalPages = Math.ceil(total / limit)

  // Calculate summary
  const successedPayments = await prisma.payment.aggregate({
    where: { ...where, status: 'succeeded' },
    _sum: { amount: true },
    _count: true,
  })

  const refundedPayments = await prisma.payment.aggregate({
    where: { ...where, status: 'refunded' },
    _sum: { refundedAmount: true },
    _count: true,
  })

  logger.info('[admin] getPayments', {
    page,
    limit,
    status,
    userId,
    total,
    returned: payments.length,
    totalPages,
  })

  return {
    data: payments,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    summary: {
      successedCount: successedPayments._count,
      successedTotal: successedPayments._sum.amount || 0,
      refundedCount: refundedPayments._count,
      refundedTotal: refundedPayments._sum.refundedAmount || 0,
    },
  }
}

/**
 * Get payment details
 */
export const getPaymentDetail = async (paymentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  })

  if (!payment) {
    throw new Error(`Payment ${paymentId} not found`)
  }

  logger.info('[admin] getPaymentDetail', { paymentId })
  return payment
}

/**
 * Refund a payment (mark as refunded, don't actually hit Stripe here)
 * Note: In production, you'd call Stripe API for actual refunds
 */
export const refundPayment = async (paymentId: string, reason?: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  })

  if (!payment) {
    throw new Error(`Payment ${paymentId} not found`)
  }

  if (payment.status === 'refunded') {
    throw new Error('Payment is already refunded')
  }

  if (payment.status === 'failed') {
    throw new Error('Cannot refund a failed payment')
  }

  // Mark as refunded
  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'refunded',
      refundedAmount: payment.amount,
      updatedAt: new Date(),
    },
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  })

  logger.info('[admin] refundPayment', {
    paymentId,
    reason,
    amount: updatedPayment.amount,
    userEmail: updatedPayment.user.email,
  })

  return updatedPayment
}

// ============================================
// ANALYTICS
// ============================================

interface AnalyticsOptions {
  startDate?: Date
  endDate?: Date
}

/**
 * Get analytics summary
 */
export const getAnalytics = async (options: AnalyticsOptions) => {
  const { startDate, endDate } = options

  // Build where clause
  const where: any = {}
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) {
      where.createdAt.gte = startDate
    }
    if (endDate) {
      where.createdAt.lte = endDate
    }
  }

  // Total users
  const totalUsers = await prisma.user.count()
  const usersByRole = await prisma.user.groupBy({
    by: ['role'],
    _count: true,
  })

  // Payment analytics
  const totalPayments = await prisma.payment.count({ where })
  const paymentByStatus = await prisma.payment.groupBy({
    by: ['status'],
    where,
    _count: true,
    _sum: { amount: true },
  })

  // Revenue analytics
  const totalRevenue = await prisma.payment.aggregate({
    where: { ...where, status: 'succeeded' },
    _sum: { amount: true },
  })

  const totalRefunded = await prisma.payment.aggregate({
    where: { ...where, status: 'refunded' },
    _sum: { refundedAmount: true },
  })

  // Category distribution
  const paymentsByCategory = await prisma.payment.groupBy({
    by: ['category'],
    where: { ...where, status: 'succeeded' },
    _count: true,
    _sum: { amount: true },
  })

  // Average payment amount
  const avgPayment = await prisma.payment.aggregate({
    where: { ...where, status: 'succeeded' },
    _avg: { amount: true },
  })

  logger.info('[admin] getAnalytics', {
    startDate,
    endDate,
    totalUsers,
    totalPayments,
    totalRevenue: totalRevenue._sum.amount || 0,
  })

  return {
    users: {
      total: totalUsers,
      byRole: usersByRole.map((r) => ({
        role: r.role,
        count: r._count,
      })),
    },
    payments: {
      total: totalPayments,
      byStatus: paymentByStatus.map((s) => ({
        status: s.status,
        count: s._count,
        total: s._sum.amount || 0,
      })),
    },
    revenue: {
      total: totalRevenue._sum.amount || 0,
      refunded: totalRefunded._sum.refundedAmount || 0,
      netRevenue: (totalRevenue._sum.amount?.toNumber() || 0) - (totalRefunded._sum.refundedAmount?.toNumber() || 0),
      averagePayment: avgPayment._avg.amount || 0,
    },
    categories: paymentsByCategory.map((c) => ({
      category: c.category,
      count: c._count,
      total: c._sum.amount || 0,
    })),
    dateRange: {
      startDate: startDate || null,
      endDate: endDate || null,
    },
  }
}

/**
 * Get analytics trend data (daily/weekly/monthly)
 */
export const getAnalyticsTrend = async (groupBy: 'day' | 'week' | 'month', startDate?: Date, endDate?: Date) => {
  const where: any = {}
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) {
      where.createdAt.gte = startDate
    }
    if (endDate) {
      where.createdAt.lte = endDate
    }
  }

  // For simplicity, just get daily data
  // In production, you might use more sophisticated grouping
  const payments = await prisma.payment.findMany({
    where: { ...where, status: 'succeeded' },
    select: {
      amount: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  // Group by date
  const grouped: Record<string, { count: number; total: number }> = {}

  payments.forEach((p) => {
    const date = new Date(p.createdAt)
    let key = date.toISOString().split('T')[0] // YYYY-MM-DD

    if (!grouped[key]) {
      grouped[key] = { count: 0, total: 0 }
    }

    grouped[key].count += 1
    grouped[key].total += p.amount.toNumber()
  })

  const trend = Object.entries(grouped).map(([date, data]) => ({
    date,
    ...data,
    average: data.total / data.count,
  }))

  logger.info('[admin] getAnalyticsTrend', {
    groupBy,
    startDate,
    endDate,
    dataPoints: trend.length,
  })

  return trend
}

export default {
  // Users
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,

  // Payments
  getPayments,
  getPaymentDetail,
  refundPayment,

  // Analytics
  getAnalytics,
  getAnalyticsTrend,
}
