import { z } from 'zod'
import { UUIDSchema } from './common.schemas.js'

export const CreatePaymentIntentSchema = z.object({
  body: z.object({
    amount: z.number().min(10, 'El monto mínimo es $10').max(10000, 'Monto máximo $10,000'),
    consultationId: z.string().optional(),
    description: z.string().optional(),
  }),
})

export const ConfirmPaymentSchema = z.object({
  body: z.object({
    paymentIntentId: z.string().min(1, 'ID de intención de pago requerido'),
    paymentMethodId: z.string().min(1, 'ID de método de pago requerido'),
  }),
})

export const RefundPaymentSchema = z.object({
  body: z.object({
    paymentId: UUIDSchema,
    reason: z.enum(['requested_by_customer', 'duplicate', 'fraudulent']).optional(),
  }),
})

export const GetPaymentHistorySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
    status: z.enum(['pending', 'succeeded', 'failed', 'refunded']).optional(),
  }),
})

export const GetPaymentDetailsSchema = z.object({
  params: z.object({
    paymentId: UUIDSchema,
  }),
})

// Tipos exportados
export type CreatePaymentIntentPayload = z.infer<typeof CreatePaymentIntentSchema>['body']
export type ConfirmPaymentPayload = z.infer<typeof ConfirmPaymentSchema>['body']
export type RefundPaymentPayload = z.infer<typeof RefundPaymentSchema>['body']
export type GetPaymentHistoryQuery = z.infer<typeof GetPaymentHistorySchema>['query']
export type GetPaymentDetailsParams = z.infer<typeof GetPaymentDetailsSchema>['params']
