/**
 * Unit Tests - Sitemap Routes
 * Tests para generación de sitemap.xml para SEO
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'

// Mock logger para capturar errores - debe usar vi.hoisted
const { mockLogger } = vi.hoisted(() => ({
  mockLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('../../src/utils/logger', () => ({
  logger: mockLogger,
}))

import sitemapRouter from '../../src/routes/sitemap'

describe('Sitemap Routes', () => {
  let app: express.Application

  beforeEach(() => {
    vi.clearAllMocks()
    app = express()
    app.use(sitemapRouter)
  })

  describe('GET /sitemap.xml', () => {
    it('should return valid XML sitemap', async () => {
      const response = await request(app).get('/sitemap.xml')

      expect(response.status).toBe(200)
      expect(response.type).toBe('application/xml')
      expect(response.text).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(response.text).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
      expect(response.text).toContain('</urlset>')
    })

    it('should include all required URLs', async () => {
      const response = await request(app).get('/sitemap.xml')

      expect(response.status).toBe(200)
      expect(response.text).toContain('https://barbweb.com')
      expect(response.text).toContain('https://barbweb.com/faq')
      expect(response.text).toContain('https://barbweb.com/about')
      expect(response.text).toContain('https://barbweb.com/contact')
      expect(response.text).toContain('https://barbweb.com/login')
      expect(response.text).toContain('https://barbweb.com/register')
      expect(response.text).toContain('https://barbweb.com/privacy')
      expect(response.text).toContain('https://barbweb.com/terms')
    })

    it('should include lastmod, changefreq, and priority for each URL', async () => {
      const response = await request(app).get('/sitemap.xml')

      expect(response.status).toBe(200)
      expect(response.text).toContain('<lastmod>')
      expect(response.text).toContain('</lastmod>')
      expect(response.text).toContain('<changefreq>')
      expect(response.text).toContain('</changefreq>')
      expect(response.text).toContain('<priority>')
      expect(response.text).toContain('</priority>')
    })

    it('should have correct priority values', async () => {
      const response = await request(app).get('/sitemap.xml')

      expect(response.status).toBe(200)
      expect(response.text).toContain('<priority>1</priority>') // Homepage (1.0 becomes 1)
      expect(response.text).toContain('<priority>0.9</priority>') // FAQ
      expect(response.text).toContain('<priority>0.8</priority>') // About
      expect(response.text).toContain('<priority>0.7</priority>') // Contact
      expect(response.text).toContain('<priority>0.6</priority>') // Auth pages
      expect(response.text).toContain('<priority>0.5</priority>') // Legal pages
    })

    it('should have correct changefreq values', async () => {
      const response = await request(app).get('/sitemap.xml')

      expect(response.status).toBe(200)
      expect(response.text).toContain('<changefreq>weekly</changefreq>')
      expect(response.text).toContain('<changefreq>monthly</changefreq>')
      expect(response.text).toContain('<changefreq>never</changefreq>')
      expect(response.text).toContain('<changefreq>yearly</changefreq>')
    })

    it('should set proper cache headers', async () => {
      const response = await request(app).get('/sitemap.xml')

      expect(response.status).toBe(200)
      expect(response.headers['cache-control']).toBe('public, max-age=86400')
    })

    it('should use today\'s date for lastmod', async () => {
      const response = await request(app).get('/sitemap.xml')
      const today = new Date().toISOString().split('T')[0]

      expect(response.status).toBe(200)
      expect(response.text).toContain(`<lastmod>${today}</lastmod>`)
    })

    it('should not include private routes like /admin or /api', async () => {
      const response = await request(app).get('/sitemap.xml')

      expect(response.status).toBe(200)
      expect(response.text).not.toContain('/admin')
      expect(response.text).not.toContain('/api')
      expect(response.text).not.toContain('/checkout')
    })

    it('should have proper XML structure with url entries', async () => {
      const response = await request(app).get('/sitemap.xml')

      expect(response.status).toBe(200)
      // Count <url> tags
      const urlCount = (response.text.match(/<url>/g) || []).length
      expect(urlCount).toBeGreaterThan(0)
      // Count </url> tags (should match)
      const closeUrlCount = (response.text.match(/<\/url>/g) || []).length
      expect(closeUrlCount).toBe(urlCount)
    })

    it('should include <loc> tag for each URL', async () => {
      const response = await request(app).get('/sitemap.xml')

      expect(response.status).toBe(200)
      const locCount = (response.text.match(/<loc>/g) || []).length
      const urlCount = (response.text.match(/<url>/g) || []).length
      expect(locCount).toBe(urlCount)
    })
  })

  describe('GET /sitemap', () => {
    it('should redirect to /sitemap.xml', async () => {
      const response = await request(app).get('/sitemap').redirects(0)

      expect(response.status).toBe(302)
      expect(response.headers.location).toBe('/sitemap.xml')
    })

    it('should follow redirect and return XML', async () => {
      const response = await request(app)
        .get('/sitemap')
        .redirects(1)

      expect(response.status).toBe(200)
      expect(response.type).toBe('application/xml')
      expect(response.text).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    })
  })

  describe('Sitemap content validation', () => {
    it('should have exactly 8 URLs in sitemap', async () => {
      const response = await request(app).get('/sitemap.xml')

      expect(response.status).toBe(200)
      const urlCount = (response.text.match(/<url>/g) || []).length
      expect(urlCount).toBe(8)
    })

    it('should have homepage with highest priority', async () => {
      const response = await request(app).get('/sitemap.xml')

      expect(response.status).toBe(200)
      // Homepage should have priority 1 (1.0 in JavaScript becomes 1)
      expect(response.text).toMatch(
        /<url>\s*<loc>https:\/\/barbweb\.com<\/loc>[\s\S]*?<priority>1<\/priority>/
      )
    })

    it('should have valid lastmod dates in ISO format', async () => {
      const response = await request(app).get('/sitemap.xml')

      expect(response.status).toBe(200)
      const lastmodMatches = response.text.match(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g)
      expect(lastmodMatches).toBeTruthy()
      expect(lastmodMatches!.length).toBeGreaterThan(0)
    })

    it('should have valid priority values (0.0 to 1.0)', async () => {
      const response = await request(app).get('/sitemap.xml')

      expect(response.status).toBe(200)
      const priorityMatches = response.text.match(/<priority>[\d.]+<\/priority>/g)
      expect(priorityMatches).toBeTruthy()
      if (priorityMatches) {
        priorityMatches.forEach((match: string) => {
          const value = parseFloat(match.replace(/<\/?priority>/g, ''))
          expect(value).toBeGreaterThanOrEqual(0)
          expect(value).toBeLessThanOrEqual(1)
        })
      }
    })

    it('should generate valid XML even with special characters in URLs', async () => {
      const response = await request(app).get('/sitemap.xml')

      expect(response.status).toBe(200)
      // No hay & sin escapar
      expect(response.text).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;)/)
    })

    it('should have proper content-type header', async () => {
      const response = await request(app).get('/sitemap.xml')

      expect(response.status).toBe(200)
      expect(response.headers['content-type']).toContain('application/xml')
    })
  })

  describe('Error handling', () => {
    it('should return 500 and log error when res.type throws', async () => {
      // Create a custom app that intercepts the response
      const errorApp = express()
      
      // Add middleware that makes res.type throw
      errorApp.use((_req, res, next) => {
        const originalType = res.type.bind(res)
        res.type = () => {
          throw new Error('Simulated res.type error')
        }
        // Restore after first call fails
        setTimeout(() => {
          res.type = originalType
        }, 0)
        next()
      })
      
      // Mount the real sitemap router
      errorApp.use(sitemapRouter)

      const response = await request(errorApp).get('/sitemap.xml')

      expect(response.status).toBe(500)
      expect(response.text).toBe('Error generating sitemap')
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error generating sitemap:',
        expect.any(Error)
      )
    })

    it('should return 500 and log error when res.send throws', async () => {
      const errorApp = express()
      
      // Add middleware that makes res.send throw after type is set
      errorApp.use((_req, res, next) => {
        const originalSend = res.send.bind(res)
        let callCount = 0
        res.send = (body?: unknown) => {
          callCount++
          // First call (from the try block) should throw
          if (callCount === 1 && typeof body === 'string' && body.includes('<?xml')) {
            throw new Error('Simulated res.send error')
          }
          // Second call (from catch block) should work
          return originalSend(body)
        }
        next()
      })
      
      errorApp.use(sitemapRouter)

      const response = await request(errorApp).get('/sitemap.xml')

      expect(response.status).toBe(500)
      expect(response.text).toBe('Error generating sitemap')
      expect(mockLogger.error).toHaveBeenCalled()
    })
  })
})
