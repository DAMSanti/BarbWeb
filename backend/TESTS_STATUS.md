# Estado de Tests - BarbWeb Backend

## Resumen Ejecutivo
✅ **67/67 tests unitarios/integración pasados** (100%)  
⏳ **39 tests E2E listos** (sin ejecutar - requieren frontend corriendo)

---

## Tests Unitarios e Integración ✅

### 1. Auth Integration Tests (19 tests)
**Archivo:** `tests/integration/auth.api.test.ts`  
**Estado:** ✅ PASANDO  
**Duración:** ~5ms

Cubre:
- Endpoints de autenticación
- Flujos de OAuth
- Refresh token

### 2. Validators Unit Tests (31 tests)
**Archivo:** `tests/unit/validators.test.ts`  
**Estado:** ✅ PASANDO  
**Duración:** ~12ms

Valida esquemas Zod para:
- Email, Contraseña, Nombre, UUID
- Registro, Login, RefreshToken
- Pagos (monto mínimo $10, máximo $10,000)
- FAQs (preguntas, respuestas, palabras clave)

### 3. Auth Service Unit Tests (17 tests)
**Archivo:** `tests/unit/authService.test.ts`  
**Estado:** ✅ PASANDO  
**Duración:** ~568ms

Prueba:
- Hash de contraseñas (bcrypt)
- Verificación de contraseñas
- Generación de JWT (access + refresh tokens)
- Expiración de tokens (15m access, 7d refresh)
- Verificación de JWT

---

## Tests E2E con Playwright ⏳

### Estado
**Archivo:** `tests/e2e/critical-flows.spec.ts`  
**Total:** 39 tests (13 flujos × 3 browsers: Chromium, Firefox, WebKit)  
**Instalado:** ✅ Playwright + Browsers descargados

### Flujos de Prueba Disponibles
1. **User Registration** (3 tests)
   - Registro exitoso y auto-login
   - Rechazo de contraseña débil
   - Rechazo de contraseñas no coincidentes

2. **User Login** (2 tests)
   - Login con credenciales válidas
   - Rechazo de credenciales inválidas

3. **Ask Question** (2 tests)
   - Hacer pregunta y obtener respuesta automática
   - Rechazo de pregunta < 10 caracteres

4. **Payment** (2 tests)
   - Cargar página de checkout
   - Completar pago con tarjeta de prueba

5. **Session Management** (2 tests)
   - Mantener sesión después de recargar página
   - Logout exitoso

6. **Error Handling** (2 tests)
   - Error cuando backend no está disponible
   - Manejo de timeout de red

### Cómo ejecutar E2E
```bash
# Requerimientos:
# 1. Frontend corriendo en http://localhost:5173
# 2. Backend corriendo en http://localhost:3000

# Ejecutar todos
npm run test:e2e

# Solo Chromium (más rápido)
npm run test:e2e -- --project=chromium

# Con interfaz visual
npm run test:e2e -- --headed

# Ver reporte HTML
npx playwright show-report
```

---

## Scripts Disponibles

```bash
# Tests unitarios/integración
npm test              # Ejecutar una vez
npm run test:watch   # Modo watch
npm run test:coverage # Con cobertura

# Tests E2E
npm run test:e2e     # Ejecutar todos los browsers
```

---

## Configuración

### Vitest Config (`vitest.config.ts`)
- Environment: Node.js
- Globals: Habilitado (describe, it, expect sin import)
- Coverage: v8 provider, 70% mínimo para líneas/funciones/statements, 60% para branches
- Setup: `tests/setup.ts`

### Playwright Config (`playwright.config.ts`)
- Browsers: Chromium, Firefox, WebKit
- Modo: Serial (un test a la vez)
- Reporter: HTML
- Retry: 2 en CI, 0 en local
- WebServer: Inicia frontend en `http://localhost:5173`

---

## Cambios Realizados

### 1. Instalación de dependencias
```bash
npm install --save-dev vitest
npm install --save-dev @playwright/test
npx playwright install
```

### 2. Actualización de `package.json`
Agregados scripts:
- `test`: Ejecutar Vitest una vez
- `test:watch`: Vitest en modo watch
- `test:coverage`: Con reporte de cobertura
- `test:e2e`: Ejecutar Playwright

### 3. Correcciones de imports
- Rutas relativas en tests: `../src/` → `../../src/`
- Agregada función `verifyJWTWithSecret()` para refresh tokens

### 4. Correcciones de esquemas
- `CreatePaymentIntentSchema`: Agregada validación mínimo $10
- `FilterQuestionSchema`: Confirmado trim de espacios en blanco

### 5. Configuración de test runners
- Creado `vitest.config.ts` con alias y cobertura
- Creado `playwright.config.ts` con browsers múltiples

---

## Próximos Pasos

1. **Ejecutar E2E**: Iniciar frontend + backend y correr `npm run test:e2e`
2. **Agregar más tests unitarios**: Para servicios como `emailService`, `openaiService`
3. **CI/CD**: Integrar tests en GitHub Actions
4. **Coverage**: Ejecutar `npm run test:coverage` para generar reporte

---

## Notas

- Los tests E2E requieren que tanto frontend como backend estén corriendo
- Playwright descargó ~403MB en total
- Los tests unitarios son muy rápidos (~950ms total)
- Usar `.env.local` para configurar variables de test si es necesario
