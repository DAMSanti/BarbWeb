import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'
import { initializeSentry, initializeWebVitalsTracking } from './utils/sentry.ts'
import { initializeAnalytics } from './utils/analytics.ts'

// Initialize Sentry error tracking before rendering
initializeSentry()

// Initialize Web Vitals tracking for performance monitoring
// Tracks: LCP, FID, CLS, TTFB, FCP
initializeWebVitalsTracking()

// Initialize Google Analytics 4
// Requires VITE_GA_MEASUREMENT_ID in environment variables
initializeAnalytics()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
