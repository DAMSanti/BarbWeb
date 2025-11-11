import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { ValidationError } from '../utils/errors.js'
import { formatZodErrors } from '../schemas/common.schemas.js'

/**
 * Middleware para validar request con schemas de Zod
 * Soporta validación de body, query y params
 */
export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as any

      // Reemplazar datos con datos validados
      if (validated.body) {
        req.body = validated.body
      }
      if (validated.query) {
        req.query = validated.query
      }
      if (validated.params) {
        req.params = validated.params
      }

      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const fields = formatZodErrors(error).reduce((acc, err) => {
          acc[err.field] = err.message
          return acc
        }, {} as Record<string, string>)

        const message = formatZodErrors(error)
          .map((e) => e.message)
          .join('; ')

        throw new ValidationError(message, fields)
      }

      throw error
    }
  }
}
