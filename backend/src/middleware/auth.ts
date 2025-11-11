import { Request, Response, NextFunction } from 'express'
import { verifyJWT } from '../services/authService.js'

// Extend Express Request to include user
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

// Middleware to verify JWT token
export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    res.status(401).json({ error: 'No token provided' })
    return
  }

  const decoded = verifyJWT(token)

  if (!decoded) {
    res.status(401).json({ error: 'Invalid or expired token' })
    return
  }

  req.user = decoded
  next()
}

// Middleware to check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  next()
}

// Middleware to check role
export const hasRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: insufficient permissions' })
      return
    }
    next()
  }
}

// Middleware to check if user is admin
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' })
    return
  }
  next()
}

// Optional auth - attach user if token exists, but don't require it
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (token) {
    const decoded = verifyJWT(token)
    if (decoded) {
      req.user = decoded
    }
  }

  next()
}

export default {
  verifyToken,
  isAuthenticated,
  hasRole,
  isAdmin,
  optionalAuth,
}
