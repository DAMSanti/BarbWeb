# 📈 Testing Roadmap - Después del Setup

## 🚀 Phase 1: Setup & Initial Tests (Esta semana)

### Step 1: Setup ✅ LISTO
```bash
bash backend/scripts/setup-testing.sh
npm run test                 # Ver que funciona
npm run test:coverage        # Ver cobertura inicial
```

**Expected outcome:**
- ✅ 10 test files working
- ✅ ~180 test cases passing
- ✅ Initial coverage: ~9-15%

**Time**: 30 min (setup) + 5 min (run tests)

---

## 🎯 Phase 2: Review & Analyze (Después)

### Step 1: Examine Coverage Report

```bash
npm run test:coverage
# Genera: backend/coverage/index.html
# Descargar a tu laptop para ver en navegador
```

**Questions to ask:**
- ¿Qué archivos NO tienen tests?
- ¿Qué funciones críticas no están cubiertas?
- ¿Dónde estamos más débiles?

### Step 2: Identify Gaps

Busca en el reporte:
- Services sin tests → CRÍTICO
- Middleware sin tests → CRÍTICO
- Utils sin tests → IMPORTANTE
- Routes sin tests → MUY IMPORTANTE

### Step 3: Prioritize

**Prioridad ALTA (afecta funcionalidad core):**
1. Routes de pago
2. Servicios de autenticación
3. Servicios de email
4. Admin endpoints

**Prioridad MEDIA:**
1. Middlewares de seguridad
2. Validaciones
3. Utilidades comunes

**Prioridad BAJA:**
1. Helpers simples
2. Utils de logging

---

## 📝 Phase 3: Write Additional Tests

### Unit Tests (Easy - Pure Functions)

```typescript
// Example: tests/unit/stringUtils.test.ts
import { describe, it, expect } from 'vitest'
import { capitalize, slugify } from '../../src/utils/string'

describe('String Utils', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello')
  })
  
  it('should handle empty strings', () => {
    expect(capitalize('')).toBe('')
  })
})
```

**Write for:** Utils, helpers, pure functions  
**Difficulty**: ⭐ Easy  
**Speed**: Fast (~5-10 min per file)

### Integration Tests (Medium - Mock Services)

```typescript
// Example: tests/integration/emailService.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { sendEmail } from '../../src/services/emailService'

describe('Email Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('should send email successfully', async () => {
    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Test</p>'
    })
    
    expect(result).toBeDefined()
    expect(result.success).toBe(true)
  })
})
```

**Write for:** Services, middleware logic  
**Difficulty**: ⭐⭐ Medium  
**Speed**: Medium (~20-30 min per file)

### API Route Tests (Hard - Full API)

```typescript
// Example: tests/integration/paymentRoutes.test.ts
import { describe, it, expect } from 'vitest'
import { testRequest } from '../test-utils'

describe('Payment Routes', () => {
  it('POST /api/payments/create-intent should work', async () => {
    const response = await testRequest('POST', '/api/payments/create-intent', {
      consultationId: '123',
      amount: 5000
    })
    
    expect(response.status).toBe(200)
    expect(response.body.clientSecret).toBeDefined()
  })
})
```

**Write for:** API endpoints, full workflows  
**Difficulty**: ⭐⭐⭐ Hard  
**Speed**: Slow (~45-60 min per file)

---

## 📊 Coverage Growth Plan

### Week 1
```
Current:  9%
Target:  20%
Effort:   Easy unit tests
Time:     8-10 hours
```

### Week 2
```
Current: 20%
Target:  40%
Effort:   Medium integration tests
Time:     12-15 hours
```

### Week 3
```
Current: 40%
Target:  70%+
Effort:   Hard API route tests
Time:     20-25 hours
```

---

## 🧪 Test Checklist Template

When writing tests, follow this checklist:

```markdown
## Test File: [name]

- [ ] File created in correct location
- [ ] Imports: vitest, functions being tested
- [ ] describe() blocks organized by function
- [ ] Happy path tests
- [ ] Edge case tests
- [ ] Error/exception tests
- [ ] Mock external dependencies
- [ ] Clear test descriptions
- [ ] Run locally: npm run test [file]
- [ ] Check coverage: npm run test:coverage
- [ ] All tests passing (green ✓)
```

---

## 🎯 Key Files to Test (Priority Order)

### CRITICAL (Must test for launch)
```
backend/src/routes/
├── auth.ts           → Login/Register/OAuth
├── payments.ts       → Payment processing
└── admin.ts          → User management

backend/src/services/
├── authService.ts    → JWT, password hashing
├── emailService.ts   → Email sending
└── adminService.ts   → User operations
```

### IMPORTANT (High priority)
```
backend/src/middleware/
├── auth.ts           → JWT verification
├── authorization.ts  → RBAC checks
└── validation.ts     → Zod schema validation

backend/src/schemas/
└── *.schemas.ts      → Data validation
```

### NICE TO HAVE (Coverage boosters)
```
backend/src/utils/
└── *.ts              → Helper functions

backend/src/db/
└── init.ts           → Database initialization
```

---

## 💡 Tips for Writing Tests

### 1. **Test Behavior, Not Implementation**
```typescript
// ❌ BAD - Tests implementation details
expect(user.password).toBe(hashedPassword)

// ✅ GOOD - Tests behavior
expect(await verifyPassword(password, user.password)).toBe(true)
```

### 2. **Use Descriptive Names**
```typescript
// ❌ BAD
it('works', () => { ... })

// ✅ GOOD
it('should return 401 when email is not verified', () => { ... })
```

### 3. **Arrange, Act, Assert**
```typescript
it('should create user successfully', () => {
  // ARRANGE
  const userData = { email: 'test@test.com', password: 'secure' }
  
  // ACT
  const result = await createUser(userData)
  
  // ASSERT
  expect(result.id).toBeDefined()
  expect(result.email).toBe(userData.email)
})
```

### 4. **Mock External Dependencies**
```typescript
// Mock Stripe API
vi.mock('stripe', () => ({
  default: vi.fn().mockReturnValue({
    paymentIntents: {
      create: vi.fn().mockResolvedValue({ id: 'pi_123' })
    }
  })
}))
```

---

## 🔄 GitHub Actions (Optional Future)

Once coverage is good, setup CI/CD:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test
      - run: npm run test:coverage
```

---

## 📈 Success Metrics

### Week 1 Goals
- ✅ Setup complete and working
- ✅ All existing tests passing
- ✅ 10+ new unit tests added
- ✅ Coverage: 15%+

### Week 2 Goals
- ✅ 20+ integration tests
- ✅ Coverage: 40%+
- ✅ All payment endpoints tested

### Week 3 Goals
- ✅ 30+ API route tests
- ✅ Coverage: 70%+
- ✅ Ready for production

---

## 📚 Resources

- **Vitest Docs**: https://vitest.dev
- **Playwright Docs**: https://playwright.dev
- **Testing Best Practices**: https://github.com/goldbergyoni/javascript-testing-best-practices

---

## 🎬 Quick Start

```bash
# 1. Setup (first time)
bash backend/scripts/setup-testing.sh

# 2. Check initial state
npm run test:coverage

# 3. Start writing tests
# Edit: tests/unit/[yourtest].test.ts

# 4. Run tests continuously
npm run test:watch

# 5. Check coverage progress
npm run test:coverage
```

---

**Remember**: 
- Tests are an investment in quality
- Start with easy unit tests
- Move to complex integration tests
- Coverage grows gradually
- Every test adds value

Let's go! 🚀
