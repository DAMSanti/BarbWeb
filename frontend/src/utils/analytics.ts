/**
 * Google Analytics 4 - Analytics Utility
 * 
 * Este módulo proporciona:
 * - Inicialización de GA4
 * - Event tracking tipado
 * - Conversion tracking para Stripe
 * - User funnel tracking
 * - E-commerce tracking
 * 
 * @example
 * import { trackEvent, trackPageView, trackPurchase } from './utils/analytics'
 * 
 * // Track custom event
 * trackEvent('button_click', { button_name: 'submit' })
 * 
 * // Track purchase
 * trackPurchase('consultation-123', 35, 'EUR')
 */

// Extend Window interface for gtag
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

// GA4 Measurement ID - configurar en .env
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || ''

/**
 * Initialize Google Analytics 4
 * Should be called once at app startup
 */
export function initializeAnalytics(): void {
  if (!GA_MEASUREMENT_ID) {
    // Analytics disabled - no measurement ID configured
    return
  }

  // Skip in development unless explicitly enabled
  if (import.meta.env.DEV && !import.meta.env.VITE_ENABLE_ANALYTICS_DEV) {
    // Analytics disabled in development mode
    return
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || []

  // Define gtag function
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args)
  }

  // Initialize GA4
  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false, // We'll track page views manually for SPAs
    cookie_flags: 'SameSite=None;Secure',
    anonymize_ip: true, // GDPR compliance
  })

  // Load GA4 script dynamically
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)

  // GA4 initialized successfully
}

/**
 * Check if analytics is available
 */
function isAnalyticsAvailable(): boolean {
  return typeof window !== 'undefined' && 
         typeof window.gtag === 'function' && 
         !!GA_MEASUREMENT_ID
}

// ============================================================
// PAGE VIEW TRACKING
// ============================================================

/**
 * Track a page view (for SPA navigation)
 * Call this on route changes
 */
export function trackPageView(path: string, title?: string): void {
  if (!isAnalyticsAvailable()) return

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
  })
}

// ============================================================
// EVENT TRACKING
// ============================================================

type EventCategory = 
  | 'engagement'
  | 'conversion'
  | 'navigation'
  | 'form'
  | 'error'
  | 'auth'
  | 'payment'
  | 'consultation'

interface EventParams {
  category?: EventCategory
  label?: string
  value?: number
  [key: string]: unknown
}

/**
 * Track a custom event
 */
export function trackEvent(
  eventName: string, 
  params: EventParams = {}
): void {
  if (!isAnalyticsAvailable()) return

  window.gtag('event', eventName, {
    event_category: params.category || 'engagement',
    event_label: params.label,
    value: params.value,
    ...params,
  })
}

// ============================================================
// USER FUNNEL TRACKING
// ============================================================

/**
 * Funnel step names for user journey tracking
 */
export const FunnelSteps = {
  // Main conversion funnel
  LANDING: 'funnel_landing',
  VIEW_FAQ: 'funnel_view_faq',
  ASK_QUESTION: 'funnel_ask_question',
  VIEW_CONSULTATION: 'funnel_view_consultation',
  START_CHECKOUT: 'funnel_start_checkout',
  COMPLETE_PAYMENT: 'funnel_complete_payment',
  
  // Auth funnel
  VIEW_LOGIN: 'funnel_view_login',
  VIEW_REGISTER: 'funnel_view_register',
  COMPLETE_REGISTER: 'funnel_complete_register',
  COMPLETE_LOGIN: 'funnel_complete_login',
} as const

/**
 * Track a funnel step
 */
export function trackFunnelStep(
  step: keyof typeof FunnelSteps,
  additionalParams?: Record<string, unknown>
): void {
  trackEvent(FunnelSteps[step], {
    category: 'conversion',
    ...additionalParams,
  })
}

// ============================================================
// AUTH TRACKING
// ============================================================

/**
 * Track user registration
 */
export function trackSignUp(method: 'email' | 'google' | 'microsoft'): void {
  trackEvent('sign_up', {
    category: 'auth',
    method,
  })
  trackFunnelStep('COMPLETE_REGISTER', { method })
}

/**
 * Track user login
 */
export function trackLogin(method: 'email' | 'google' | 'microsoft'): void {
  trackEvent('login', {
    category: 'auth',
    method,
  })
  trackFunnelStep('COMPLETE_LOGIN', { method })
}

/**
 * Track logout
 */
export function trackLogout(): void {
  trackEvent('logout', {
    category: 'auth',
  })
}

// ============================================================
// E-COMMERCE / PAYMENT TRACKING
// ============================================================

interface ConsultationItem {
  id: string
  category: string
  price: number
}

/**
 * Track when user views a consultation/service
 */
export function trackViewItem(item: ConsultationItem): void {
  if (!isAnalyticsAvailable()) return

  window.gtag('event', 'view_item', {
    currency: 'EUR',
    value: item.price,
    items: [{
      item_id: item.id,
      item_name: `Consulta Legal - ${item.category}`,
      item_category: item.category,
      price: item.price,
      quantity: 1,
    }],
  })
}

/**
 * Track when user begins checkout
 */
export function trackBeginCheckout(
  consultationId: string,
  category: string,
  price: number
): void {
  if (!isAnalyticsAvailable()) return

  window.gtag('event', 'begin_checkout', {
    currency: 'EUR',
    value: price * 1.21, // Include IVA
    items: [{
      item_id: consultationId,
      item_name: `Consulta Legal - ${category}`,
      item_category: category,
      price: price * 1.21,
      quantity: 1,
    }],
  })
  
  trackFunnelStep('START_CHECKOUT', { 
    consultation_id: consultationId,
    category,
  })
}

/**
 * Track successful purchase
 * This is a CONVERSION event for revenue tracking
 */
export function trackPurchase(
  transactionId: string,
  consultationId: string,
  category: string,
  price: number,
  tax: number
): void {
  if (!isAnalyticsAvailable()) return

  const total = price + tax

  window.gtag('event', 'purchase', {
    transaction_id: transactionId,
    value: total,
    currency: 'EUR',
    tax: tax,
    items: [{
      item_id: consultationId,
      item_name: `Consulta Legal - ${category}`,
      item_category: category,
      price: price,
      quantity: 1,
    }],
  })

  // Also track as conversion
  trackEvent('conversion_purchase', {
    category: 'conversion',
    value: total,
    transaction_id: transactionId,
  })

  trackFunnelStep('COMPLETE_PAYMENT', {
    transaction_id: transactionId,
    value: total,
  })
}

/**
 * Track failed payment
 */
export function trackPaymentFailed(
  consultationId: string,
  errorMessage: string
): void {
  trackEvent('payment_failed', {
    category: 'payment',
    consultation_id: consultationId,
    error_message: errorMessage,
  })
}

/**
 * Track refund
 */
export function trackRefund(
  transactionId: string,
  amount: number
): void {
  if (!isAnalyticsAvailable()) return

  window.gtag('event', 'refund', {
    transaction_id: transactionId,
    value: amount,
    currency: 'EUR',
  })
}

// ============================================================
// CONSULTATION TRACKING
// ============================================================

/**
 * Track FAQ question asked
 */
export function trackFAQQuestion(
  question: string,
  category: string,
  foundMatch: boolean
): void {
  trackEvent('faq_question', {
    category: 'consultation',
    question_category: category,
    found_match: foundMatch,
    question_length: question.length,
  })
}

/**
 * Track when user requests professional consultation
 */
export function trackRequestConsultation(category: string): void {
  trackEvent('request_consultation', {
    category: 'consultation',
    consultation_category: category,
  })
  
  trackFunnelStep('VIEW_CONSULTATION', { category })
}

// ============================================================
// ENGAGEMENT TRACKING
// ============================================================

/**
 * Track button clicks
 */
export function trackButtonClick(
  buttonName: string,
  location: string
): void {
  trackEvent('button_click', {
    category: 'engagement',
    button_name: buttonName,
    click_location: location,
  })
}

/**
 * Track form submissions
 */
export function trackFormSubmit(
  formName: string,
  success: boolean
): void {
  trackEvent('form_submit', {
    category: 'form',
    form_name: formName,
    success,
  })
}

/**
 * Track external link clicks
 */
export function trackOutboundLink(url: string): void {
  trackEvent('click', {
    category: 'navigation',
    link_url: url,
    outbound: true,
  })
}

/**
 * Track scroll depth
 */
export function trackScrollDepth(percentage: number): void {
  if (percentage !== 25 && percentage !== 50 && percentage !== 75 && percentage !== 100) {
    return // Only track milestone percentages
  }
  
  trackEvent('scroll', {
    category: 'engagement',
    percent_scrolled: percentage,
  })
}

/**
 * Track time on page (call when leaving)
 */
export function trackTimeOnPage(seconds: number): void {
  trackEvent('timing_complete', {
    category: 'engagement',
    name: 'time_on_page',
    value: Math.round(seconds),
  })
}

// ============================================================
// ERROR TRACKING
// ============================================================

/**
 * Track JavaScript errors
 */
export function trackError(
  errorMessage: string,
  errorSource?: string
): void {
  trackEvent('exception', {
    category: 'error',
    description: errorMessage,
    fatal: false,
    error_source: errorSource,
  })
}

// ============================================================
// USER PROPERTIES
// ============================================================

/**
 * Set user ID for cross-device tracking
 * Call after successful login
 */
export function setUserId(userId: string): void {
  if (!isAnalyticsAvailable()) return

  window.gtag('config', GA_MEASUREMENT_ID, {
    user_id: userId,
  })
}

/**
 * Set user properties
 */
export function setUserProperties(properties: {
  user_type?: 'anonymous' | 'registered' | 'admin'
  subscription_status?: string
  [key: string]: unknown
}): void {
  if (!isAnalyticsAvailable()) return

  window.gtag('set', 'user_properties', properties)
}

// ============================================================
// REACT HOOKS INTEGRATION
// ============================================================

/**
 * Hook for tracking page views on route change
 * Use with React Router
 * 
 * @example
 * import { useLocation } from 'react-router-dom'
 * import { usePageTracking } from './utils/analytics'
 * 
 * function App() {
 *   const location = useLocation()
 *   usePageTracking(location.pathname)
 *   // ...
 * }
 */
export function usePageTracking(pathname: string): void {
  // This will be called by the component
  // The actual useEffect should be in the component
}

// ============================================================
// CONSENT MANAGEMENT (GDPR)
// ============================================================

/**
 * Update consent mode
 * Call when user updates cookie preferences
 */
export function updateConsent(granted: boolean): void {
  if (!isAnalyticsAvailable()) return

  window.gtag('consent', 'update', {
    analytics_storage: granted ? 'granted' : 'denied',
    ad_storage: 'denied', // We don't use ads
  })
}

/**
 * Default denied consent (GDPR compliant)
 * Call before loading GA4 if no consent stored
 */
export function setDefaultConsent(): void {
  if (typeof window === 'undefined') return

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args)
  }

  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    wait_for_update: 500,
  })
}

// ============================================================
// DEBUG MODE
// ============================================================

/**
 * Enable debug mode (shows events in console)
 */
export function enableDebugMode(): void {
  if (!isAnalyticsAvailable()) return

  window.gtag('config', GA_MEASUREMENT_ID, {
    debug_mode: true,
  })
  
  // Debug mode enabled - check GA4 DebugView in Google Analytics
}

/**
 * Log all events to console (development only)
 * Note: This function is intentionally a no-op in production builds
 */
export function logEventsToConsole(): void {
  // This function only works in development with browser console
  // In production, use Google Analytics DebugView instead
}
