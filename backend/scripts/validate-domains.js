#!/usr/bin/env node
import dotenv from 'dotenv'
import dns from 'dns'
import https from 'https'
import { URL } from 'url'

dotenv.config()

const logger = console
const dnsLookup = dns.promises.lookup

const toCheck = []
if (process.env.VITE_API_URL) {
  try {
    const parsed = new URL(process.env.VITE_API_URL)
    toCheck.push({ name: 'VITE_API_URL', origin: parsed.origin, host: parsed.hostname })
  } catch (e) {
    logger.error('VITE_API_URL is not a valid URL')
    process.exit(1)
  }
}
if (process.env.APP_DOMAIN) {
  // If APP_DOMAIN is a domain only (no protocol), assume https
  const origin = process.env.APP_DOMAIN.startsWith('http') ? process.env.APP_DOMAIN : `https://${process.env.APP_DOMAIN}`
  try {
    const parsed = new URL(origin)
    toCheck.push({ name: 'APP_DOMAIN', origin: parsed.origin, host: parsed.hostname })
  } catch (e) {
    logger.error('APP_DOMAIN is not a valid hostname')
    process.exit(1)
  }
}

if (!toCheck.length) {
  logger.info('No VITE_API_URL or APP_DOMAIN set; nothing to validate.')
  process.exit(0)
}

async function checkHost(host) {
  try {
    const res = await dnsLookup(host)
    return { ok: true, address: res.address }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

async function checkHealth(origin) {
  return new Promise((resolve) => {
    try {
      const url = new URL('/health', origin)
      const req = https.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 500, status: res.statusCode })
      })
      req.on('error', (e) => resolve({ ok: false, error: e.message }))
      req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'timeout' }) })
      req.end()
    } catch (err) {
      resolve({ ok: false, error: err.message })
    }
  })
}

;(async () => {
  let overallOk = true
  for (const t of toCheck) {
    logger.info(`Checking ${t.name} => ${t.origin} (${t.host})`)
    const dnsRes = await checkHost(t.host)
    if (dnsRes.ok) logger.info(`  DNS: ${t.host} resolves to ${dnsRes.address}`)
    else {
      logger.error(`  DNS: ${t.host} lookup failed: ${dnsRes.error}`)
      overallOk = false
    }

    const healthRes = await checkHealth(t.origin)
    if (healthRes.ok) logger.info(`  Health: ${t.origin}/health responded with ${healthRes.status}`)
    else {
      logger.error(`  Health: ${t.origin}/health unreachable: ${healthRes.error || healthRes.status}`)
      overallOk = false
    }
  }
  if (!overallOk) process.exit(1)
  logger.info('All checks passed')
  process.exit(0)
})()
