import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'
import { initializeSentry, initializeWebVitalsTracking } from './utils/sentry.ts'

// Initialize Sentry error tracking before rendering
initializeSentry()

// Initialize Web Vitals tracking for performance monitoring
// Tracks: LCP, FID, CLS, TTFB, FCP
initializeWebVitalsTracking()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
