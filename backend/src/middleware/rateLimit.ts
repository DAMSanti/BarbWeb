import { Request, Response, NextFunction } from 'express'
import { RateLimitError } from '../utils/errors.js'

/**
 * Simple in-memory rate limiter
 * Tracks requests per IP address
 */
interface RequestRecord {
  count: number
  resetTime: number
}

const requestMap = new Map<string, RequestRecord>()

/**
 * Rate limit middleware
 * @param windowMs - Time window in milliseconds (default 15 minutes)
 * @param maxRequests - Max requests per window (default 100)
 */
export function rateLimit(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown'
    const now = Date.now()

    // Get or create record for this IP
    let record = requestMap.get(clientIp)

    // Reset if window has passed
    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + windowMs,
      }
      requestMap.set(clientIp, record)
    }

    // Increment counter
    record.count++

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests)
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count))
    res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString())

    // Check if limit exceeded
    if (record.count > maxRequests) {
      const error = new RateLimitError(
        `Demasiadas solicitudes. Por favor espera ${Math.ceil((record.resetTime - now) / 1000)} segundos.`
      )
      return next(error)
    }

    next()
  }
}

/**
 * Stricter rate limit for auth endpoints (login, register)
 * 5 requests per 15 minutes
 */
export const authRateLimit = rateLimit(15 * 60 * 1000, 5)

/**
 * Standard rate limit for API endpoints
 * 100 requests per 15 minutes
 */
export const apiRateLimit = rateLimit(15 * 60 * 1000, 100)
