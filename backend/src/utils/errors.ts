/**
 * Clase base para errores de aplicación
 * Permite distinguir entre errores operacionales y no operacionales
 */
export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly timestamp: Date

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
  ) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.timestamp = new Date()
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Error de validación (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 400, true)
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

/**
 * Error de autenticación (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'No autenticado') {
    super(message, 401, true)
    Object.setPrototypeOf(this, AuthenticationError.prototype)
  }
}

/**
 * Error de autorización (403)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'No autorizado') {
    super(message, 403, true)
    Object.setPrototypeOf(this, AuthorizationError.prototype)
  }
}

/**
 * Error de recurso no encontrado (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} no encontrado`, 404, true)
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

/**
 * Error de conflicto (409)
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true)
    Object.setPrototypeOf(this, ConflictError.prototype)
  }
}

/**
 * Error de límite de solicitudes (429)
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Demasiadas solicitudes. Intenta más tarde.') {
    super(message, 429, true)
    Object.setPrototypeOf(this, RateLimitError.prototype)
  }
}

/**
 * Error interno del servidor (500)
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Error interno del servidor') {
    super(message, 500, true)
    Object.setPrototypeOf(this, InternalServerError.prototype)
  }
}

/**
 * Error de servicio no disponible (503)
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Servicio no disponible') {
    super(message, 503, true)
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype)
  }
}

/**
 * Error de pago (402)
 */
export class PaymentError extends AppError {
  constructor(message: string) {
    super(message, 402, true)
    Object.setPrototypeOf(this, PaymentError.prototype)
  }
}

/**
 * Type guard para verificar si un error es AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * Información del error para respuesta HTTP
 */
export interface ErrorResponse {
  success: false
  error: string
  statusCode: number
  timestamp: string
  path?: string
  fields?: Record<string, string>
}
