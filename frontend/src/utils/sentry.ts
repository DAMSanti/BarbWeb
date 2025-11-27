import * as Sentry from '@sentry/react'

// Safe environment variable access - Vite replaces these at build time
// but we need to handle cases where it might not be available
const getEnv = () => {
  try {
    // Vite injects import.meta.env at build time
    // In production, this should always work if built with Vite
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env
    }
  } catch {
    // Fallback for non-Vite environments
  }
  return {
    DEV: false,
    PROD: true,
    MODE: 'production',
    VITE_SENTRY_DSN: '',
    VITE_APP_VERSION: '1.0.0',
  }
}

// Cache the env to avoid repeated access
const env = getEnv()

// Check if we're in development mode
const isDev = env.DEV === true

/**
 * Initialize Sentry error tracking for the frontend
 * 
 * Required environment variable:
 * - VITE_SENTRY_DSN: Your Sentry DSN from sentry.io (frontend project)
 */
export function initializeSentry(): void {
  const dsn = env.VITE_SENTRY_DSN

  if (!dsn) {
    // Only log in dev mode
    if (isDev && globalThis.console?.warn) {
      globalThis.console.warn('⚠️ VITE_SENTRY_DSN not configured - Frontend error tracking disabled')
    }
    return
  }

  try {
    Sentry.init({
      dsn,
      environment: env.MODE || 'production',
      release: `bufete-frontend@${env.VITE_APP_VERSION || '1.0.0'}`,
      
      // Performance Monitoring
      tracesSampleRate: env.PROD ? 0.1 : 1.0,
      
      // Session Replay for debugging user issues
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
      
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          // Mask all text and inputs for privacy
          maskAllText: false,
          maskAllInputs: true,
          // Block media for smaller replays
          blockAllMedia: true,
        }),
      ],
      
      // Filter out sensitive data
      beforeSend(event) {
        // Remove sensitive data from breadcrumbs
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
            if (breadcrumb.data) {
              // Redact tokens from XHR/fetch breadcrumbs
              if (breadcrumb.data.url?.includes('token')) {
                breadcrumb.data.url = '[URL with token redacted]'
              }
            }
            return breadcrumb
          })
        }
        
        return event
      },
      
      // Ignore certain errors
      ignoreErrors: [
        // Network errors
        'Network request failed',
        'Failed to fetch',
        'Load failed',
        'NetworkError',
        // User-caused errors
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        // Extension errors
        'chrome-extension://',
        'moz-extension://',
        // Ignore cancelled requests
        'AbortError',
      ],
      
      // Don't send events from these URLs
      denyUrls: [
        // Chrome extensions
        /extensions\//i,
        /^chrome:\/\//i,
        /^chrome-extension:\/\//i,
        // Firefox extensions
        /^moz-extension:\/\//i,
        // Safari extensions
        /^safari-extension:\/\//i,
      ],
    })

    if (isDev && globalThis.console?.info) {
      globalThis.console.info('✅ Sentry initialized for frontend error tracking')
    }
  } catch (error) {
    if (isDev && globalThis.console?.error) {
      globalThis.console.error('Failed to initialize Sentry:', error)
    }
  }
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string }): void {
  if (!env.VITE_SENTRY_DSN) return
  
  Sentry.setUser({
    id: user.id,
    email: user.email,
  })
}

/**
 * Clear user context (on logout)
 */
export function clearUser(): void {
  if (!env.VITE_SENTRY_DSN) return
  
  Sentry.setUser(null)
}

/**
 * Capture an exception manually
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (!env.VITE_SENTRY_DSN) {
    if (isDev && globalThis.console?.error) {
      globalThis.console.error('Untracked error (Sentry disabled):', error)
    }
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
  if (!env.VITE_SENTRY_DSN) return
  
  Sentry.captureMessage(message, level)
}

// Export Sentry for direct access if needed
export { Sentry }

// Export ErrorBoundary component for React error boundaries
export const SentryErrorBoundary = Sentry.ErrorBoundary
