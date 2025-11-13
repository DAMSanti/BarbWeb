/**
 * Admin Schemas - Validación para endpoints administrativos
 */

import { z } from 'zod'
import { PaginationSchema } from './common.schemas.js'

// ============================================
// USER MANAGEMENT
// ============================================

export const GetUsersSchema = z.object({
  query: z
    .object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(10),
      role: z.enum(['user', 'lawyer', 'admin']).optional(),
      search: z.string().min(1).max(100).optional(), // buscar por email o nombre
      sortBy: z.enum(['createdAt', 'email', 'name']).default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    })
    .optional(),
})

export const UpdateUserRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
  body: z.object({
    role: z
      .enum(['user', 'lawyer', 'admin'])
      .refine((val) => ['user', 'lawyer', 'admin'].includes(val), {
        message: 'Role must be: user, lawyer, or admin',
      }),
  }),
})

export const DeleteUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
})

// ============================================
// PAYMENT MANAGEMENT
// ============================================

export const GetPaymentsSchema = z.object({
  query: z
    .object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(10),
      status: z.enum(['pending', 'succeeded', 'failed', 'refunded']).optional(),
      userId: z.string().optional(), // filtrar por usuario específico
      startDate: z.coerce.date().optional(), // rango de fechas
      endDate: z.coerce.date().optional(),
      sortBy: z.enum(['createdAt', 'amount', 'status']).default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    })
    .optional(),
})

export const RefundPaymentSchema = z.object({
  params: z.object({
    paymentId: z.string().uuid('Invalid payment ID'),
  }),
  body: z.object({
    reason: z.string().min(1).max(500).optional(),
  }),
})

export const GetPaymentDetailSchema = z.object({
  params: z.object({
    paymentId: z.string().uuid('Invalid payment ID'),
  }),
})

// ============================================
// ANALYTICS
// ============================================

export const GetAnalyticsSchema = z.object({
  query: z
    .object({
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      groupBy: z.enum(['day', 'week', 'month']).optional(),
    })
    .optional(),
})

// ============================================
// EXPORT TYPES
// ============================================

export type GetUsersQuery = z.infer<typeof GetUsersSchema>['query']
export type UpdateUserRolePayload = z.infer<typeof UpdateUserRoleSchema>['body']
export type GetPaymentsQuery = z.infer<typeof GetPaymentsSchema>['query']
export type RefundPaymentPayload = z.infer<typeof RefundPaymentSchema>['body']
export type GetAnalyticsQuery = z.infer<typeof GetAnalyticsSchema>['query']
