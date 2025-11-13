# 🧪 TESTING ANALYSIS - Local vs Remote Execution
## Qué se puede hacer en local y qué requiere DigitalOcean

**Analizado**: Noviembre 13, 2025

---

## 📊 ANÁLISIS POR CATEGORÍA

### ✅ TESTS QUE PODEMOS HACER EN LOCAL (SIN DEPENDENCIAS)

#### 1️⃣ Unit Tests - Validators/Schemas (FÁCIL - 0 dependencias)
**Estado**: ✅ YA EXISTE en `tests/unit/validators.test.ts` (79.41% coverage)

```
✅ Qué: Validación de Zod schemas
✅ Dónde: Archivo de unit tests
✅ Dependencias: Solo Zod + Vitest (ya instalados)
✅ Tiempo: 2-4 horas para completar
```

**Acciones locales**:
- [ ] Completar `tests/unit/validators.test.ts` con más casos edge
- [ ] Crear `tests/unit/errors.test.ts` - Test error handling
- [ ] Crear `tests/unit/logger.test.ts` - Test Winston logging
- [ ] Tests para utils: `tests/unit/faqDatabase.test.ts`

---

#### 2️⃣ Unit Tests - Services (PARCIAL - Algunos sin DB)
**Estado**: ⚠️ Parcialmente posible

```
✅ POSIBLE EN LOCAL:
  - authService.test.ts (lógica de JWT, password hashing)
  - emailService.test.ts (templates, validation - sin enviar emails)
  - openaiService.test.ts (mock de Gemini API)

❌ REQUIERE BD:
  - adminService.test.ts (necesita datos en DB)
  - Cualquier cosa con Prisma queries
```

**Para hacer en local**:
```typescript
// ✅ POSIBLE: Test password hashing
import { bcrypt } from 'bcrypt'

describe('Password Hashing', () => {
  it('should hash password correctly', async () => {
    const password = 'TestPassword123!'
    const hashed = await bcrypt.hash(password, 10)
    const isValid = await bcrypt.compare(password, hashed)
    expect(isValid).toBe(true)
  })
})

// ✅ POSIBLE: Test email templates
describe('Email Templates', () => {
  it('should generate valid payment confirmation HTML', () => {
    const html = generatePaymentConfirmationEmail({
      clientName: 'John',
      amount: '29.99',
    })
    expect(html).toContain('John')
    expect(html).toContain('€29.99')
  })
})

// ✅ POSIBLE: Test JWT tokens
describe('JWT Tokens', () => {
  it('should create and verify JWT token', () => {
    const token = jwt.sign({ userId: '123' }, 'secret')
    const decoded = jwt.verify(token, 'secret')
    expect(decoded.userId).toBe('123')
  })
})
```

---

#### 3️⃣ Unit Tests - Middleware (PARCIAL - Sin Auth Context)
**Estado**: ⚠️ Parcialmente posible

```
✅ POSIBLE EN LOCAL:
  - Rate limiting middleware (mock de express)
  - Security headers (Helmet) - solo verificar que se aplican
  - Input validation (Zod) - ya testeado

❌ REQUIERE API RUNNING:
  - Authorization middleware (need JWT tokens + context)
  - Auth middleware (need real tokens)
```

**Para hacer en local**:
```typescript
// ✅ POSIBLE: Test rate limiting setup
describe('Rate Limiting', () => {
  it('should have correct limits configured', () => {
    expect(globalLimiter.windowMs).toBe(15 * 60 * 1000) // 15 min
    expect(globalLimiter.max).toBe(100)
  })
})

// ✅ POSIBLE: Test Helmet configuration
describe('Security Headers', () => {
  it('should have Helmet configured with CSP', () => {
    const helmetConfig = helmetMiddleware.options
    expect(helmetConfig.contentSecurityPolicy).toBeDefined()
  })
})
```

---

### ❌ TESTS QUE REQUIEREN API RUNNING (DigitalOcean o Local Backend)

#### 4️⃣ Integration Tests - Auth API Routes
**Estado**: ❌ REQUIERE API CORRIENDO

```
❌ Problema:
  - Necesita backend Express running
  - Necesita PostgreSQL para almacenar usuarios
  - Necesita OAuth credentials (Google, Microsoft)
  - Necesita JWT secrets en env

✅ Solución: Usar API en DigitalOcean o Docker
```

**Para hacer en local PERO con Docker**:
```bash
# Opción 1: Levantar backend local con Docker
docker-compose up -d postgres redis backend

# Opción 2: Tests contra DigitalOcean (recomendado)
npm run test:integration:do
```

---

#### 5️⃣ Integration Tests - Payment Routes
**Estado**: ❌ REQUIERE API + Stripe

```
❌ Problema:
  - Necesita backend Express + base de datos
  - Necesita Stripe test keys configurados
  - Necesita PaymentIntent en Stripe
  - Webhook handling requiere comunicación

✅ Solución: Docker o DigitalOcean
```

---

#### 6️⃣ Integration Tests - Admin Routes
**Estado**: ❌ REQUIERE API + BD + RBAC

```
❌ Problema:
  - Necesita backend corriendo
  - Necesita datos de admin en BD
  - Necesita usuarios con roles en BD
  - Necesita JWT tokens de admin

✅ Solución: Docker o DigitalOcean
```

---

#### 7️⃣ Middleware Authorization Tests
**Estado**: ❌ REQUIERE Context Real

```
❌ Problema:
  - Requiere JWT tokens válidos
  - Requiere contexto de request real
  - Requiere usuarios en BD con roles

✅ Solución: Docker o DigitalOcean
```

---

## 🎯 PLAN DE EJECUCIÓN INMEDIATO (LO QUE PODEMOS HACER HOY)

### Fase 1: Unit Tests (3-4 horas) - EN LOCAL SIN DEPENDENCIAS
```
✅ CAN DO NOW:
1. Completar tests/unit/validators.test.ts (schemas Zod)
2. Crear tests/unit/errors.test.ts (error handling)
3. Crear tests/unit/logger.test.ts (Winston logging)
4. Crear tests/unit/faqDatabase.test.ts (FAQ utils)
5. Crear tests/unit/auth.utils.test.ts (JWT, hashing)
6. Crear tests/unit/email.utils.test.ts (templates)

Resultado: +15-20% coverage (de 8.99% → 15-20%)
Tiempo: 3-4 horas
```

### Fase 2: Unit Tests Services (2-3 horas) - EN LOCAL CON MOCKS
```
✅ CAN DO NOW (CON MOCKS):
1. tests/unit/authService.test.ts (mocking JWT, bcrypt)
2. tests/unit/emailService.test.ts (mocking Resend)
3. tests/unit/openaiService.test.ts (mocking Gemini API)

Resultado: +10-15% coverage (de 20% → 25-30%)
Tiempo: 2-3 horas
```

### Fase 3: Integration Tests (REQUIERE BACKEND)
```
❌ NO PUEDES HACER SIN BACKEND RUNNING:
1. Integration auth tests (requiere BD + Express)
2. Integration payment tests (requiere Stripe setup)
3. Integration admin tests (requiere BD)
4. Middleware tests con contexto real

Opciones:
  A) Levantar backend local con Docker (20-30 min setup)
  B) Usar API DigitalOcean (recomendado)
```

---

## 📋 TAREAS QUE PUEDES HACER AHORA (Empezar hoy)

### Task 1: Completar Unit Tests de Validators (1-2 horas)
**Archivo**: `backend/tests/unit/validators.test.ts`
**Qué agregar**:
- [ ] Tests para auth.schemas (login, register, refresh)
- [ ] Tests para payment.schemas (amount validation, currency)
- [ ] Tests para admin.schemas (role validation, pagination)
- [ ] Tests edge cases (empty strings, SQL injection attempts, etc.)

### Task 2: Crear Error Handling Tests (1 hora)
**Archivo**: `backend/tests/unit/errors.test.ts`
**Qué hacer**:
- [ ] Test custom error classes
- [ ] Test error formatting
- [ ] Test error logging

### Task 3: Crear Logger Tests (30 min)
**Archivo**: `backend/tests/unit/logger.test.ts`
**Qué hacer**:
- [ ] Test Winston logger initialization
- [ ] Test log levels (info, error, warn)
- [ ] Test log formatting

### Task 4: Crear Auth Utils Tests (2 horas)
**Archivo**: `backend/tests/unit/auth.utils.test.ts`
**Qué hacer**:
- [ ] Test password hashing con bcrypt
- [ ] Test JWT token creation
- [ ] Test JWT token verification
- [ ] Test token expiration
- [ ] Test refresh token rotation

### Task 5: Crear Email Utils Tests (1 hora)
**Archivo**: `backend/tests/unit/email.utils.test.ts`
**Qué hacer**:
- [ ] Test email template generation
- [ ] Test HTML validation
- [ ] Test email validation
- [ ] Test template variables substitution

### Task 6: Crear FAQ Database Tests (1 hora)
**Archivo**: `backend/tests/unit/faqDatabase.test.ts`
**Qué hacer**:
- [ ] Test FAQ filtering
- [ ] Test FAQ matching
- [ ] Test category detection

---

## 🚀 CÓMO EMPEZAR HOY

### Step 1: Instalar Dependencias
```bash
cd backend
npm install -D supertest @types/supertest vitest @vitest/ui
```

### Step 2: Crear estructura de test
```bash
# Ya existe pero verificar
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p tests/e2e
```

### Step 3: Crear `tests/setup.ts`
```typescript
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config({ path: '.env.test' })

// Validaciones básicas
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test'
}

console.log(`✅ Tests running in ${process.env.NODE_ENV} environment`)
```

### Step 4: Crear `.env.test` (NO commitearlo)
```bash
NODE_ENV=test
JWT_SECRET=test-secret-key-do-not-use
JWT_REFRESH_SECRET=test-refresh-secret-key-do-not-use
```

### Step 5: Actualizar `package.json`
```json
{
  "scripts": {
    "test:unit": "vitest run tests/unit",
    "test:unit:watch": "vitest watch tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

### Step 6: Empezar a escribir tests
```bash
npm run test:unit:watch
```

---

## 📊 RESUMEN DE COBERTURA ESPERADA

### Después de Fase 1 (Unit Tests - Validators)
```
Validators.test.ts: 79.41% → 95%+ (mejorar)
Auth utils: 0% → 70%+
Email utils: 0% → 60%+
Logger: 0% → 80%+
Errors: 0% → 70%+
FAQDatabase: 0% → 60%+

TOTAL: 8.99% → 25-30% ✅
Tiempo: 3-4 horas
```

### Después de Fase 2 (Service Tests con Mocks)
```
AuthService: 29.62% → 70%+
EmailService: 0% → 60%+
OpenAIService: 0% → 50%+

TOTAL: 30% → 45-50% ✅
Tiempo: +2-3 horas (Total: 5-7 horas)
```

### Después de Fase 3 (Integration Tests)
```
Routes (auth, payments, admin): 0% → 60%+
Middleware: 0% → 50%+
All Services: 50% → 85%+

TOTAL: 50% → 75-80%+ ✅
Tiempo: +8-10 horas (Total: 13-17 horas)
```

---

## ✅ RECOMENDACIÓN FINAL

### Opción A: Rápida (5-7 horas)
1. **Hoy**: Unit tests locales (Fase 1 + 2)
   - Coverage: 8.99% → 50%
   - Todo en local, sin dependencias
   - Puedes hacer mientras esperas feedback

2. **Mañana**: Setup Backend + Integration tests
   - Con Docker o DigitalOcean
   - Coverage: 50% → 75-80%

### Opción B: Super Rápida (3-4 horas)
1. **Hoy**: Solo unit tests más críticos (Fase 1)
   - Coverage: 8.99% → 25-30%
   - Valida que estructura está bien

2. **Mañana**: Todo lo demás con backend

---

## 🎯 MI RECOMENDACIÓN

**Comienza HOY con Fase 1**:
1. Completa `validators.test.ts` (mejora de 79% a 95%)
2. Crea `errors.test.ts`, `logger.test.ts`, `auth.utils.test.ts`
3. Crea `email.utils.test.ts`, `faqDatabase.test.ts`

**Resultado**: 25-30% coverage en 3-4 horas, TODO en local

**Mañana**:
- Levanta backend con Docker (o usa DigitalOcean)
- Agrega integration tests
- Llega a 70%+ coverage

---

**¿Quieres que empecemos con la Fase 1 ahora?**
