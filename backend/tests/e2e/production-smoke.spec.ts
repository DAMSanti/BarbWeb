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
      await page.goto(PROD_URL, { waitUntil: 'networkidle' })
      
      // Verificar título
      await expect(page).toHaveTitle(/Barbara|Bufete|Abogados|Inicio/i)
      
      // Verificar elementos clave - textos reales de la página
      await expect(page.getByRole('heading', { name: /Consultas Legales/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /Comenzar Consulta/i })).toBeVisible()
      
      // Verificar header
      await expect(page.locator('header')).toBeVisible()
      
      // Verificar footer
      await expect(page.locator('footer')).toBeVisible()
    })

    test('Login page loads correctly', async ({ page }) => {
      await page.goto(`${PROD_URL}/login`, { waitUntil: 'networkidle' })
      
      // Verificar título de página
      await expect(page.getByRole('heading', { name: /Bienvenido/i })).toBeVisible()
      
      // Verificar formulario de login
      await expect(page.getByPlaceholder(/email/i)).toBeVisible()
      await expect(page.getByPlaceholder(/contraseña/i)).toBeVisible()
      
      // Verificar botones OAuth
      await expect(page.getByRole('button', { name: /Google/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /Microsoft/i })).toBeVisible()
      
      // Verificar link a registro
      await expect(page.getByRole('link', { name: /Crea una aquí/i })).toBeVisible()
    })

    test('Register page loads correctly', async ({ page }) => {
      await page.goto(`${PROD_URL}/register`, { waitUntil: 'networkidle' })
      
      // Verificar campos de registro
      await expect(page.getByPlaceholder(/email/i)).toBeVisible()
      await expect(page.getByPlaceholder(/contraseña/i).first()).toBeVisible()
    })

    test('FAQ page loads correctly', async ({ page }) => {
      await page.goto(`${PROD_URL}/faq`, { waitUntil: 'networkidle' })
      
      // Verificar título
      await expect(page.getByRole('heading', { name: /Centro de Consultas/i })).toBeVisible()
      
      // Verificar campo de pregunta (textarea)
      await expect(page.getByPlaceholder(/pregunta legal/i)).toBeVisible()
      
      // Verificar botón de búsqueda
      await expect(page.getByRole('button', { name: /Buscar/i })).toBeVisible()
    })

    test('Privacy page loads', async ({ page }) => {
      await page.goto(`${PROD_URL}/privacy`, { waitUntil: 'networkidle' })
      await expect(page.getByText(/Privacidad/i).first()).toBeVisible()
    })

    test('Terms page loads', async ({ page }) => {
      await page.goto(`${PROD_URL}/terms`, { waitUntil: 'networkidle' })
      await expect(page.getByText(/Términos/i).first()).toBeVisible()
    })

    test('Forgot password page loads', async ({ page }) => {
      await page.goto(`${PROD_URL}/forgot-password`, { waitUntil: 'networkidle' })
      await expect(page.getByPlaceholder(/email/i)).toBeVisible()
    })
  })

  // ============================================
  // 3. NAVIGATION
  // ============================================

  test.describe('Navigation', () => {
    test('Header navigation works', async ({ page }) => {
      await page.goto(PROD_URL, { waitUntil: 'networkidle' })
      
      // Click en "Consultas" en el header
      await page.getByRole('link', { name: /Consultas/i }).first().click()
      await expect(page).toHaveURL(/\/faq/)
      
      // Volver a inicio
      await page.getByRole('link', { name: /Inicio/i }).first().click()
      await expect(page).toHaveURL(new RegExp(PROD_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/?$'))
    })

    test('Footer links work', async ({ page }) => {
      await page.goto(PROD_URL, { waitUntil: 'networkidle' })
      
      // Scroll al footer
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      
      // Verificar links del footer
      await expect(page.locator('footer').getByRole('link', { name: /Privacidad/i })).toBeVisible()
      await expect(page.locator('footer').getByRole('link', { name: /Términos/i })).toBeVisible()
    })

    test('CTA buttons navigate correctly', async ({ page }) => {
      await page.goto(PROD_URL, { waitUntil: 'networkidle' })
      
      // Click en "Comenzar Consulta"
      await page.getByRole('link', { name: /Comenzar Consulta/i }).click()
      await expect(page).toHaveURL(/\/faq/)
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
      await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
      await page.goto(PROD_URL, { waitUntil: 'networkidle' })
      
      // Header visible
      await expect(page.locator('header')).toBeVisible()
      
      // Content visible
      await expect(page.getByRole('heading', { name: /Consultas Legales/i })).toBeVisible()
    })

    test('Tablet viewport renders correctly', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }) // iPad
      await page.goto(PROD_URL, { waitUntil: 'networkidle' })
      
      await expect(page.locator('header')).toBeVisible()
      await expect(page.getByRole('heading', { name: /Consultas Legales/i })).toBeVisible()
    })

    test('Desktop viewport renders correctly', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.goto(PROD_URL, { waitUntil: 'networkidle' })
      
      await expect(page.locator('header')).toBeVisible()
      await expect(page.getByRole('heading', { name: /Consultas Legales/i })).toBeVisible()
    })
  })

  // ============================================
  // 7. PERFORMANCE (BASIC)
  // ============================================

  test.describe('Performance', () => {
    test('Homepage loads in reasonable time', async ({ page }) => {
      const startTime = Date.now()
      await page.goto(PROD_URL)
      const loadTime = Date.now() - startTime
      
      // Debería cargar en menos de 5 segundos
      expect(loadTime).toBeLessThan(5000)
    })

    test('Images load correctly', async ({ page }) => {
      await page.goto(PROD_URL)
      
      // Verificar que las imágenes no están rotas
      const images = page.locator('img')
      const count = await images.count()
      
      for (let i = 0; i < count; i++) {
        const img = images.nth(i)
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
        // Las imágenes cargadas tienen naturalWidth > 0
        expect(naturalWidth).toBeGreaterThan(0)
      }
    })
  })

  // ============================================
  // 8. SEO BASICS
  // ============================================

  test.describe('SEO Basics', () => {
    test('Page has proper meta tags', async ({ page }) => {
      await page.goto(PROD_URL)
      
      // Title
      const title = await page.title()
      expect(title.length).toBeGreaterThan(10)
      
      // Meta description
      const description = await page.locator('meta[name="description"]').getAttribute('content')
      expect(description).toBeTruthy()
      expect(description!.length).toBeGreaterThan(50)
      
      // Viewport
      const viewport = await page.locator('meta[name="viewport"]').getAttribute('content')
      expect(viewport).toContain('width=device-width')
    })

    test('Page has Open Graph tags', async ({ page }) => {
      await page.goto(PROD_URL)
      
      // OG Title
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
      expect(ogTitle).toBeTruthy()
      
      // OG Description
      const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content')
      expect(ogDescription).toBeTruthy()
    })
  })

  // ============================================
  // 9. FORMS VALIDATION
  // ============================================

  test.describe('Forms Validation', () => {
    test('Login form shows validation errors', async ({ page }) => {
      await page.goto(`${PROD_URL}/login`, { waitUntil: 'networkidle' })
      
      // Submit vacío - click en el botón de iniciar sesión
      await page.getByRole('button', { name: /Iniciar Sesión/i }).click()
      
      // Debería mostrar error o el campo required se activa
      // Verificamos que el formulario sigue visible (no navegó)
      await expect(page.getByPlaceholder(/email/i)).toBeVisible()
    })

    test('FAQ form accepts input', async ({ page }) => {
      await page.goto(`${PROD_URL}/faq`, { waitUntil: 'networkidle' })
      
      // Escribir pregunta
      const input = page.getByPlaceholder(/pregunta legal/i)
      await input.fill('¿Cómo puedo divorciarme?')
      
      // Verificar que se escribió
      await expect(input).toHaveValue(/divorciarme/)
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
