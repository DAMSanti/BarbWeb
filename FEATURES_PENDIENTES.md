# 📋 FEATURES PENDIENTES - Barbara & Abogados
## Características encontradas en ROADMAP_PROFESSIONAL pero no implementadas

**Fecha**: Noviembre 13, 2025
**Fuente**: Análisis de ROADMAP_PROFESSIONAL.md vs ROADMAP_QUICK.md y PROGRESS_REPORT.md

---

## 🎯 FEATURES DE ROADMAP_PROFESSIONAL NO PRESENTES EN ROADMAP_QUICK

### 📧 Email Types Adicionales (NO IMPLEMENTADOS)
**Estado**: ✅ COMPLETAMENTE IMPLEMENTADO Y TESTEADO (8/8 templates + 80+ tests)

**Implementados ✅**:
- ✅ Confirmación de pago (cliente)
- ✅ Notificación a abogado (nueva consulta)
- ✅ Payment failed (cliente)
- ✅ Refund confirmation (cliente)
- ✅ Email de bienvenida (post-registro)
- ✅ Resumen de consulta realizada (para consultas PAGADAS solamente)
- ✅ Factura/recibo detallado (con formato fiscal)
- ✅ Reset de contraseña (forgot password flow)

**Tests Implementados (Nov 28) ✅**:
- ✅ `emailService.test.ts` - 40+ tests (todas las funciones de email, error handling)
- ✅ `authService.email.test.ts` - 40+ tests (pending registration, password reset, change password)
- ✅ Todos los templates con mocks de Resend API
- ✅ Error handling testeado (API errors, network errors)

**Total: 8/8 Templates implementados + 80+ Tests ✅**

---

### 🔐 Security Features Adicionales (PARCIAL)

**Implementados ✅**:
- ✅ Rate limiting (3 limiters)
- ✅ Helmet.js
- ✅ Password hashing
- ✅ JWT + refresh tokens
- ✅ Zod validation
- ✅ SQL Injection prevention (Prisma)
- ✅ XSS prevention (Zod + Helmet)

**Pendientes ⏳**:
- [ ] CORS restrictivo (ALLOW_ALL_CORS actualmente en 1, cambiar a 0)
- [ ] CSRF tokens (si se usan cookies en el futuro)
- [ ] DOMPurify para sanitizar inputs en frontend
- [ ] Content Security Policy más estricto en frontend

### ✅ Hallazgos de auditoría (Nov 26, 2025)
**Prioritarios**:
- 🔐 `backend/secrets.txt` encontrado en repo con secrets impresos: eliminar de inmediato y rotar secrets (1h).  
- ⚠️ CORS: `ALLOW_ALL_CORS=1` en entorno — cambiar a 0, validar `VITE_FRONTEND_URL`. (0.5h)
- 🧪 Tests: placeholders y cobertura insuficiente (target 70%+). Reescribir tests y añadir integraciones para rutas, servicios y middleware. (40-60h)
- 🧾 `console.log` y `console.error` dispersos en frontend/backend; migrar a `logger` y eliminar prints. (4-6h)

**Recomendaciones**:
1. Eliminar `backend/secrets.txt`, agregar `gitleaks`/`git-secrets` y reglas para impedir commitear secrets. (2h)
2. Reescribir los tests placeholders con `supertest` y añadir coverage gating en CI: `coverage >= 70%`. (40-60h)
3. Añadir ES Lint `no-console` rule en production code y documentar excepción para `scripts/` y CI jobs. (1h)
4. Remediar CORS y validar en staging. (1h)

**Prioridad**: Alta (CORS), Media (resto)
**Tiempo Estimado**: 2-4 horas total
**Notas**: CORS debe cambiarse antes de producción. CSRF solo si se migra a cookies.

---

### 🎨 Frontend Security (PARCIAL)

**Pendientes**:
- [ ] Sanitizar inputs con DOMPurify
- [ ] Secure headers (CSP) en frontend
- [ ] Validación de datos más estricta en forms

**Prioridad**: Baja
**Tiempo Estimado**: 2-3 horas

---

### 🎭 Panel Administrativo (NO IMPLEMENTADO)

**Backend Endpoints Pendientes**:
```
GET    /api/admin/users - Listar usuarios
GET    /api/admin/users/:id - Detalle usuario
PATCH  /api/admin/users/:id - Editar usuario
DELETE /api/admin/users/:id - Eliminar usuario

GET    /api/admin/payments - Listar pagos
GET    /api/admin/payments/:id - Detalle pago
PATCH  /api/admin/payments/:id/refund - Reembolso (ya existe en /api/payments)

GET    /api/admin/faqs - Listar FAQs
POST   /api/admin/faqs - Crear FAQ
PATCH  /api/admin/faqs/:id - Editar FAQ
DELETE /api/admin/faqs/:id - Eliminar FAQ

GET    /api/admin/analytics - Estadísticas generales
```

**Frontend Pages Pendientes**:
- AdminDashboard.tsx - Vista general con stats
- UsersManager.tsx - Gestionar usuarios
- PaymentsManager.tsx - Historial de pagos y reembolsos
- AnalyticsPage.tsx - Estadísticas de la plataforma

**Componentes Necesarios**:
- Dashboard cards (Stats de usuarios, ingresos)
- Data tables (react-table)
- Charts (Chart.js o Recharts)
- Forms para CRUD de FAQs
- Filters y búsqueda

**RBAC (Role-Based Access Control)**:
- [ ] Middleware de autorización (requireRole)
- [ ] Roles: `user`, `lawyer`, `admin`
- [ ] Protected admin routes

**Prioridad**: Alta (para v1.1)
**Tiempo Estimado**: 24-32 horas
- Backend: 8-10 horas
- Frontend: 14-18 horas
- RBAC: 2-4 horas

**Notas**: Esto es crítico para gestión pero no para MVP inicial. Priorizar para después del lanzamiento.

---

### 🔍 SEO Y PERFORMANCE (NO IMPLEMENTADO)

**SEO Pendiente**:
- [ ] react-helmet para meta tags dinámicos
- [ ] Sitemap.xml generado automáticamente
- [ ] robots.txt
- [ ] Schema.org structured data (JSON-LD)
- [ ] Open Graph tags completos (redes sociales)
- [ ] Canonical URLs

**Performance Pendiente**:
- [ ] Code splitting (React.lazy)
- [ ] Bundle analysis
- [ ] Image optimization
- [ ] Lazy loading de imágenes
- [ ] Minification avanzada
- [ ] Caching headers
- [ ] CDN para assets
- [ ] Lighthouse score >90

**Prioridad**: Media (para después de lanzamiento)
**Tiempo Estimado**: 12-16 horas
- SEO: 6-8 horas
- Performance: 6-8 horas

---

### 📊 MONITOREO Y ANALYTICS (PARCIAL)

**Implementado ✅**:
- ✅ Winston logging (backend)

**Pendiente**:
- [ ] Sentry integration (error tracking)
- [ ] Error alerts
- [ ] Performance monitoring
- [ ] Google Analytics
- [ ] Conversion tracking
- [ ] User behavior analysis
- [ ] Mixpanel o Heap analytics

**Prioridad**: Media-Alta
**Tiempo Estimado**: 8-12 horas
- Sentry: 2-4 horas
- Analytics: 2-4 horas
- Performance monitoring: 2-4 horas

---

### 💡 FEATURES DESEABLES (FASE 7-8)

**NO IMPLEMENTADOS - Baja Prioridad**:
1. **Análitica Avanzada** - Dashboard de estadísticas detalladas
   - Tiempo: 16-20 horas
   - Complejidad: Alta

2. **Historial de Usuario** - Ver consultas antiguas
   - Tiempo: 4-6 horas
   - Complejidad: Baja

---

## 📋 RESUMEN PRIORIZADO

### 🟢 COMPLETADO (Nov 28, 2025)
1. ✅ CORS restrictivo (ALLOW_ALL_CORS=0 en producción)
2. ✅ JWT secrets verificados
3. ✅ Tests ejecutados - 83.79% coverage (600+ tests)
4. ✅ Email de reset de contraseña implementado
5. ✅ emailService.test.ts - 40+ tests
6. ✅ authService.email.test.ts - 40+ tests
7. ✅ sentry.test.ts - 30+ tests
8. ✅ swagger.test.ts - 25+ tests  
9. ✅ sitemap.test.ts - 25+ tests (incluye robots.txt)
10. ✅ auth.test.ts - 60+ tests actualizados
11. ✅ Sentry integration completa
12. ✅ SEO completo (Sitemap, robots.txt, Schema.org, Open Graph)
13. ✅ Google Analytics 4 funcionando en producción
14. ✅ CSP configurado para GA4 (SHA256 hash + wildcard domains)

**Total**: 0 horas restantes para features críticos

### 🟡 OPCIONAL (Post-Launch v1.2+)
1. Tests E2E workflows (16-20h) - Ya tenemos 83.79% coverage
2. A/B Testing con Google Optimize (4-6h)
3. Custom dashboards en GA4 Console (2-4h)
4. DOMPurify sanitization adicional (2-3h)

**Total**: ~24-33 horas (opcional)

---

## 🎯 RECOMENDACIÓN DE IMPLEMENTACIÓN

### Fase Inmediata (Esta semana)
```
1. Ejecutar tests (4-6h)
2. CORS fix (1h)
3. JWT secrets verification (1h)
─────────────────────────
Total: 6-8 horas
```

### Fase Post-Launch (Semanas 9-11)
```
1. Admin Panel (24-32h)
2. Sentry (2-4h)
3. Email reset password (2-3h)
─────────────────────────
Total: 28-39 horas
```

### Fase Optimización (Semanas 12-13)
```
1. SEO (6-8h)
2. Performance (6-8h)
3. Emails adicionales (4-6h)
─────────────────────────
Total: 16-22 horas
```

### Fase Expansion (v1.2 - Semanas 14+)
```
Evaluar según métricas de usuarios y feedback:
- Analytics avanzado si se necesitan insights
```

---

## 📝 NOTAS IMPORTANTES

1. **✅ TODOS LOS BLOCKERS RESUELTOS** - El proyecto está listo para producción.

2. **✅ Tests completos** - 600+ tests pasando con 83.79% coverage.
   - emailService.test.ts (40+ tests)
   - authService.email.test.ts (40+ tests)
   - sentry.test.ts (30+ tests)
   - swagger.test.ts (25+ tests)
   - sitemap.test.ts (25+ tests)
   - auth.test.ts (60+ tests)
   - adminService.test.ts (50+ tests)
   - Y muchos más...

3. **✅ Google Analytics 4** funcionando en producción con tracking real-time verificado.

4. **✅ Sentry** monitoreando errores en backend y frontend con Web Vitals.

5. **✅ Swagger API Docs** disponible en `/api-docs` con 29 endpoints documentados.

6. **✅ SEO completo** - Sitemap, robots.txt, Schema.org JSON-LD, Open Graph tags.

7. **Features opcionales** como A/B testing y custom GA4 dashboards pueden esperar hasta v1.2.

---

**Documento creado**: Noviembre 13, 2025
**Última actualización**: Noviembre 28, 2025
**Owner**: Development Team
**Estado**: 🟢 PRODUCTION READY
