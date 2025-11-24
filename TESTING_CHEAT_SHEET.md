# 🧪 Testing Cheat Sheet

## Quick Start en DO

```bash
# 1. Setup (primera vez)
cd ~/barbweb/backend
bash scripts/setup-testing.sh

# 2. Ejecutar tests
npm run test                # Unit + Integration
npm run test:coverage       # Con reporte
npm run test:watch         # Modo desarrollo
npm run test:e2e           # E2E tests
```

## Script Helper

```bash
bash scripts/run-tests.sh [opción]

Opciones:
  all           → todos los tests
  unit          → tests unitarios
  integration   → tests de integración
  coverage      → con reporte de cobertura
  watch         → modo watch
  e2e           → E2E tests
  e2e:report    → mostrar reporte E2E
```

## Estructura Tests

```
tests/
├── unit/           ← Servicios, utils
├── integration/    ← APIs
└── e2e/           ← Flujos completos (Playwright)
```

## Archivos Config

| Archivo | Propósito |
|---------|-----------|
| `vitest.config.ts` | Tests unit + integration |
| `playwright.config.ts` | E2E tests |
| `tests/setup.ts` | Vars de entorno globales |

## NPM Scripts

```bash
npm run test               # Ejecutar tests 1x
npm run test:watch        # Modo watch
npm run test:coverage     # Con coverage report
npm run test:e2e          # Playwright
```

## Escribir Test

### Unit Test
```typescript
import { describe, it, expect } from 'vitest'

describe('myFunc', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2)
  })
})
```

### E2E Test
```typescript
import { test, expect } from '@playwright/test'

test('user flow', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Home')
})
```

## Coverage Goals

```
Lines:       70%  ✓
Functions:   70%  ✓
Branches:    60%  ✓
Statements:  70%  ✓
```

## CI Environment

La config automáticamente detecta CI:
- `CI=true` → single thread, chromiom solo
- `CI=undefined` → multi-thread, todos browsers

## Troubleshooting

| Error | Solución |
|-------|----------|
| "Cannot find @prisma/client" | `npm run db:generate` |
| "Connection refused (DB)" | `sudo systemctl start postgresql` |
| "Playwright not installed" | `npx playwright install` |
| "Port in use" | `lsof -i :3000; kill -9 PID` |

## Ver Reportes

```bash
# Coverage (local)
npm run test:coverage
# → coverage/index.html

# E2E (local)
npx playwright show-report
# → playwright-report/index.html

# Descargar de server
scp user@server:~/barbweb/backend/coverage/* ./coverage/
scp -r user@server:~/barbweb/backend/playwright-report ./
```

## Workflow Desarrollo

```
1. Cambiar código en src/
2. npm run test:watch        # Ver tests en vivo
3. Escribir test en tests/
4. ✅ Test pasa
5. npm run test:coverage     # Verificar cobertura
6. Commit cuando esté verde
```

## Performance

- Unit tests: ~5-10s
- Integration: ~20-30s
- E2E: ~1-2min

En CI es más lento por single-thread.

## Documentación Completa

- **TESTING_SETUP.md** - Setup paso a paso
- **tests/README.md** - Referencia técnica
- **scripts/setup-testing.sh** - Setup automático
- **scripts/run-tests.sh** - Test helper

---

**TL;DR:** 
```bash
bash scripts/setup-testing.sh  # Una sola vez
npm run test                   # Ejecutar tests
```
