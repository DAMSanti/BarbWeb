# 🧪 TESTING STRATEGY - DigitalOcean Remote Execution
## Cómo hacer Tests contra Producción sin correr localmente

**Creado**: Noviembre 13, 2025  
**Propósito**: Ejecutar tests contra API en DigitalOcean sin necesidad de environment local completo

---

## 🎯 Estrategia General

### Problema:
- ❌ Backend local complejo (PostgreSQL, env vars, dependencias)
- ❌ No queremos correr tests localmente (falta DB local, etc)
- ✅ API en DigitalOcean ya está lista
- ✅ Queremos verificar tests contra la API real

### Solución:
Usar **test environment remoto** apuntando a DigitalOcean:
```
Tests en local → API en DigitalOcean → Database en DigitalOcean
```

---

## ✅ PASO 1: Preparar Test Configuration

### 1.1 Crear archivo `.env.test.do` (NO commitearlo)
```env
# Backend URL en DigitalOcean
API_URL=https://back-jqdv9.ondigitalocean.app

# Test credentials (crear usuario de test en producción)
TEST_EMAIL=test@barbweb.test
TEST_PASSWORD=TestPassword123!
TEST_USER_ID=test-user-123

# Stripe test keys (ya están en DO)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Admin user para tests
ADMIN_EMAIL=admin@barbweb.test
ADMIN_PASSWORD=AdminPassword123!

# Lawyer user para tests
LAWYER_EMAIL=lawyer@barbweb.test
LAWYER_PASSWORD=LawyerPassword123!
```

### 1.2 Actualizar `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Environment para tests remotos
    testEnvironment: 'node',
    // Timeout más largo para tests remotos
    testTimeout: 30000,
    // Setup file
    setupFiles: ['./tests/setup.ts'],
  },
})
```

### 1.3 Crear `tests/setup.ts`
```typescript
import dotenv from 'dotenv'

// Cargar .env.test.do para tests remotos
dotenv.config({ path: '.env.test.do' })

// Validar que existe API_URL
if (!process.env.API_URL) {
  throw new Error('❌ API_URL no está configurada en .env.test.do')
}

console.log(`✅ Tests configurados para: ${process.env.API_URL}`)
```

---

## ✅ PASO 2: Crear Base Test Utilities

### 2.1 Crear `tests/utils/client.ts` - HTTP client
```typescript
import axios, { AxiosInstance } from 'axios'

export class APIClient {
  private client: AxiosInstance
  private token?: string
  private refreshToken?: string

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      validateStatus: () => true, // No tirar error en 4xx/5xx
    })
  }

  // Login y guardar tokens
  async login(email: string, password: string) {
    const res = await this.client.post('/api/auth/login', {
      email,
      password,
    })

    if (res.status === 200) {
      this.token = res.data.accessToken
      this.refreshToken = res.data.refreshToken
      console.log(`✅ Logged in as ${email}`)
    } else {
      throw new Error(`❌ Login failed: ${res.status} ${res.data.message}`)
    }

    return res
  }

  // GET con auth
  async get(url: string) {
    return this.client.get(url, {
      headers: { Authorization: `Bearer ${this.token}` },
    })
  }

  // POST con auth
  async post(url: string, data: any) {
    return this.client.post(url, data, {
      headers: { Authorization: `Bearer ${this.token}` },
    })
  }

  // PATCH con auth
  async patch(url: string, data: any) {
    return this.client.patch(url, data, {
      headers: { Authorization: `Bearer ${this.token}` },
    })
  }

  // DELETE con auth
  async delete(url: string) {
    return this.client.delete(url, {
      headers: { Authorization: `Bearer ${this.token}` },
    })
  }

  // Request sin auth (para login, etc)
  async publicPost(url: string, data: any) {
    return this.client.post(url, data)
  }

  getToken() {
    return this.token
  }

  setToken(token: string) {
    this.token = token
  }
}
```

### 2.2 Crear `tests/utils/helpers.ts` - Test helpers
```typescript
import { APIClient } from './client'

export async function createTestUser(
  client: APIClient,
  email: string,
  password: string
) {
  // Registrar usuario
  const registerRes = await client.publicPost('/api/auth/register', {
    email,
    password,
    name: `Test User ${email}`,
  })

  if (registerRes.status !== 201) {
    throw new Error(
      `❌ Failed to create test user: ${registerRes.status} ${registerRes.data.message}`
    )
  }

  // Login
  await client.login(email, password)

  console.log(`✅ Test user created and logged in: ${email}`)
  return registerRes.data
}

export async function createPaymentIntent(
  client: APIClient,
  amount: number,
  currency: string = 'eur'
) {
  const res = await client.post('/api/payments/create-payment-intent', {
    amount,
    currency,
    description: 'Test consultation',
  })

  if (res.status !== 200) {
    throw new Error(
      `❌ Failed to create payment intent: ${res.status} ${res.data.message}`
    )
  }

  return res.data
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
```

---

## ✅ PASO 3: Escribir Auth Tests

### 3.1 Actualizar `tests/integration/auth.api.test.ts`
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { APIClient } from '../utils/client'

describe('Auth API - DigitalOcean', () => {
  const client = new APIClient(process.env.API_URL!)
  let testEmail: string
  let testPassword: string

  beforeAll(() => {
    testEmail = `test-${Date.now()}@barbweb.test`
    testPassword = 'TestPassword123!'
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await client.publicPost('/api/auth/register', {
        email: testEmail,
        password: testPassword,
        name: 'Test User',
      })

      expect(res.status).toBe(201)
      expect(res.data).toHaveProperty('userId')
      expect(res.data).toHaveProperty('accessToken')
      expect(res.data).toHaveProperty('refreshToken')
      console.log(`✅ User registered: ${testEmail}`)
    })

    it('should fail with duplicate email', async () => {
      const res = await client.publicPost('/api/auth/register', {
        email: testEmail,
        password: testPassword,
        name: 'Another User',
      })

      expect(res.status).toBe(409) // Conflict
      expect(res.data).toHaveProperty('message')
      console.log(`✅ Duplicate email rejected`)
    })

    it('should fail with weak password', async () => {
      const res = await client.publicPost('/api/auth/register', {
        email: `test2-${Date.now()}@barbweb.test`,
        password: '123', // Muy corta
        name: 'Test User',
      })

      expect(res.status).toBe(400)
      expect(res.data.message).toContain('password')
      console.log(`✅ Weak password rejected`)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const res = await client.publicPost('/api/auth/login', {
        email: testEmail,
        password: testPassword,
      })

      expect(res.status).toBe(200)
      expect(res.data).toHaveProperty('accessToken')
      expect(res.data).toHaveProperty('refreshToken')
      
      // Guardar tokens para siguiente test
      client.setToken(res.data.accessToken)
      console.log(`✅ Login successful`)
    })

    it('should fail with wrong password', async () => {
      const res = await client.publicPost('/api/auth/login', {
        email: testEmail,
        password: 'WrongPassword123!',
      })

      expect(res.status).toBe(401) // Unauthorized
      console.log(`✅ Wrong password rejected`)
    })

    it('should fail with non-existent email', async () => {
      const res = await client.publicPost('/api/auth/login', {
        email: 'nonexistent@barbweb.test',
        password: 'AnyPassword123!',
      })

      expect(res.status).toBe(401)
      console.log(`✅ Non-existent email rejected`)
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token', async () => {
      // Primero login
      const loginRes = await client.publicPost('/api/auth/login', {
        email: testEmail,
        password: testPassword,
      })

      const refreshToken = loginRes.data.refreshToken

      // Luego refresh
      const res = await client.publicPost('/api/auth/refresh', {
        refreshToken,
      })

      expect(res.status).toBe(200)
      expect(res.data).toHaveProperty('accessToken')
      console.log(`✅ Token refreshed`)
    })

    it('should fail with invalid refresh token', async () => {
      const res = await client.publicPost('/api/auth/refresh', {
        refreshToken: 'invalid.token.here',
      })

      expect(res.status).toBe(401)
      console.log(`✅ Invalid refresh token rejected`)
    })
  })

  describe('GET /api/auth/me', () => {
    beforeAll(async () => {
      // Login antes de este suite
      await client.login(testEmail, testPassword)
    })

    it('should get current user info', async () => {
      const res = await client.get('/api/auth/me')

      expect(res.status).toBe(200)
      expect(res.data).toHaveProperty('id')
      expect(res.data).toHaveProperty('email')
      expect(res.data.email).toBe(testEmail)
      console.log(`✅ Current user retrieved`)
    })

    it('should fail without auth token', async () => {
      const unauthorizedClient = new APIClient(process.env.API_URL!)
      const res = await unauthorizedClient.get('/api/auth/me')

      expect(res.status).toBe(401)
      console.log(`✅ Unauthenticated request rejected`)
    })
  })
})
```

---

## ✅ PASO 4: Escribir Payment Tests

### 4.1 Crear `tests/integration/payments.api.test.ts`
```typescript
import { describe, it, expect, beforeAll } from 'vitest'
import { APIClient } from '../utils/client'
import { createTestUser, createPaymentIntent } from '../utils/helpers'

describe('Payments API - DigitalOcean', () => {
  const client = new APIClient(process.env.API_URL!)
  let testEmail: string

  beforeAll(async () => {
    testEmail = `payment-test-${Date.now()}@barbweb.test`
    await createTestUser(client, testEmail, 'TestPassword123!')
  })

  describe('POST /api/payments/create-payment-intent', () => {
    it('should create payment intent', async () => {
      const res = await client.post('/api/payments/create-payment-intent', {
        amount: 2999, // €29.99
        currency: 'eur',
        description: 'Test consultation',
      })

      expect(res.status).toBe(200)
      expect(res.data).toHaveProperty('clientSecret')
      expect(res.data).toHaveProperty('paymentIntentId')
      console.log(`✅ Payment intent created: ${res.data.paymentIntentId}`)
    })

    it('should fail with invalid amount', async () => {
      const res = await client.post('/api/payments/create-payment-intent', {
        amount: -100, // Negativo
        currency: 'eur',
      })

      expect(res.status).toBe(400)
      console.log(`✅ Invalid amount rejected`)
    })

    it('should fail with missing auth', async () => {
      const unauthorizedClient = new APIClient(process.env.API_URL!)
      const res = await unauthorizedClient.post(
        '/api/payments/create-payment-intent',
        { amount: 2999, currency: 'eur' }
      )

      expect(res.status).toBe(401)
      console.log(`✅ Unauthenticated payment attempt rejected`)
    })
  })

  describe('GET /api/payments/history', () => {
    it('should get payment history', async () => {
      // Primero crear un pago
      await createPaymentIntent(client, 2999)

      // Luego obtener historial
      const res = await client.get('/api/payments/history')

      expect(res.status).toBe(200)
      expect(Array.isArray(res.data)).toBe(true)
      console.log(`✅ Payment history retrieved: ${res.data.length} payments`)
    })
  })

  describe('POST /api/payments/:id/refund', () => {
    it('should refund a payment', async () => {
      // Esto es más complejo porque necesita un payment_intent_id real
      // Por ahora solo verificar que el endpoint existe y rechaza sin ID
      const res = await client.post('/api/payments/invalid-id/refund', {})

      // Debería devolver 404 o 400
      expect([400, 404]).toContain(res.status)
      console.log(`✅ Refund endpoint exists`)
    })
  })
})
```

---

## ✅ PASO 5: Preparar para CI/CD

### 5.1 Crear script `tests/run-remote-tests.sh`
```bash
#!/bin/bash

# Script para ejecutar tests contra DigitalOcean

echo "🧪 Starting remote tests against DigitalOcean..."

# Validar que .env.test.do existe
if [ ! -f ".env.test.do" ]; then
  echo "❌ .env.test.do not found"
  echo "Please create .env.test.do with API_URL and test credentials"
  exit 1
fi

# Source the .env.test.do
export $(cat .env.test.do | xargs)

# Validar API está disponible
echo "📡 Checking if API is available at $API_URL..."
if ! curl -s -f "$API_URL/api/health" > /dev/null; then
  echo "❌ API not responding at $API_URL"
  exit 1
fi

echo "✅ API is available"

# Ejecutar tests
echo "🏃 Running tests..."
npm run test:integration -- tests/integration/auth.api.test.ts

if [ $? -eq 0 ]; then
  echo "✅ Auth tests passed!"
else
  echo "❌ Auth tests failed"
  exit 1
fi

npm run test:integration -- tests/integration/payments.api.test.ts

if [ $? -eq 0 ]; then
  echo "✅ Payments tests passed!"
else
  echo "❌ Payments tests failed"
  exit 1
fi

echo "🎉 All remote tests passed!"
```

### 5.2 Actualizar `package.json` scripts
```json
{
  "scripts": {
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:integration:do": "bash tests/run-remote-tests.sh",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest watch"
  }
}
```

---

## ✅ PASO 6: Cómo Ejecutar

### Opción A: En Local (contra DigitalOcean)
```bash
# 1. Crear .env.test.do con credenciales
cp .env.test.do.example .env.test.do
# Editar con API_URL y test credentials

# 2. Correr tests
npm run test:integration:do

# O específicamente
npm run test:integration -- tests/integration/auth.api.test.ts
```

### Opción B: En GitHub Actions (CI/CD)
```yaml
# .github/workflows/test-remote.yml
name: Remote Tests - DigitalOcean

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci --workspace backend
      
      - name: Create .env.test.do
        run: |
          cat > backend/.env.test.do << EOF
          API_URL=${{ secrets.DO_API_URL }}
          TEST_EMAIL=${{ secrets.DO_TEST_EMAIL }}
          TEST_PASSWORD=${{ secrets.DO_TEST_PASSWORD }}
          ADMIN_EMAIL=${{ secrets.DO_ADMIN_EMAIL }}
          ADMIN_PASSWORD=${{ secrets.DO_ADMIN_PASSWORD }}
          EOF
      
      - name: Run remote tests
        run: npm run test:integration:do --workspace backend
```

---

## ✅ PASO 7: Preparar Credenciales en DO

### Crear usuarios de test en DigitalOcean
```bash
# En producción (DigitalOcean), crear estos usuarios:

1. Test User:
   - Email: test@barbweb.test
   - Password: TestPassword123!
   - Role: user

2. Admin Test User:
   - Email: admin@barbweb.test
   - Password: AdminPassword123!
   - Role: admin

3. Lawyer Test User:
   - Email: lawyer@barbweb.test
   - Password: LawyerPassword123!
   - Role: lawyer
```

### O crear endpoint de test en backend
```typescript
// routes/test.ts (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  router.post('/test/setup', async (req, res) => {
    // Crear usuarios de test
    const testUser = await createUser({
      email: 'test@barbweb.test',
      password: 'TestPassword123!',
      name: 'Test User',
    })
    
    return res.json({ 
      message: 'Test users created',
      userId: testUser.id 
    })
  })
}
```

---

## 🎯 VENTAJAS DE ESTA ESTRATEGIA

✅ **Tests contra API real**: Verificas que todo funciona en DigitalOcean  
✅ **No necesitas setup local**: No necesitas PostgreSQL, env vars complejas, etc.  
✅ **CI/CD automático**: Puedes ejecutar en GitHub Actions sin secretos sensibles  
✅ **Rápido**: Tests apuntan a API ya deployada  
✅ **Realista**: Tests usan la API real, no mocks  
✅ **Seguro**: Credenciales de test en `.env.test.do` (no commiteado)

---

## ⚠️ CONSIDERACIONES

- Tests contra producción pueden afectar datos reales
- Usar credenciales de **TEST** separadas, no admin
- Tests deben limpiar datos que crean
- Ejecutar con cuidado si hay users reales en producción
- Considerar server de staging para tests más agresivos

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

- [ ] Crear `.env.test.do.example` con estructura
- [ ] Crear `tests/utils/client.ts` - HTTP client
- [ ] Crear `tests/utils/helpers.ts` - Test helpers
- [ ] Reescribir `tests/integration/auth.api.test.ts` con tests reales
- [ ] Crear `tests/integration/payments.api.test.ts`
- [ ] Crear `tests/integration/admin.api.test.ts`
- [ ] Crear `tests/run-remote-tests.sh` script
- [ ] Actualizar `package.json` scripts
- [ ] Setup GitHub Actions workflow
- [ ] Crear usuarios de test en DigitalOcean
- [ ] Ejecutar `npm run test:integration:do` y verificar

---

**Próximo paso**: Implementar estos archivos y ejecutar primeros tests  
**Tiempo estimado**: 2-4 horas de setup, luego tests automáticos
