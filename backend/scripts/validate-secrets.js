#!/usr/bin/env node
/**
 * Script para validar que los JWT secrets sean válidos y no contengan espacios
 * Uso: node scripts/validate-secrets.js
 * Salida: exit 0 si OK, exit 1 si hay errores
 */

import dotenv from 'dotenv'
dotenv.config()

const logger = console

const secrets = [
  { name: 'JWT_SECRET', minLen: 32 },
  { name: 'JWT_REFRESH_SECRET', minLen: 32 },
  { name: 'STRIPE_SECRET_KEY', minLen: 20 },
]

const errors = []
const warnings = []

// Validar cada secret
for (const secret of secrets) {
  const val = process.env[secret.name]

  if (!val) {
    errors.push(`❌ ${secret.name} is missing`)
    continue
  }

  // Verificar longitud mínima
  if (val.length < secret.minLen) {
    errors.push(`❌ ${secret.name} must be at least ${secret.minLen} characters (actual: ${val.length})`)
  }

  // Verificar que NO contiene espacios (es el problema más común)
  if (/\s/.test(val)) {
    errors.push(`❌ ${secret.name} contains WHITESPACE — this is a common copy/paste issue`)
    logger.log(`   Raw value starts with: "${val.substring(0, 20)}"`)
  }

  // Advertencias
  if (val.includes('\\n') || val.includes('\\r')) {
    warnings.push(`⚠️  ${secret.name} might contain escaped newlines`)
  }

  // Verificar que son strings alfanuméricos + algunos caracteres válidos
  if (!/^[a-zA-Z0-9\-_.]*$/.test(val)) {
    warnings.push(`⚠️  ${secret.name} contains special characters (usually OK, but verify it's not an escaped value)`)
  }
}

// Output
if (errors.length > 0) {
  logger.error('\n🔴 VALIDATION FAILED:')
  errors.forEach(e => logger.error(`   ${e}`))
  process.exit(1)
}

if (warnings.length > 0) {
  logger.warn('\n🟡 WARNINGS:')
  warnings.forEach(w => logger.warn(`   ${w}`))
}

logger.info('\n✅ All secrets validated successfully!')
logger.info('   - JWT_SECRET: valid')
logger.info('   - JWT_REFRESH_SECRET: valid')
logger.info('   - STRIPE_SECRET_KEY: valid')
logger.info('\n✓ Ready for production deployment')

process.exit(0)
