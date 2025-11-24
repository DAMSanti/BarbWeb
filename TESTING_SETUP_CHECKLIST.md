# ✅ Entorno de Testing - Setup Completado

Fecha: Nov 24, 2025

## 📋 Resumen

Se ha preparado un entorno completo de testing para el backend con 3 niveles:
1. **Unit Tests** - Vitest (código aislado)
2. **Integration Tests** - Vitest + API (APIs completas)  
3. **E2E Tests** - Playwright (flujos end-to-end)

## 📁 Archivos Creados/Modificados

### Documentación
- ✅ **`TESTING_SETUP.md`** - Guía completa de testing
- ✅ **`backend/tests/README.md`** - Referencia técnica de tests

### Scripts de Setup
- ✅ **`backend/scripts/setup-testing.sh`** - Setup automático en DO
- ✅ **`backend/scripts/setup-testing.ps1`** - Referencia local (Windows)
- ✅ **`backend/scripts/run-tests.sh`** - Helper para ejecutar tests

### Configuraciones Optimizadas
- ✅ **`backend/vitest.config.ts`** - Optimizado para CI/CD
- ✅ **`backend/playwright.config.ts`** - Optimizado para CI/CD

## 🚀 Pasos para DigitalOcean

### 1️⃣ Setup Inicial (una sola vez)

```bash
cd ~/barbweb/backend
bash scripts/setup-testing.sh
```

**Qué hace:**
- Verifica Node.js 20.x
- Instala dependencias
- Configura PostgreSQL
- Crea BD de tests (barbweb_test)
- Instala Playwright browsers
- Instala Chromium

### 2️⃣ Ejecutar Tests

```bash
# Todos los tests (unit + integration)
npm run test

# Con reporte de cobertura
npm run test:coverage

# E2E tests
npm run test:e2e

# O usar el script helper
bash scripts/run-tests.sh all        # all, unit, integration, coverage, watch, e2e
```

### 3️⃣ Ver Resultados

```bash
# Coverage (genera HTML)
npm run test:coverage
# Descargar: scp user@server:~/barbweb/backend/coverage/* ./coverage/

# E2E Report (genera HTML)
npx playwright show-report
# Descargar: scp -r user@server:~/barbweb/backend/playwright-report ./
```

## 📊 Cobertura Objetivo

```
Lines:       70%
Functions:   70%
Branches:    60%
Statements:  70%
```

## 🗂️ Estructura de Tests Existentes

```
tests/
├── setup.ts                          # Configuración global
├── README.md                         # Documentación técnica
├── unit/ (6 tests)
│   ├── authService.test.ts
│   ├── business.test.ts
│   ├── middleware.validation.test.ts
│   ├── utilities.test.ts
│   ├── validation.test.ts
│   └── validators.test.ts
├── integration/ (3 tests)
│   ├── admin.api.test.ts
│   ├── auth.api.test.ts
│   └── routes/auth.test.ts
└── e2e/ (1 test)
    └── critical-flows.spec.ts
```

## 📚 NPM Scripts

```bash
npm run test               # Ejecutar tests
npm run test:watch        # Modo watch
npm run test:coverage     # Cobertura
npm run test:e2e          # E2E tests
```

## 🔧 Variables de Entorno (para tests)

En `tests/setup.ts`:
```
JWT_SECRET=test-jwt-secret-32-characters-long
DATABASE_URL=postgresql://testuser:testpass@localhost:5432/barbweb_test
NODE_ENV=test
GEMINI_API_KEY=test-gemini-key
STRIPE_SECRET_KEY=sk_test_test
... (más en setup.ts)
```

## ✨ Características

### Vitest Config
- ✅ Environment: Node.js
- ✅ Setup global: tests/setup.ts
- ✅ Coverage con v8
- ✅ Single-thread en CI
- ✅ Timeout: 10s

### Playwright Config
- ✅ Chromium (+ Firefox/Safari en local)
- ✅ Reports: HTML + JSON + GitHub (en CI)
- ✅ Screenshots/videos en fallos
- ✅ Retries en CI

## 🎯 Próximas Tareas

1. **Ejecutar setup en DO:**
   ```bash
   bash scripts/setup-testing.sh
   ```

2. **Ejecutar tests iniciales:**
   ```bash
   npm run test
   npm run test:coverage
   ```

3. **Revisar cobertura:**
   - ¿Está > 70% en la mayoría?
   - ¿Qué archivos necesitan más tests?

4. **Agregar GitHub Actions** (después):
   - CI/CD automático
   - Tests en cada push
   - Coverage reports

5. **Aumentar cobertura:**
   - Escribir más tests
   - Especialmente para: pagos, admin, APIs críticas

## 📞 Comandos Rápidos para DO

```bash
# Setup
bash backend/scripts/setup-testing.sh

# Tests
npm run test -w backend
npm run test:coverage -w backend
npm run test:e2e -w backend

# Desde backend
cd backend
npm run test
npm run test:coverage
npm run test:e2e
```

## ⚠️ Notas Importantes

1. **PostgreSQL debe estar running:** `sudo systemctl status postgresql`
2. **Contraseña de test:** cambiar en producción
3. **Playwright browsers:** ~500MB, primavez puede tomar 2-3 min
4. **CI mode:** automático con variable `CI=true`

## 📖 Documentación Completa

- **`TESTING_SETUP.md`** - Guía paso a paso
- **`backend/tests/README.md`** - Referencia técnica
- **Scripts:** `backend/scripts/setup-testing.sh`, `run-tests.sh`

---

**Status:** ✅ Entorno preparado y listo
**Siguiente:** Ejecutar `bash scripts/setup-testing.sh` en DO
