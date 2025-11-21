#!/usr/bin/env node
import { logger } from '../src/utils/logger.js'
import dotenv from 'dotenv'
dotenv.config()

const required = [
  { name: 'JWT_SECRET', minLen: 32 },
  { name: 'JWT_REFRESH_SECRET', minLen: 32 },
  { name: 'STRIPE_SECRET_KEY', minLen: 20 },
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

if (errors.length) {
  logger.error('Environment validation failed:')
  errors.forEach(e => logger.error(`  - ${e}`))
  process.exit(1)
}

logger.info('Environment appears valid')
