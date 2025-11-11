import { z } from 'zod'

// Schemas reutilizables
export const EmailSchema = z.string().email('Email inválido').toLowerCase()

export const PasswordSchema = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número')

export const NameSchema = z.string().min(2, 'Mínimo 2 caracteres').max(100)

export const UUIDSchema = z.string().uuid('ID inválido')

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
})

// Helper para convertir errores de Zod a mensajes amigables
export const getZodErrorMessage = (error: z.ZodError<any>): string => {
  return error.issues
    .map((e) => {
      const path = e.path.join('.')
      return `${path}: ${e.message}`
    })
    .join('; ')
}

export type ValidationError = {
  field: string
  message: string
}

export const formatZodErrors = (error: z.ZodError<any>): ValidationError[] => {
  return error.issues.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }))
}
