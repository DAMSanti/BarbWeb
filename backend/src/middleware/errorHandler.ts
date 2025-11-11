import { Request, Response, NextFunction } from 'express'
import {
  AppError,
  isAppError,
  ErrorResponse,
  ValidationError,
} from '../utils/errors.js'
import { logger } from '../utils/logger.js'

/**
 * Middleware para manejo centralizado de errores
 * Debe ser el último middleware en la cadena
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Log del error
  if (isAppError(error)) {
    if (error.statusCode >= 500) {
      logger.error(`[${error.statusCode}] ${error.message}`, { stack: error.stack })
    } else {
      logger.warn(`[${error.statusCode}] ${error.message}`)
    }
  } else {
    logger.error(`Unexpected error: ${error.message}`, { stack: error.stack })
  }

  // Preparar respuesta
  let response: ErrorResponse

  if (isAppError(error)) {
    // Error conocido
    response = {
      success: false,
      error: error.message,
      statusCode: error.statusCode,
      timestamp: error.timestamp.toISOString(),
      path: req.path,
    }

    // Agregar campos si es error de validación
    if (error instanceof ValidationError && error.fields) {
      response.fields = error.fields
    }

    // En desarrollo, incluir stack trace
    if (process.env.NODE_ENV === 'development') {
      ;(response as any).stack = error.stack
    }

    return res.status(error.statusCode).json(response)
  }

  // Error no esperado
  response = {
    success: false,
    error: 'Error interno del servidor',
    statusCode: 500,
    timestamp: new Date().toISOString(),
    path: req.path,
  }

  if (process.env.NODE_ENV === 'development') {
    ;(response as any).message = error.message
    ;(response as any).stack = error.stack
  }

  res.status(500).json(response)
}

/**
 * Wrapper para funciones async en rutas
 * Captura errores y los pasa al errorHandler
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Middleware para 404
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Ruta no encontrada: ${req.path}`, 404, true)
  next(error)
}
