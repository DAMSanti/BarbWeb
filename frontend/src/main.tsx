import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'

// Defer non-critical initializations to after first render
// This improves LCP and FCP on mobile devices
const initializeNonCritical = async () => {
  // Use requestIdleCallback for non-critical work, with setTimeout fallback
  const scheduleTask = (task: () => void) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(task, { timeout: 2000 })
    } else {
      setTimeout(task, 100)
    }
  }

  // Initialize Sentry error tracking (deferred)
  scheduleTask(async () => {
    const { initializeSentry } = await import('./utils/sentry.ts')
    initializeSentry()
  })

  // Initialize Web Vitals tracking (deferred)
  scheduleTask(async () => {
    const { initializeWebVitalsTracking } = await import('./utils/sentry.ts')
    initializeWebVitalsTracking()
  })

  // Initialize Google Analytics 4 (deferred)
  scheduleTask(async () => {
    const { initializeAnalytics } = await import('./utils/analytics.ts')
    initializeAnalytics()
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Initialize non-critical services after render
initializeNonCritical()
