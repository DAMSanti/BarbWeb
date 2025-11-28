/**
 * Authorization Middleware - Role-Based Access Control (RBAC)
 * 
 * Roles:
 * - 'user': Usuario normal (consultas)
 * - 'lawyer': Abogado (acceso a consultas de clientes)
 * - 'admin': Administrador (acceso completo a panel admin)
 */

import { Request, Response, NextFunction } from 'express'
import { AuthenticationError, AuthorizationError } from '../utils/errors.js'

// Extender tipo Request para incluir usuario autenticado
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        email: string
        role: string
      }
    }
  }
}

/**
 * Middleware: Require specific role(s)
 * @param allowedRoles - Array de roles permitidos
 * @example
 * router.get('/users', requireRole('admin', 'lawyer'), getUsers)
 * router.delete('/users/:id', requireRole('admin'), deleteUser)
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AuthenticationError('Authentication required'))
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AuthorizationError(`Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`))
      return
    }

    next()
  }
}

/**
 * Middleware: Require admin role
 * @example
 * router.get('/admin/users', requireAdmin, getUsers)
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(new AuthenticationError('Authentication required'))
    return
  }

  if (req.user.role !== 'admin') {
    next(new AuthorizationError('Admin access required'))
    return
  }

  next()
}

/**
 * Middleware: Require admin or lawyer role
 * @example
 * router.get('/admin/payments', requireAdminOrLawyer, getPayments)
 */
export const requireAdminOrLawyer = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(new AuthenticationError('Authentication required'))
    return
  }

  if (!['admin', 'lawyer'].includes(req.user.role)) {
    next(new AuthorizationError('Admin or Lawyer access required'))
    return
  }

  next()
}

/**
 * Middleware: Check if user is accessing their own data or is admin
 * @example
 * router.get('/users/:id', requireOwnResourceOrAdmin, getUserData)
 */
export const requireOwnResourceOrAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(new AuthenticationError('Authentication required'))
    return
  }

  const requestedUserId = req.params.id
  const isOwnResource = req.user.userId === requestedUserId
  const isAdmin = req.user.role === 'admin'

  if (!isOwnResource && !isAdmin) {
    next(new AuthorizationError('Access denied. You can only access your own data or be an admin'))
    return
  }

  next()
}

export default {
  requireRole,
  requireAdmin,
  requireAdminOrLawyer,
  requireOwnResourceOrAdmin,
}
