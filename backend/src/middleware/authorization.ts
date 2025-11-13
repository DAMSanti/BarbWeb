/**
 * Authorization Middleware - Role-Based Access Control (RBAC)
 * 
 * Roles:
 * - 'user': Usuario normal (consultas)
 * - 'lawyer': Abogado (acceso a consultas de clientes)
 * - 'admin': Administrador (acceso completo a panel admin)
 */

import { Request, Response, NextFunction } from 'express'

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
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      })
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
        code: 'FORBIDDEN',
        requiredRoles: allowedRoles,
        userRole: req.user.role,
      })
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
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'UNAUTHORIZED',
    })
    return
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Admin access required',
      code: 'ADMIN_REQUIRED',
      userRole: req.user.role,
    })
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
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'UNAUTHORIZED',
    })
    return
  }

  if (!['admin', 'lawyer'].includes(req.user.role)) {
    res.status(403).json({
      success: false,
      error: 'Admin or Lawyer access required',
      code: 'FORBIDDEN',
      userRole: req.user.role,
    })
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
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'UNAUTHORIZED',
    })
    return
  }

  const requestedUserId = req.params.id
  const isOwnResource = req.user.userId === requestedUserId
  const isAdmin = req.user.role === 'admin'

  if (!isOwnResource && !isAdmin) {
    res.status(403).json({
      success: false,
      error: 'Access denied. You can only access your own data or be an admin',
      code: 'FORBIDDEN',
    })
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
