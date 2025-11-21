#!/usr/bin/env node
import dotenv from 'dotenv'
dotenv.config()

// Use console if logger not available (avoid importing project code)
const logger = console

const required = [
  { name: 'JWT_SECRET', minLen: 32 },
  { name: 'JWT_REFRESH_SECRET', minLen: 32 },
  { name: 'STRIPE_SECRET_KEY', minLen: 20 },
  // Make sure front-end can resolve the API URL (origin only)
  { name: 'VITE_API_URL', minLen: 8 },
]

let errors = []
for (const r of required) {
  const val = process.env[r.name]
  if (!val) {
    errors.push(`${r.name} is missing`)
    continue
  }
  if (val.length < r.minLen) errors.push(`${r.name} must be at least ${r.minLen} chars`)
  if (/\s/.test(val)) errors.push(`${r.name} contains whitespace`)
}

// Validate VITE_API_URL specifically as an origin (no path) and using https in production
const viteApiUrl = process.env.VITE_API_URL
if (viteApiUrl) {
  try {
    const parsed = new URL(viteApiUrl)
    if (!parsed.protocol || !(parsed.protocol === 'https:' || parsed.protocol === 'http:')) {
      errors.push('VITE_API_URL must include protocol (https:// or http://)')
    }
    if (parsed.pathname && parsed.pathname !== '/') {
      // We prefer origin only; if path present, warn but not fail
      logger.warn('VITE_API_URL contains a path — prefer settings with origin only (https://api.example.com)')
    }
  } catch (e) {
    errors.push('VITE_API_URL must be a valid URL e.g. https://api.example.com')
  }
} else {
  // No VITE_API_URL present — in production we expect it to be set
  if (process.env.NODE_ENV === 'production') {
    errors.push('VITE_API_URL must be set in production (e.g. https://api.example.com)')
  }
}

if (errors.length) {
  logger.error('Environment validation failed:')
  errors.forEach(e => logger.error(`  - ${e}`))
  process.exit(1)
}

logger.info('Environment appears valid')
