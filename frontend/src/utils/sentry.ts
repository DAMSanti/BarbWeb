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

/**
 * Initialize Sentry error tracking for the frontend
 * 
 * Required environment variable:
 * - VITE_SENTRY_DSN: Your Sentry DSN from sentry.io (frontend project)
 */
export function initializeSentry(): void {
  const dsn = env.VITE_SENTRY_DSN

  if (!dsn) {
    // Sentry not configured - silent return in production
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

    // Sentry initialized successfully
  } catch {
    // Sentry initialization failed - silent in production
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
    // Sentry not configured - error not tracked
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

/**
 * Web Vitals Metrics Interface
 * Compatible with web-vitals library format
 */
interface WebVitalsMetric {
  name: 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  id: string
}

/**
 * Report Web Vitals metrics to Sentry
 * This function is called by web-vitals library callbacks
 */
export function reportWebVitals(metric: WebVitalsMetric): void {
  if (!env.VITE_SENTRY_DSN) return

  // Send Web Vital as a Sentry measurement
  Sentry.setMeasurement(metric.name, metric.value, metric.name === 'CLS' ? '' : 'millisecond')
  
  // Also capture as a custom event for dashboard tracking
  Sentry.addBreadcrumb({
    category: 'web-vitals',
    message: `${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`,
    level: metric.rating === 'poor' ? 'warning' : 'info',
    data: {
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
    },
  })

  // If a Web Vital is poor, capture it as an issue
  if (metric.rating === 'poor') {
    Sentry.captureMessage(`Poor ${metric.name}: ${metric.value.toFixed(2)}`, {
      level: 'warning',
      tags: {
        'web-vital': metric.name,
        rating: metric.rating,
      },
      extra: {
        value: metric.value,
        id: metric.id,
        thresholds: getWebVitalThresholds(metric.name),
      },
    })
  }
}

/**
 * Get Web Vital thresholds for reference
 */
function getWebVitalThresholds(name: string): { good: number; poor: number } {
  const thresholds: Record<string, { good: number; poor: number }> = {
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    FID: { good: 100, poor: 300 },
    INP: { good: 200, poor: 500 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 },
  }
  return thresholds[name] || { good: 0, poor: 0 }
}

/**
 * Initialize Web Vitals tracking using the browser's native Performance API
 * This doesn't require the web-vitals library
 */
export function initializeWebVitalsTracking(): void {
  if (!env.VITE_SENTRY_DSN) return
  if (typeof window === 'undefined' || !window.performance) return

  // Track Largest Contentful Paint (LCP)
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number }
      if (lastEntry) {
        const value = lastEntry.startTime
        reportWebVitals({
          name: 'LCP',
          value,
          rating: value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor',
          id: `lcp-${Date.now()}`,
        })
      }
    })
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
  } catch {
    // LCP not supported
  }

  // Track First Input Delay (FID) / Interaction to Next Paint (INP)
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        const fidEntry = entry as PerformanceEntry & { processingStart: number; startTime: number }
        const value = fidEntry.processingStart - fidEntry.startTime
        reportWebVitals({
          name: 'FID',
          value,
          rating: value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor',
          id: `fid-${Date.now()}`,
        })
      })
    })
    fidObserver.observe({ type: 'first-input', buffered: true })
  } catch {
    // FID not supported
  }

  // Track Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        const clsEntry = entry as PerformanceEntry & { hadRecentInput: boolean; value: number }
        if (!clsEntry.hadRecentInput) {
          clsValue += clsEntry.value
        }
      })
    })
    clsObserver.observe({ type: 'layout-shift', buffered: true })
    
    // Report CLS on page unload
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        reportWebVitals({
          name: 'CLS',
          value: clsValue,
          rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor',
          id: `cls-${Date.now()}`,
        })
      }
    })
  } catch {
    // CLS not supported
  }

  // Track Time to First Byte (TTFB)
  try {
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navEntry) {
      const value = navEntry.responseStart - navEntry.requestStart
      reportWebVitals({
        name: 'TTFB',
        value,
        rating: value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor',
        id: `ttfb-${Date.now()}`,
      })
    }
  } catch {
    // TTFB not supported
  }

  // Track First Contentful Paint (FCP)
  try {
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const fcpEntry = entries.find(e => e.name === 'first-contentful-paint')
      if (fcpEntry) {
        const value = fcpEntry.startTime
        reportWebVitals({
          name: 'FCP',
          value,
          rating: value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor',
          id: `fcp-${Date.now()}`,
        })
      }
    })
    fcpObserver.observe({ type: 'paint', buffered: true })
  } catch {
    // FCP not supported
  }
}
