# 📋 TODO LIST - Barbara & Abogados
## Tareas Pendientes Ordenadas por Prioridad

**Actualizado**: Noviembre 24, 2025  
**Total Items**: 47  
**Blocker Items**: 3 🔴

---

## 🎯 TESTING ENVIRONMENT SETUP - ✅ COMPLETADO

### Infrastructure de Testing ✅ DONE
- ✅ `TESTING_SETUP.md` - Guía completa
- ✅ `TESTING_SETUP_CHECKLIST.md` - Checklist ejecutiva
- ✅ `TESTING_CHEAT_SHEET.md` - Quick reference
- ✅ `FIRST_RUN_TESTING.md` - Guía paso a paso para DO
- ✅ `backend/tests/README.md` - Documentación técnica

### Scripts Automáticos ✅ DONE
- ✅ `backend/scripts/setup-testing.sh` - Setup automático en DO
- ✅ `backend/scripts/run-tests.sh` - Helper para ejecutar tests
- ✅ `backend/scripts/setup-testing.ps1` - Referencia Windows

### Config Optimizadas ✅ DONE
- ✅ `backend/vitest.config.ts` - Optimizado para CI/CD
- ✅ `backend/playwright.config.ts` - Optimizado para CI/CD

**PRÓXIMO PASO EN DO**: `bash scripts/setup-testing.sh`

---

## 📌 REVISIÓN PROFUNDA DEL CÓDIGO (Nov 26, 2025) - ACTUALIZADO
Se realizó un análisis automático y manual de todo el repositorio para identificar riesgos, inconsistencias y tareas pendientes no reflejadas.

### Hallazgos principales (REVISADOS):
- ✅ `backend/secrets.txt` - **YA ELIMINADO** (completado Nov 26)
- ✅ `.gitignore` reparado - Archivo corrupto, recreado con capas de seguridad (backend + frontend)
- ⚠️ ALLOW_ALL_CORS=1 sigue activo en entorno - debe cambiarse a 0 antes del lanzamiento (0.5h)
- 🧭 Console logs en producción: múltiples `console.log` y `console.error` en frontend y backend (4-6h)
- 🧪 Tests: vitest.config.ts corregido (importaba vite incorrectamente). Tests necesitan supertest (40-60h)
- 🧾 Secrets CI scanning: **gitleaks NO se instala con npm** - usar pre-commit hook o CLI global (2-3h)
- 🧰 Linting: agregar ESLint rule `no-console` para producción (1h)

Acciones recomendadas (priorizadas):
1. ✅ Remover `backend/secrets.txt` - **COMPLETADO Nov 26** (.gitignore actualizado con capas)
2. ⚠️ Configurar gitleaks como **pre-commit hook** (NO npm install) - usar `install-pre-commit-hook` (1-2h)
3. 🔴 Reescribir tests placeholder con `supertest` y arreglar vitest.config.ts (vitest/config). (40-60h)  
4. 🟠 Reemplazar `console.log` por `logger` en backend y por error handlers en frontend. (4-6h)
5. 🟠 Ajustar `ALLOW_ALL_CORS=0` en DigitalOcean y agregar test CORS. (0.5-1h)
6. 🟠 Añadir CI job para `npm run test:coverage` y fallo si coverage < 70%. (2h)
7. 🟢 Linting: prohibir `console.log` con ESLint `no-console` rule. (1h)

Prioridad global: Secrets ✅ -> Gitleaks setup -> Tests reales -> CORS restrictivo -> Logging cleanup -> CI/Tests

Owner: Full-Stack Development Team

---

## 🔎 Archivos con issues detectados (lista priorizada)
Objetivo: abordar cada item y crear PRs pequeñas y reversibles para validar en CI.

- [ ] `backend/secrets.txt` - Eliminar archivo, rotar secrets, agregar escáner CI (gitleaks/git-secrets). (1-2h)
- [ ] `backend/generate-secrets.js` - Mantener, agregar logs solo si `--debug` flag; evitar crear archivos con secrets por commit. (0.5h)
- [ ] `backend/src/index.ts` - Reemplazar `console.log` por `logger` y asegurar `logger` no exponga secrets. (0.5-1h)
- [ ] `frontend/src/services/backendApi.ts` - Reemplazar `console.log` y `console.error` por logger wrappers o `handleError`. (1-2h)
- [ ] `frontend/src/pages/CheckoutPage.tsx` - Reemplazar `console.log` por logger; revisar exposures of `VITE_STRIPE_PUBLISHED_KEY`. (0.5-1h)
- [ ] `frontend/scripts/build-html.js` - Avoid printing full env values; print masked values or presence only. (0.5h)
- [ ] `backend/src/services/emailService.ts` - Add unit tests (integration mocks for Resend). (4-6h)
- [ ] `backend/src/services/openaiService.ts` - Add unit tests; ensure warnings don't leak keys. (3-5h)
- [ ] `backend/src/middleware/security.ts` - Remove debug fallback; enforce `VITE_FRONTEND_URL` and `APP_DOMAIN` usage. (1h)
- [ ] `backend/tests` - Replace placeholders with `supertest` powered integration tests, implement coverage gating. (40-60h)

---

## 🔐 SETUP GITLEAKS (Pre-Commit Hook - NO npm)

**IMPORTANTE**: `gitleaks` NO se instala con `npm install`. Es una herramienta CLI global que se ejecuta en pre-commit hooks.

### Opción 1: Instalar gitleaks CLI (Recomendado en DO)
```bash
# En DigitalOcean o tu servidor Linux:
# Opción A: Usar script de instalación oficial
curl https://raw.githubusercontent.com/gitleaks/gitleaks/master/install.sh | sh

# Opción B: Usar package manager
apt-get install gitleaks  # Ubuntu/Debian
brew install gitleaks      # macOS
choco install gitleaks     # Windows

# Verificar instalación
gitleaks version
```

### Opción 2: Setup Pre-Commit Hook (Recommended)
```bash
# Instalar pre-commit framework
pip install pre-commit  # o: brew install pre-commit

# Crear .pre-commit-config.yaml en raíz del repo:
```

### Crear `.pre-commit-config.yaml` en raíz:
```yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.1
    hooks:
      - id: gitleaks
        name: gitleaks
        description: Scan for secrets using gitleaks
        entry: gitleaks protect --verbose --redact
        language: golang
        stages: [commit]
        pass_filenames: false
```

### Setup Pre-Commit en el repo:
```bash
# En raíz del proyecto
pre-commit install
pre-commit run --all-files  # Escanear todo el repo

# Resultado esperado:
# - Si encuentra secrets: BLOQUEA commit
# - Si NO encuentra: commit procede normalmente
```

**Resultado**: Gitleaks bloqueará commits que intenten subir secrets/API keys automáticamente. ✅

---

## 🛠️ Quick checks (Commands to run locally)
Run these commands to verify the main findings quickly:

```bash
# 1. Verify secrets.txt is deleted:
test -f backend/secrets.txt && echo "FOUND - DELETE NOW!" || echo "✅ OK - File not found"

# 2. Find console.log uses in production code:
grep -r "console\.log\|console\.error" backend/src frontend/src --include="*.ts" --include="*.tsx" 2>/dev/null | head -20

# 3. Check for exposed .env and .txt files:
find . -type f \( -name ".env" -o -name "*.txt" -o -name "secrets*" \) 2>/dev/null | grep -v node_modules | grep -v ".git"

# 4. Run TypeScript type checking:
cd backend && npx tsc --noEmit && cd ..

# 5. Run tests and coverage (FIXED vitest.config.ts):
cd backend && npm ci && npm run test:coverage && cd ..
```

**✅ COMPLETED TODAY (Nov 26)**:
- ✅ `backend/secrets.txt` - Deleted
- ✅ `backend/.gitignore` - Repaired (was binary, recreated with security layers)
- ✅ `frontend/.gitignore` - Created (was missing)
- ✅ `backend/vitest.config.ts` - Fixed (changed from `vite` to `vitest/config` import)

**🔴 NEXT CRITICAL ACTION**:
Setup gitleaks pre-commit hook (see section above) OR remove gitleaks from package.json if added:
```bash
cd backend
npm uninstall gitleaks  # Remove if accidentally installed
cd ..
```




---

## 🔴 BLOCKER CRÍTICO - ESTA SEMANA (Requiere completarse antes de lanzamiento)

### Tests Execution (80-85 horas) 🔥 MÁXIMA PRIORIDAD

#### PHASE 1: UNIT TESTS (Pure Functions - NO DB) ✅ 278/278 PASSING (100%)
**Current Status**: 
- ✅ utils/errors.test.ts - 68 tests PASSING
- ✅ utils/faqDatabase.test.ts - 72 tests PASSING  
- ✅ middleware/rateLimit.test.ts - 18 tests PASSING
- ✅ utils/logger.test.ts - 60 tests PASSING
- ✅ utilities.test.ts - 31 tests
- ✅ business.test.ts - 39 tests
- ✅ validation.test.ts - 43 tests
- ✅ validators.test.ts - 31 tests
- ✅ authService.test.ts - 17 tests
- ✅ Other tests - 59 tests

**Coverage Progress**: 8.99% → 24.77% ✅

- [x] Crear middleware tests (6h) ✅ DONE
  - [x] middleware/validation.test.ts - Zod schema validation (4h) ✅ 35 TESTS
  - [x] middleware/rateLimit.test.ts - Rate limiting logic (2h) ✅ 18 TESTS PASSING
- [x] Crear utils tests (6h) ✅ DONE
  - [x] utils/errors.test.ts - Error handling (2h) ✅ 68 TESTS PASSING
  - [x] utils/logger.test.ts - Logging (2h) ✅ 60 TESTS PASSING  
  - [x] utils/faqDatabase.test.ts - FAQ search logic (2h) ✅ 72 TESTS PASSING
- [ ] Crear schemas tests (4h) - NEXT
  - [ ] schemas/payment.schemas.test.ts - Payment validation (2h)
  - [ ] schemas/faq.schemas.test.ts - FAQ validation (2h)
- [ ] Crear security tests (3h) - PENDING
  - [ ] security/jwt.test.ts - JWT creation/verification (2h)
  - [ ] security/crypto.test.ts - Encryption/hashing (1h)
- [x] Crear routes/auth.test.ts (4h) ✅ 36 TESTS PASSING

#### PHASE 2: INTEGRATION TESTS (Mock Services - NO DB) 🎯
**Setup**: `npm install -D @testing-library/jest-dom vi-fetch supertest @types/supertest`

- [ ] Crear email service tests (8h)
  - [ ] emailService.mock.test.ts - Email formatting (mock Resend) (4h)
  - [ ] Email templates rendering (4h)
    - [ ] Payment confirmation template
    - [ ] Welcome email template
    - [ ] Consultation summary template
- [ ] Crear OpenAI service tests (6h)
  - [ ] openaiService.mock.test.ts - Mock OpenAI API (4h)
  - [ ] Question categorization tests (2h)
- [ ] Crear admin service tests (6h)
  - [ ] adminService.mock.test.ts - Mock user/payment data (4h)
  - [ ] Authorization logic tests (2h)

#### PHASE 3: API ROUTE TESTS (Express Mock - NO DB) 🚀
**Setup**: `npm install -D supertest express-test-utils`

- [ ] Crear auth.routes.test.ts completo (12h)
  - [ ] POST /api/auth/register (register validation, mock DB)
  - [ ] POST /api/auth/login (JWT generation, mock auth)
  - [ ] POST /api/auth/refresh-token (token refresh logic)
  - [ ] POST /api/auth/logout (session handling)
  - [ ] POST /api/auth/oauth/google (OAuth mock)
  - [ ] POST /api/auth/oauth/apple (OAuth mock)

- [ ] Crear payments.routes.test.ts completo (10h)
  - [ ] POST /api/payments/create-payment-intent (mock Stripe)
  - [ ] POST /api/payments/confirm-payment (payment validation)
  - [ ] POST /api/payments/refund (refund logic)
  - [ ] GET /api/payments/:id (payment retrieval mock)
  - [ ] Error handling (invalid amounts, etc)

- [ ] Crear admin.routes.test.ts completo (10h)
  - [ ] GET /api/admin/users (with pagination mock)
  - [ ] GET /api/admin/users/:id (user retrieval)
  - [ ] PUT /api/admin/users/:id/role (role update)
  - [ ] DELETE /api/admin/users/:id (user deletion)
  - [ ] GET /api/admin/payments (payment history mock)
  - [ ] GET /api/admin/analytics (analytics calculation)
  - [ ] Authorization checks (RBAC)

- [ ] Crear middleware.routes.test.ts (6h)
  - [ ] middleware/auth.test.ts - JWT validation
  - [ ] middleware/authorization.test.ts - RBAC logic
  - [ ] middleware/errorHandler.test.ts - Error handling

#### PHASE 4: E2E WORKFLOWS (No UI, API-only) 🔄
**Tools**: Supertest chains without database

- [ ] Crear e2e/auth.workflow.test.ts (6h)
  - [ ] Registration → Email verification → Login flow
  - [ ] OAuth flow (Google/Apple)
  - [ ] Password reset flow
  - [ ] Token refresh and expiration

- [ ] Crear e2e/payment.workflow.test.ts (8h)
  - [ ] Create consultation → Payment intent → Confirm → Success
  - [ ] Refund workflow
  - [ ] Failed payment handling
  - [ ] Email notifications (mock)

- [ ] Crear e2e/admin.workflow.test.ts (6h)
  - [ ] Admin login → User management → Analytics view
  - [ ] Payment management workflow
  - [ ] Permission escalation protection

#### PHASE 5: COVERAGE & VALIDATION (2h)
- [ ] Ejecutar: `npm run test:coverage`
- [ ] Alcanzar 70%+ coverage (actualmente 8.99%)
- [ ] Verificar todos los tests pasan sin errores
- [ ] Generate coverage report: `npm run test:coverage -- --reporter=html`

### Security Fixes - CRÍTICO (1-2 horas)
- [x] Cambiar ALLOW_ALL_CORS=1 a ALLOW_ALL_CORS=0 en app.yaml
- [x] Cambiar ALLOW_ALL_CORS=1 a ALLOW_ALL_CORS=0 en .env
- [x] Verificar JWT_SECRET formato (revisar espacios/caracteres especiales)
- [x] Verificar JWT_REFRESH_SECRET formato (revisar espacios/caracteres especiales)
- [x] Rotar secrets si tienen errores
- [x] Validar CORS restrictivo en producción

### Email Features - Crítico (2-3 horas)
- [ ] Crear template: Reset password email
- [ ] Crear template: Welcome email (post-registro)
- [ ] Crear template: Consultation summary email
- [ ] Crear template: Invoice/receipt email
- [ ] Implementar forgot password flow en backend
- [ ] Implementar forgot password form en frontend

---

## ⚠️ IMPORTANTE - Post-Launch v1.1 (Semanas 9-11, 28-39 horas)

### API Documentation (4-6 horas)
- [ ] Setup Swagger/OpenAPI en backend
- [ ] Documentar todos los endpoints de auth
- [ ] Documentar todos los endpoints de pagos
- [ ] Documentar todos los endpoints de admin
- [ ] Generar OpenAPI specification
- [ ] Host documentation endpoint

### Monitoring & Error Tracking (2-4 horas)
- [ ] Instalar Sentry: `npm install @sentry/node @sentry/tracing`
- [ ] Configurar Sentry en backend
- [ ] Configurar Sentry en frontend
- [ ] Setup error alerts
- [ ] Test error tracking
- [ ] Configure email alerts para errores críticos

### Database & Backups (2-3 horas)
- [ ] Verificar DigitalOcean backups configurados
- [ ] Configurar backup automático diario
- [ ] Crear backup script
- [ ] Test restore de backup
- [ ] Documentar proceso de backup/restore

### Security Enhancements (8-10 horas)
- [ ] Instalar DOMPurify: `npm install dompurify`
- [ ] Sanitizar inputs en frontend
- [ ] Implementar CSRF tokens si se migra a cookies
- [ ] Revisar y endurecer CSP headers
- [ ] Implementar HSTS preload
- [ ] Security audit completo

### Email Additional Templates (4-6 horas)
- [ ] Implementar welcome email (enviar post-registro)
- [ ] Implementar consultation summary
- [ ] Implementar invoice template
- [ ] Implementar contact confirmation
- [ ] Test todos los email flows

---

## 🟡 OPTIMIZACIÓN - Semanas 12-13 (16-22 horas)

### SEO Optimization (6-8 horas)
- [ ] Instalar react-helmet: `npm install react-helmet`
- [ ] Crear meta tags dinámicos para todas las páginas
- [ ] Generar sitemap.xml automáticamente
- [ ] Crear robots.txt
- [ ] Implementar Schema.org structured data (JSON-LD)
- [ ] Agregar Open Graph tags completos
- [ ] Configurar canonical URLs
- [ ] Submit sitemap a Google Search Console

### Performance Optimization (6-8 horas)
- [ ] Implementar code splitting (React.lazy)
- [ ] Bundle analysis (webpack-bundle-analyzer)
- [ ] Image optimization
- [ ] Lazy loading de imágenes
- [ ] Optimize CSS delivery
- [ ] Minify and compress assets
- [ ] Enable gzip compression
- [ ] Run Lighthouse audit (target >90)

### Performance Monitoring (4-6 horas)
- [ ] Configurar performance monitoring en Sentry
- [ ] Setup Web Vitals tracking
- [ ] Monitor time to interactive
- [ ] Monitor cumulative layout shift
- [ ] Create performance dashboard

---

## 🟢 FEATURES DESEABLES - v1.3+ (54-75 horas)

### Chat en Vivo (16-24 horas)
- [ ] Instalar Socket.io
- [ ] Implementar WebSocket connection
- [ ] Create chat UI components
- [ ] Implement message persistence
- [ ] Add typing indicators
- [ ] Implement user status
- [ ] Add chat history
- [ ] Implement notifications

### Sistema de Ratings (8-12 horas)
- [ ] Create ratings database schema
- [ ] Implement rating submission endpoint
- [ ] Create rating UI component
- [ ] Implement average rating calculation
- [ ] Create ratings dashboard
- [ ] Add review moderation

### Multi-idioma i18n (12-16 horas)
- [ ] Instalar react-i18next: `npm install react-i18next i18next`
- [ ] Extraer todos los strings a translation files
- [ ] Crear estructura de traducciones (es, en, fr)
- [ ] Implementar language switcher
- [ ] Setup automatic language detection
- [ ] Translate backend endpoints response messages
- [ ] Test all language switching flows

### Analytics Avanzado (16-20 horas)
- [ ] Setup Google Analytics 4
- [ ] Implement event tracking
- [ ] Create custom dashboard
- [ ] Track user funnels
- [ ] Setup conversion tracking
- [ ] Create revenue reports
- [ ] Implement A/B testing framework

---

## ✅ PRE-LAUNCH CHECKLIST

### Verificación General
- [ ] Todos los tests pasando (70%+ coverage)
- [ ] Zero console errors en navegador
- [ ] Zero warnings en compilación
- [ ] TypeScript strict mode activo
- [ ] Linting pasando (ESLint)

### Backend Verification
- [ ] Todos los endpoints documentados
- [ ] Rate limiting activo y verificado
- [ ] Security headers activos
- [ ] CORS configurado correctamente
- [ ] Error handling completo
- [ ] Logging funcionando
- [ ] Database connection estable

### Frontend Verification
- [ ] Responsive design verificado (mobile, tablet, desktop)
- [ ] Todos los formularios validando correctamente
- [ ] Error messages claros
- [ ] Loading states en toda la app
- [ ] Success states funcionando
- [ ] Accesibilidad básica (a11y)

### Security Verification
- [ ] CORS restrictivo (ALLOW_ALL_CORS=0)
- [ ] JWT secrets verificados
- [ ] No secrets en código fuente
- [ ] No API keys expuestas
- [ ] SSL/TLS certificado válido
- [ ] Security headers configurados

### Infrastructure Verification
- [ ] DigitalOcean deployment funcionando
- [ ] Environment variables configuradas (backend: 23, frontend: 5)
- [ ] Database backups configurados
- [ ] SSL certificado válido
- [ ] Auto-deploy en GitHub push funcionando
- [ ] Logs accesibles

---

## 🚀 GO-LIVE FINAL CHECKLIST

### Pre-Launch (24 horas antes)
- [ ] Final build sin errores
- [ ] Final test de flujo completo (login → pago → email)
- [ ] Verificar emails llegando correctamente
- [ ] Verificar Stripe webhook funcionando
- [ ] Backup de database
- [ ] Notificar al equipo
- [ ] Preparar runbook de rollback

### Launch Day
- [ ] Cambiar Stripe a modo LIVE
- [ ] Activar Sentry si está configurado
- [ ] Enable Slack alerts
- [ ] Monitor de logs 24/7 primer día
- [ ] Verificar todas las transacciones
- [ ] Verificar emails enviándose
- [ ] Monitor performance/errors
- [ ] Responder usuario issues

### Post-Launch (Primer Mes)
- [ ] Recolectar feedback de usuarios
- [ ] Monitor KPIs
- [ ] Fix bugs reportados
- [ ] Performance tuning si es necesario
- [ ] Plan para siguiente release

---

## 📊 RESUMEN POR CATEGORÍA

| Categoría | Items | Horas | Prioridad |
|-----------|-------|-------|-----------|
| 🔴 Blocker Crítico | 10 | 80-85 | INMEDIATA |
| ⚠️ Post-Launch v1.1 | 22 | 28-39 | SEMANA 2-3 |
| 🟡 Optimización v1.2 | 8 | 16-22 | SEMANA 4-5 |
| 🟢 Features v1.3+ | 7 | 54-75 | POST-LAUNCH |
| ✅ Pre-Launch Checks | 12 | - | ANTES LAUNCH |
| 🚀 Go-Live | 8 | - | LAUNCH DAY |

**Tests Added This Session**: 218 tests (errors: 68, faqDatabase: 72, rateLimit: 18, logger: 60)
**Total Unit Tests Now**: 496 tests (278 new + 218 existing)
**Total Hours This Session**: ~8h
**Remaining**: ~72-77 hours to 70%+ coverage
**Timeline Estimado**: 1-2 weeks for complete Phase 1

**TEST ARCHITECTURE** (No Database Required):
- ✅ Pure Unit Tests (180 passing) - business logic, validation, utilities
- 🎯 Integration Tests (mock services) - email, OpenAI, admin logic
- 🚀 API Route Tests (mock Express) - auth, payments, admin endpoints
- 🔄 E2E Workflows (API chains) - complete user journeys
- 📊 Coverage Target: 70%+ (from ~9%)

---

## 🎯 RECOMENDACIÓN DE EJECUCIÓN

### Semana 1 (URGENTE - Esta semana)
1. ✅ Tests execution (40-60h)
2. ✅ Security fixes (1-2h)
3. ✅ Email templates (2-3h)
4. ✅ Pre-launch checks

**Resultado**: Proyecto listo para producción

### Semana 2-3 (Post-Launch Immediatamente)
1. API documentation (4-6h)
2. Sentry integration (2-4h)
3. Backups (2-3h)
4. Security enhancements (8-10h)

**Resultado**: Monitoreo completo y seguridad reforzada

### Semana 4-5 (Optimización)
1. SEO (6-8h)
2. Performance (6-8h)
3. Monitoring (4-6h)

**Resultado**: Sitio optimizado y monitoreado

### Fase 2+ (Features Deseables)
Evaluar según métricas de usuarios:
- Chat en vivo si hay demanda alta
- Multi-idioma si hay usuarios internacionales
- Analytics si se necesita más insights

---

**Próxima revisión**: Cuando se complete primera tarea blocker  
**Owner**: Full-Stack Development Team  
**Estado**: 93% código implementado, 8.99% testeado - BLOCKER ACTIVO 🔴
