import * as Sentry from '@sentry/node'
import { Express } from 'express'
import { logger } from '../utils/logger.js'

/**
 * Initialize Sentry error tracking for the backend
 * 
 * Required environment variable:
 * - SENTRY_DSN: Your Sentry DSN from sentry.io
 * 
 * Optional environment variables:
 * - SENTRY_ENVIRONMENT: production, staging, development (defaults to NODE_ENV)
 * - SENTRY_RELEASE: Version/release identifier
 */
export function initializeSentry(): void {
  const dsn = process.env.SENTRY_DSN

  if (!dsn) {
    logger.warn('⚠️ SENTRY_DSN not configured - Error tracking disabled')
    return
  }

  try {
    Sentry.init({
      dsn,
      environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
      release: process.env.SENTRY_RELEASE || `bufete-backend@${process.env.npm_package_version || '1.0.0'}`,
      
      // Performance Monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev
      
      // Set sampling rate for profiling - this is relative to tracesSampleRate
      profilesSampleRate: 0.1,
      
      // Capture unhandled promise rejections
      integrations: [
        Sentry.captureConsoleIntegration({ levels: ['error'] }),
      ],
      
      // Filter out sensitive data
      beforeSend(event) {
        // Remove sensitive headers
        if (event.request?.headers) {
          delete event.request.headers['authorization']
          delete event.request.headers['cookie']
          delete event.request.headers['x-api-key']
        }
        
        // Remove sensitive data from request body
        if (event.request?.data) {
          const data = typeof event.request.data === 'string' 
            ? JSON.parse(event.request.data) 
            : event.request.data
          
          if (data.password) data.password = '[REDACTED]'
          if (data.refreshToken) data.refreshToken = '[REDACTED]'
          if (data.accessToken) data.accessToken = '[REDACTED]'
          
          event.request.data = JSON.stringify(data)
        }
        
        return event
      },
      
      // Ignore certain errors
      ignoreErrors: [
        // Ignore network errors that are expected
        'Network request failed',
        'Failed to fetch',
        // Ignore rate limit errors
        'Too many requests',
        // Ignore authentication errors (expected user errors)
        'Invalid credentials',
        'Token expired',
      ],
    })

    logger.info('✅ Sentry initialized for error tracking')
  } catch (error) {
    logger.error('Failed to initialize Sentry:', error)
  }
}

/**
 * Setup Sentry error handler for Express
 * This should be called after all routes are registered
 */
export function setupSentryErrorHandler(app: Express): void {
  if (!process.env.SENTRY_DSN) return
  
  // Sentry error handler must be before any other error middleware
  Sentry.setupExpressErrorHandler(app)
}

/**
 * Capture an exception manually
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  if (!process.env.SENTRY_DSN) {
    logger.error('Untracked error (Sentry disabled):', error)
    return
  }
  
  Sentry.captureException(error, {
    extra: context,
  })
}

/**
 * Capture a message manually
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  if (!process.env.SENTRY_DSN) {
    logger.info(`Untracked message (Sentry disabled): ${message}`)
    return
  }
  
  Sentry.captureMessage(message, level)
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string; role?: string }): void {
  if (!process.env.SENTRY_DSN) return
  
  Sentry.setUser({
    id: user.id,
    email: user.email,
    // Don't send role to avoid leaking admin status
  })
}

/**
 * Clear user context (on logout)
 */
export function clearUser(): void {
  if (!process.env.SENTRY_DSN) return
  
  Sentry.setUser(null)
}

export { Sentry }
