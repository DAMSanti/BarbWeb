import { z } from 'zod'
import { UUIDSchema } from './common.schemas.js'

export const CreateFAQSchema = z.object({
  body: z.object({
    category: z.string().min(2, 'Categoría mínimo 2 caracteres').max(100),
    question: z.string().min(10, 'Pregunta mínimo 10 caracteres').max(1000),
    answer: z.string().min(20, 'Respuesta mínimo 20 caracteres').max(5000),
    keywords: z.array(z.string()).min(1, 'Al menos una palabra clave requerida'),
  }),
})

export const UpdateFAQSchema = z.object({
  body: z.object({
    category: z.string().min(2).max(100).optional(),
    question: z.string().min(10).max(1000).optional(),
    answer: z.string().min(20).max(5000).optional(),
    keywords: z.array(z.string()).min(1).optional(),
  }),
})

export const GetFAQSchema = z.object({
  params: z.object({
    faqId: UUIDSchema,
  }),
})

export const DeleteFAQSchema = z.object({
  params: z.object({
    faqId: UUIDSchema,
  }),
})

export const ListFAQSchema = z.object({
  query: z.object({
    category: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
})

export const SearchFAQSchema = z.object({
  body: z.object({
    query: z.string().min(2, 'Búsqueda mínimo 2 caracteres').max(500),
  }),
})

// **NUEVO: Schemas para endpoints de consultas IA**
export const FilterQuestionSchema = z.object({
  body: z.object({
    question: z
      .string()
      .min(10, 'La pregunta debe tener al menos 10 caracteres')
      .max(1000, 'La pregunta no puede exceder 1000 caracteres')
      .transform((q) => q.trim()),
  }),
})

export const GenerateDetailedResponseSchema = z.object({
  body: z.object({
    question: z
      .string()
      .min(10, 'La pregunta debe tener al menos 10 caracteres')
      .max(1000, 'La pregunta no puede exceder 1000 caracteres')
      .transform((q) => q.trim()),
    category: z
      .string()
      .min(2, 'La categoría debe tener al menos 2 caracteres')
      .max(100, 'La categoría no puede exceder 100 caracteres')
      .transform((c) => c.trim()),
  }),
})

// Tipos exportados
export type CreateFAQPayload = z.infer<typeof CreateFAQSchema>['body']
export type UpdateFAQPayload = z.infer<typeof UpdateFAQSchema>['body']
export type GetFAQParams = z.infer<typeof GetFAQSchema>['params']
export type DeleteFAQParams = z.infer<typeof DeleteFAQSchema>['params']
export type ListFAQQuery = z.infer<typeof ListFAQSchema>['query']
export type SearchFAQPayload = z.infer<typeof SearchFAQSchema>['body']
export type FilterQuestionPayload = z.infer<typeof FilterQuestionSchema>['body']
export type GenerateDetailedResponsePayload = z.infer<typeof GenerateDetailedResponseSchema>['body']
