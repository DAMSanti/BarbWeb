# 🧪 Tests Backend

## Estructura

```
tests/
├── setup.ts              # Configuración global (variables de entorno, mocks)
├── unit/                 # Tests unitarios (servicios, utilidades)
│   ├── authService.test.ts
│   ├── business.test.ts
│   ├── middleware.validation.test.ts
│   ├── utilities.test.ts
│   ├── validation.test.ts
│   └── validators.test.ts
├── integration/          # Tests de APIs e integración
│   ├── admin.api.test.ts
│   ├── auth.api.test.ts
│   └── routes/
│       └── auth.test.ts
└── e2e/                  # Tests end-to-end (flujos completos)
    └── critical-flows.spec.ts
```

## Framework & Tools

- **Vitest**: Unit + Integration tests (Typescript, rapid)
- **Playwright**: E2E tests (navegadores reales)
- **Coverage**: v8 provider

## Configuraciones

### Vitest (`vitest.config.ts`)
- Environment: Node.js
- Setup: `tests/setup.ts`
- Coverage: 70% lines/functions/statements, 60% branches
- Single thread en CI para estabilidad

### Playwright (`playwright.config.ts`)
- Chromium en CI (solo navegador para speed)
- Firefox + Safari en local
- Retries: 0 en local, 2 en CI
- Reports: HTML + JSON

### Setup Global (`setup.ts`)
```typescript
// Variables de entorno para tests
JWT_SECRET, DATABASE_URL, NODE_ENV, etc.
```

## Ejecutar Tests

### Rápido - Desde DO console

```bash
# Todos (unit + integration)
npm run test

# Con cobertura
npm run test:coverage

# Modo watch (desarrollo)
npm run test:watch

# E2E
npm run test:e2e

# O usar script helper
bash scripts/run-tests.sh all      # all, unit, integration, coverage, watch, e2e
```

### Setup inicial (una sola vez)

```bash
bash scripts/setup-testing.sh
```

## Cobertura

**Objetivos:**
- Lines: 70%
- Functions: 70%
- Branches: 60%
- Statements: 70%

**Ver reporte:**
```bash
npm run test:coverage
# Abre coverage/index.html
```

## Escribir Tests

### Unit Test

```typescript
// tests/unit/example.test.ts
import { describe, it, expect } from 'vitest'
import { myFunction } from '../../src/utils/example'

describe('myFunction', () => {
  it('should work correctly', () => {
    const result = myFunction('input')
    expect(result).toBe('expected')
  })
})
```

### Integration Test

```typescript
// tests/integration/api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import app from '../../src/index'

describe('Auth API', () => {
  it('POST /auth/login should authenticate', async () => {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'test123' })
    })
    expect(response.status).toBe(200)
  })
})
```

### E2E Test

```typescript
// tests/e2e/flow.spec.ts
import { test, expect } from '@playwright/test'

test('User can login', async ({ page }) => {
  await page.goto('/')
  await page.fill('input[name="email"]', 'user@test.com')
  await page.fill('input[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/dashboard')
})
```

## CI/CD Integration

Variables de entorno para CI:
```bash
CI=true                    # Activa modo CI en configs
DATABASE_URL=...           # BD de test
JWT_SECRET=...             # Secretos de test
```

En GitHub Actions:
```yaml
- name: Run Tests
  run: |
    npm run test
    npm run test:coverage
    npm run test:e2e
  env:
    CI: true
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```

## Troubleshooting

### ❌ "Cannot find module @prisma/client"
```bash
npm run db:generate
```

### ❌ "Database connection refused"
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### ❌ "Playwright browsers not installed"
```bash
npx playwright install
sudo apt-get install -y chromium-browser
```

### ❌ "Port already in use"
```bash
# Cambiar puerto en playwright.config.ts o matar proceso
lsof -i :3000
kill -9 <PID>
```

## Performance

- **Unit tests**: ~5-10 segundos
- **Integration tests**: ~20-30 segundos
- **E2E tests**: ~1-2 minutos

Optimizaciones en CI:
- Single thread mode
- Solo Chromium
- Parallelization deshabilitado

## Reportes

### Vitest Coverage
```bash
npm run test:coverage
# Genera: coverage/index.html, coverage/coverage-final.json
```

### Playwright Report
```bash
npm run test:e2e
npx playwright show-report
# Genera: playwright-report/index.html
```

## Próximas Tareas

- [ ] Aumentar coverage a 80%+
- [ ] Agregar tests de pagos (Stripe)
- [ ] E2E tests para admin panel
- [ ] Performance tests
- [ ] Load tests
- [ ] GitHub Actions CI/CD
