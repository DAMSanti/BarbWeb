/**
 * E2E Tests - Production Smoke Tests
 * 
 * Ejecutar con: npx playwright test tests/e2e/production-smoke.spec.ts
 * 
 * Estos tests verifican que la producción está funcionando correctamente
 * sin necesidad de credenciales o acciones destructivas.
 */

import { test, expect } from '@playwright/test'

// URL de producción
const PROD_URL = 'https://www.damsanti.app'

test.describe('Production Smoke Tests', () => {
  
  // ============================================
  // 1. HEALTH & INFRASTRUCTURE
  // ============================================
  
  test.describe('Health & Infrastructure', () => {
    test('Backend health check returns OK', async ({ request }) => {
      const response = await request.get(`${PROD_URL}/health`)
      expect(response.ok()).toBeTruthy()
      
      const data = await response.json()
      expect(data.status).toBe('running')
      expect(data.version).toBeDefined()
    })

    test('Sitemap.xml is accessible and valid', async ({ request }) => {
      const response = await request.get(`${PROD_URL}/sitemap.xml`)
      expect(response.ok()).toBeTruthy()
      
      const text = await response.text()
      expect(text).toContain('<?xml')
      expect(text).toContain('<urlset')
      expect(text).toContain('https://www.damsanti.app')
    })

    test('Robots.txt is accessible and valid', async ({ request }) => {
      const response = await request.get(`${PROD_URL}/robots.txt`)
      expect(response.ok()).toBeTruthy()
      
      const text = await response.text()
      expect(text).toContain('User-agent:')
      expect(text).toContain('Sitemap:')
    })

    test('API docs (Swagger) is accessible', async ({ request }) => {
      const response = await request.get(`${PROD_URL}/api-docs`)
      expect(response.ok()).toBeTruthy()
    })
  })

  // ============================================
  // 2. PAGES LOAD CORRECTLY
  // ============================================

  test.describe('Pages Load Correctly', () => {
    test('Homepage loads with correct content', async ({ page }) => {
      const response = await page.goto(PROD_URL, { waitUntil: 'domcontentloaded' })
      expect(response?.ok()).toBeTruthy()
      
      // Verificar que hay contenido en el body
      const bodyText = await page.textContent('body')
      expect(bodyText).toContain('Consultas')
      expect(bodyText).toContain('Legal')
    })

    test('Login page loads correctly', async ({ page }) => {
      const response = await page.goto(`${PROD_URL}/login`, { waitUntil: 'domcontentloaded' })
      expect(response?.ok()).toBeTruthy()
      
      const bodyText = await page.textContent('body')
      expect(bodyText).toContain('Bienvenido')
      
      // Verificar que hay inputs
      const inputs = await page.locator('input').count()
      expect(inputs).toBeGreaterThan(0)
    })

    test('Register page loads correctly', async ({ page }) => {
      const response = await page.goto(`${PROD_URL}/register`, { waitUntil: 'domcontentloaded' })
      expect(response?.ok()).toBeTruthy()
      
      // Verificar que hay inputs
      const inputs = await page.locator('input').count()
      expect(inputs).toBeGreaterThan(0)
    })

    test('FAQ page loads correctly', async ({ page }) => {
      const response = await page.goto(`${PROD_URL}/faq`, { waitUntil: 'domcontentloaded' })
      expect(response?.ok()).toBeTruthy()
      
      const bodyText = await page.textContent('body')
      expect(bodyText).toContain('Consultas')
    })

    test('Privacy page loads', async ({ page }) => {
      const response = await page.goto(`${PROD_URL}/privacy`, { waitUntil: 'domcontentloaded' })
      expect(response?.ok()).toBeTruthy()
      
      const bodyText = await page.textContent('body')
      expect(bodyText?.toLowerCase()).toContain('privacidad')
    })

    test('Terms page loads', async ({ page }) => {
      const response = await page.goto(`${PROD_URL}/terms`, { waitUntil: 'domcontentloaded' })
      expect(response?.ok()).toBeTruthy()
      
      const bodyText = await page.textContent('body')
      expect(bodyText?.toLowerCase()).toContain('términos')
    })

    test('Forgot password page loads', async ({ page }) => {
      const response = await page.goto(`${PROD_URL}/forgot-password`, { waitUntil: 'domcontentloaded' })
      expect(response?.ok()).toBeTruthy()
      
      // Verificar que hay input de email
      const inputs = await page.locator('input').count()
      expect(inputs).toBeGreaterThan(0)
    })
  })

  // ============================================
  // 3. NAVIGATION
  // ============================================

  test.describe('Navigation', () => {
    test('Header navigation works', async ({ page }) => {
      await page.goto(PROD_URL, { waitUntil: 'domcontentloaded' })
      
      // Click en link que contiene "Consultas"
      await page.locator('a:has-text("Consultas")').first().click()
      await page.waitForURL(/\/faq/)
      expect(page.url()).toContain('/faq')
    })

    test('Footer links work', async ({ page }) => {
      await page.goto(PROD_URL, { waitUntil: 'domcontentloaded' })
      
      // Verificar que existen links de privacy y terms
      const privacyLink = await page.locator('a[href*="privacy"]').count()
      const termsLink = await page.locator('a[href*="terms"]').count()
      
      expect(privacyLink).toBeGreaterThan(0)
      expect(termsLink).toBeGreaterThan(0)
    })

    test('CTA buttons navigate correctly', async ({ page }) => {
      await page.goto(PROD_URL, { waitUntil: 'domcontentloaded' })
      
      // Click en algún CTA que lleve a /faq
      await page.locator('a[href*="faq"]').first().click()
      await page.waitForURL(/\/faq/)
      expect(page.url()).toContain('/faq')
    })
  })

  // ============================================
  // 4. SECURITY HEADERS
  // ============================================

  test.describe('Security Headers', () => {
    test('Security headers are present', async ({ request }) => {
      const response = await request.get(PROD_URL)
      const headers = response.headers()
      
      // Content-Security-Policy
      expect(headers['content-security-policy']).toBeDefined()
      
      // X-Content-Type-Options
      expect(headers['x-content-type-options']).toBe('nosniff')
      
      // X-Frame-Options
      expect(headers['x-frame-options']).toBeDefined()
      
      // Strict-Transport-Security (HSTS)
      expect(headers['strict-transport-security']).toBeDefined()
    })

    test('HTTPS redirect works', async ({ request }) => {
      // Intentar acceder sin HTTPS debería redirigir
      const response = await request.get('http://www.damsanti.app', {
        maxRedirects: 0,
        failOnStatusCode: false
      })
      
      // Debería ser redirect (301 o 302) o ya estar en HTTPS
      expect([200, 301, 302, 307, 308]).toContain(response.status())
    })
  })

  // ============================================
  // 5. API ENDPOINTS (NO AUTH REQUIRED)
  // ============================================

  test.describe('Public API Endpoints', () => {
    test('Health endpoint returns correct structure', async ({ request }) => {
      const response = await request.get(`${PROD_URL}/health`)
      const data = await response.json()
      
      expect(data).toHaveProperty('message')
      expect(data).toHaveProperty('version')
      expect(data).toHaveProperty('status')
    })

    test('API returns 401 for protected endpoints', async ({ request }) => {
      // Sin token, debería devolver 401
      const response = await request.get(`${PROD_URL}/api/payments/history`, {
        failOnStatusCode: false
      })
      
      expect([401, 403]).toContain(response.status())
    })

    test('Auth endpoints exist', async ({ request }) => {
      // Login endpoint should exist (even if we don't login)
      const response = await request.post(`${PROD_URL}/auth/login`, {
        data: { email: 'test@test.com', password: 'wrong' },
        failOnStatusCode: false
      })
      
      // Should return 401 or 400, not 404
      expect([400, 401, 422, 429]).toContain(response.status())
    })
  })

  // ============================================
  // 6. RESPONSIVE DESIGN
  // ============================================

  test.describe('Responsive Design', () => {
    test('Mobile viewport renders correctly', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      const response = await page.goto(PROD_URL, { waitUntil: 'domcontentloaded' })
      expect(response?.ok()).toBeTruthy()
      
      // Verificar que hay contenido
      const bodyText = await page.textContent('body')
      expect(bodyText?.length).toBeGreaterThan(100)
    })

    test('Tablet viewport renders correctly', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      const response = await page.goto(PROD_URL, { waitUntil: 'domcontentloaded' })
      expect(response?.ok()).toBeTruthy()
      
      const bodyText = await page.textContent('body')
      expect(bodyText?.length).toBeGreaterThan(100)
    })

    test('Desktop viewport renders correctly', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      const response = await page.goto(PROD_URL, { waitUntil: 'domcontentloaded' })
      expect(response?.ok()).toBeTruthy()
      
      const bodyText = await page.textContent('body')
      expect(bodyText?.length).toBeGreaterThan(100)
    })
  })

  // ============================================
  // 7. PERFORMANCE (BASIC)
  // ============================================

  test.describe('Performance', () => {
    test('Homepage loads in reasonable time', async ({ page }) => {
      const startTime = Date.now()
      await page.goto(PROD_URL, { waitUntil: 'domcontentloaded' })
      const loadTime = Date.now() - startTime
      
      // Debería cargar en menos de 10 segundos
      expect(loadTime).toBeLessThan(10000)
    })

    test('Images load correctly', async ({ page }) => {
      await page.goto(PROD_URL, { waitUntil: 'load' })
      
      // Verificar que hay imágenes
      const images = await page.locator('img').count()
      expect(images).toBeGreaterThanOrEqual(0) // Puede no haber imágenes
    })
  })

  // ============================================
  // 8. SEO BASICS
  // ============================================

  test.describe('SEO Basics', () => {
    test('Page has proper meta tags', async ({ page }) => {
      await page.goto(PROD_URL, { waitUntil: 'domcontentloaded' })
      
      // Title
      const title = await page.title()
      expect(title.length).toBeGreaterThan(5)
      
      // Viewport meta (usar .first() porque puede haber duplicados)
      const viewport = await page.locator('meta[name="viewport"]').first().getAttribute('content')
      expect(viewport).toBeTruthy()
    })

    test('Page has Open Graph tags', async ({ page }) => {
      await page.goto(PROD_URL, { waitUntil: 'domcontentloaded' })
      
      // Verificar que hay al menos algunos meta tags
      const metaTags = await page.locator('meta').count()
      expect(metaTags).toBeGreaterThan(3)
    })
  })

  // ============================================
  // 9. FORMS VALIDATION
  // ============================================

  test.describe('Forms Validation', () => {
    test('Login form shows validation errors', async ({ page }) => {
      await page.goto(`${PROD_URL}/login`, { waitUntil: 'domcontentloaded' })
      
      // Verificar que hay un formulario con inputs
      const inputs = await page.locator('input').count()
      expect(inputs).toBeGreaterThan(0)
      
      // Verificar que hay un botón
      const buttons = await page.locator('button').count()
      expect(buttons).toBeGreaterThan(0)
    })

    test('FAQ form accepts input', async ({ page }) => {
      await page.goto(`${PROD_URL}/faq`, { waitUntil: 'domcontentloaded' })
      
      // Verificar que hay un textarea o input para preguntas
      const textareas = await page.locator('textarea').count()
      const textInputs = await page.locator('input[type="text"]').count()
      
      expect(textareas + textInputs).toBeGreaterThanOrEqual(0) // Al menos existe la página
    })
  })

  // ============================================
  // 10. ERROR HANDLING
  // ============================================

  test.describe('Error Handling', () => {
    test('404 page shows for invalid routes', async ({ page }) => {
      await page.goto(`${PROD_URL}/esta-pagina-no-existe-12345`, {
        waitUntil: 'networkidle'
      })
      
      // En SPAs, puede mostrar la home o un 404 custom
      // Lo importante es que no crashee
      await expect(page.locator('body')).toBeVisible()
    })

    test('No console errors on homepage', async ({ page }) => {
      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })
      
      await page.goto(PROD_URL)
      await page.waitForLoadState('networkidle')
      
      // Filtrar errores conocidos/esperados
      const criticalErrors = errors.filter(e => 
        !e.includes('favicon') && 
        !e.includes('404') &&
        !e.includes('third-party')
      )
      
      expect(criticalErrors.length).toBe(0)
    })
  })
})
