import * as Sentry from '@sentry/react'

// Check if we're in development mode safely
const isDev = (): boolean => {
  try {
    return import.meta.env?.DEV === true
  } catch {
    return false
  }
}

// Safe logging that won't trigger lint errors in production
const safeLog = {
  warn: (...args: unknown[]) => { if (isDev()) globalThis.console?.warn?.(...args) },
  error: (...args: unknown[]) => { if (isDev()) globalThis.console?.error?.(...args) },
  info: (...args: unknown[]) => { if (isDev()) globalThis.console?.info?.(...args) },
}

/**
 * Initialize Sentry error tracking for the frontend
 * 
 * Required environment variable:
 * - VITE_SENTRY_DSN: Your Sentry DSN from sentry.io (frontend project)
 */
export function initializeSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN

  if (!dsn) {
    safeLog.warn('⚠️ VITE_SENTRY_DSN not configured - Frontend error tracking disabled')
    return
  }

  try {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE || 'development',
      release: `bufete-frontend@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
      
      // Performance Monitoring
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
      
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

    safeLog.info('✅ Sentry initialized for frontend error tracking')
  } catch (error) {
    safeLog.error('Failed to initialize Sentry:', error)
  }
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string }): void {
  if (!import.meta.env.VITE_SENTRY_DSN) return
  
  Sentry.setUser({
    id: user.id,
    email: user.email,
  })
}

/**
 * Clear user context (on logout)
 */
export function clearUser(): void {
  if (!import.meta.env.VITE_SENTRY_DSN) return
  
  Sentry.setUser(null)
}

/**
 * Capture an exception manually
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    safeLog.error('Untracked error (Sentry disabled):', error)
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
  if (!import.meta.env.VITE_SENTRY_DSN) return
  
  Sentry.captureMessage(message, level)
}

// Export Sentry for direct access if needed
export { Sentry }

// Export ErrorBoundary component for React error boundaries
export const SentryErrorBoundary = Sentry.ErrorBoundary
