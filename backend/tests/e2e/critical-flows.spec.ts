/**
 * E2E Tests - Critical Flows using Playwright
 * NOTA: Estos tests corren en el navegador, no en vitest
 * Ejecutar con: npx playwright test
 * NO ejecutar con: npm run test (eso es vitest)
 */

import { test, expect } from '@playwright/test'

// Configuración
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5173'

// Datos de prueba
const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  name: 'Test User',
}

/**
 * NOTA IMPORTANTE:
 * Los tests E2E con Playwright deben ejecutarse SOLO después de que:
 * 1. El backend esté corriendo: npm run dev (en terminal separada)
 * 2. El frontend esté corriendo: npm run dev (en terminal separada)
 * 3. La base de datos esté disponible
 * 
 * Para ejecutar:
 * npx playwright test --project=chromium
 * 
 * Para UI mode:
 * npx playwright test --ui
 */

test.describe.skip('E2E: Critical Flows (REQUIRES RUNNING SERVERS)', () => {
  test('should complete user registration', async ({ page }) => {
    // Navegar a página de registro
    await page.goto(`${BASE_URL}/register`)

    // Verificar que formulario existe
    await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: 5000 })

    // Llenar formulario
    await page.fill('input[name="name"]', TEST_USER.name)
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    await page.fill('input[name="confirmPassword"]', TEST_USER.password)

    // Submit
    const submitButton = page.locator('button:has-text("Registrarse")')
    if (await submitButton.isVisible()) {
      await submitButton.click()
      await page.waitForURL(`${BASE_URL}/`, { timeout: 10000 })
    }
  })
})

/**
 * E2E TEST 2: User Login Flow
 */
test.describe('E2E: User Login Flow', () => {
  test('should login with valid credentials', async ({ page }) => {
    // 1. Navegar a login
    await page.goto(`${BASE_URL}/login`)

    // 2. Llenar credenciales
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)

    // 3. Submit
    await page.click('button:has-text("Iniciar Sesión")')

    // 4. Verificar redirect a home
    await page.waitForURL(`${BASE_URL}/`)

    // 5. Verificar que está logged in
    await expect(page.locator('button:has-text("Perfil")')).toBeVisible()
  })

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)

    await page.fill('input[name="email"]', 'wrong@example.com')
    await page.fill('input[name="password"]', 'WrongPassword123')

    await page.click('button:has-text("Iniciar Sesión")')

    // Verificar error
    await expect(page.locator('text=Email o contraseña incorrectos')).toBeVisible()
  })
})

/**
 * E2E TEST 3: Ask Question (FAQ Flow)
 */
test.describe('E2E: Ask Question Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada test
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    await page.click('button:has-text("Iniciar Sesión")')
    await page.waitForURL(`${BASE_URL}/`)
  })

  test('should ask question and get auto-response', async ({ page }) => {
    // 1. Navegar a FAQ page
    await page.goto(`${BASE_URL}/faq`)

    // 2. Escribir pregunta
    const questionText = 'What are my rights in a civil dispute?'
    await page.fill('textarea[placeholder*="Escribe tu pregunta"]', questionText)

    // 3. Submit pregunta
    await page.click('button:has-text("Hacer Pregunta")')

    // 4. Esperar respuesta
    await page.waitForSelector('text=Análisis:', { timeout: 5000 })

    // 5. Verificar que muestra respuesta
    await expect(page.locator('text=Respuesta Automática')).toBeVisible()
    await expect(page.locator('text=Análisis:')).toBeVisible()

    // 6. Verificar botones de siguiente paso
    await expect(page.locator('button:has-text("Solicitar Consulta")')).toBeVisible()
    await expect(page.locator('button:has-text("Hacer Otra Pregunta")')).toBeVisible()
  })

  test('should reject question shorter than 10 chars', async ({ page }) => {
    await page.goto(`${BASE_URL}/faq`)

    await page.fill('textarea[placeholder*="Escribe tu pregunta"]', 'Short')

    // Verificar que muestra error
    await expect(page.locator('text=Pregunta muy corta')).toBeVisible()
  })
})

/**
 * E2E TEST 4: Payment Flow (CRITICAL)
 */
test.describe('E2E: Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    await page.click('button:has-text("Iniciar Sesión")')
    await page.waitForURL(`${BASE_URL}/`)
  })

  test('should load checkout page with payment element', async ({ page }) => {
    // 1. Navegar a checkout
    await page.goto(`${BASE_URL}/checkout`)

    // 2. Esperar que PaymentElement cargue
    await page.waitForSelector('iframe[title="Securely enter your card information"]', {
      timeout: 10000,
    })

    // 3. Verificar que element está visible
    await expect(page.locator('iframe')).toBeVisible()

    // 4. Verificar botón de pago
    await expect(page.locator('button:has-text("Pagar")')).toBeVisible()
  })

  test('should complete payment with test card', async ({ page }) => {
    await page.goto(`${BASE_URL}/checkout`)

    // Esperar Stripe Element
    await page.waitForSelector('iframe[title*="card"]', { timeout: 10000 })

    // Rellenar datos
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="name"]', TEST_USER.name)
    // ... más campos si es necesario

    // Rellenar tarjeta de test dentro del iframe
    const frameLocator = page.locator('iframe[title*="card"]')
    const frame = frameLocator.frameLocator('::-p-internal-frame')

    // Ingresar tarjeta test: 4242 4242 4242 4242
    await frame.locator('input[placeholder*="Card number"]').fill('4242424242424242')
    await frame.locator('input[placeholder*="MM"]').fill('12')
    await frame.locator('input[placeholder*="YY"]').fill('25')
    await frame.locator('input[placeholder*="CVC"]').fill('123')

    // Click en pagar
    await page.click('button:has-text("Pagar")')

    // Verificar éxito
    await page.waitForURL(`${BASE_URL}/checkout/success`, { timeout: 10000 })
    await expect(page).toHaveURL(/.*success/)

    // Verificar mensaje de éxito
    await expect(page.locator('text=¡Pago Completado!')).toBeVisible()
  })
})

/**
 * E2E TEST 5: Session Management
 */
test.describe('E2E: Session Management', () => {
  test('should maintain session after page reload', async ({ page }) => {
    // 1. Login
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    await page.click('button:has-text("Iniciar Sesión")')
    await page.waitForURL(`${BASE_URL}/`)

    // 2. Verificar que está logged in
    await expect(page.locator('button:has-text("Perfil")')).toBeVisible()

    // 3. Reload página
    await page.reload()

    // 4. Verificar que SIGUE logged in (tokens en localStorage)
    await expect(page.locator('button:has-text("Perfil")')).toBeVisible()
  })

  test('should logout successfully', async ({ page }) => {
    // Login primero
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    await page.click('button:has-text("Iniciar Sesión")')
    await page.waitForURL(`${BASE_URL}/`)

    // Click en perfil / logout
    await page.click('button:has-text("Perfil")')
    await page.click('button:has-text("Cerrar Sesión")')

    // Verificar redirect a login
    await page.waitForURL(`${BASE_URL}/login`)
    await expect(page).toHaveURL(/.*login/)

    // Verificar que botones de login/register aparecen
    await expect(page.locator('button:has-text("Iniciar Sesión")')).toBeVisible()
  })
})

/**
 * E2E TEST 6: Error Handling
 */
test.describe('E2E: Error Handling', () => {
  test('should show error when backend is unreachable', async ({ page }) => {
    // Simular backend no disponible
    // (En un test real, podrías mockear responses)

    await page.goto(`${BASE_URL}/login`)

    // Try to login sin backend
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'TestPassword123')

    // Mock para simular error de conexión
    await page.route(`${API_URL}/auth/login`, route => {
      route.abort('failed')
    })

    await page.click('button:has-text("Iniciar Sesión")')

    // Verificar que muestra error
    await expect(page.locator('text=Error de conexión')).toBeVisible()
  })

  test('should handle network timeout gracefully', async ({ page }) => {
    await page.goto(`${BASE_URL}/faq`)

    // Mock para simular timeout
    await page.route(`${API_URL}/api/filter-question`, route => {
      route.abort('timedout')
    })

    await page.fill('textarea', 'What are my legal rights?')
    await page.click('button:has-text("Hacer Pregunta")')

    // Después de reintentos, muestra error
    await expect(page.locator('text=Error al conectar')).toBeVisible()
  })
})
