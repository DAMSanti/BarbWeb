# 📋 FEATURES PENDIENTES - Barbara & Abogados
## Características encontradas en ROADMAP_PROFESSIONAL pero no implementadas

**Fecha**: Noviembre 13, 2025
**Fuente**: Análisis de ROADMAP_PROFESSIONAL.md vs ROADMAP_QUICK.md y PROGRESS_REPORT.md

---

## 🎯 FEATURES DE ROADMAP_PROFESSIONAL NO PRESENTES EN ROADMAP_QUICK

### 📧 Email Types Adicionales (NO IMPLEMENTADOS)
**Estado**: ✅ COMPLETAMENTE IMPLEMENTADO (8/8 templates)

**Implementados ✅**:
- ✅ Confirmación de pago (cliente)
- ✅ Notificación a abogado (nueva consulta)
- ✅ Payment failed (cliente)
- ✅ Refund confirmation (cliente)
- ✅ Email de bienvenida (post-registro)
- ✅ Resumen de consulta realizada (para consultas PAGADAS solamente)
- ✅ Factura/recibo detallado (con formato fiscal)
- ✅ Reset de contraseña (forgot password flow)

**Total: 8/8 Templates implementados ✅**

**Prioridad**: ✅ COMPLETADO
**Notas**: Todos los templates de email están implementados. El resumen de consulta solo se envía para consultas que fueron pagadas, no para consultas con IA gratuita.

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
1. **Chat en Vivo** - Soporte real-time con socket.io
   - Tiempo: 16-24 horas
   - Complejidad: Alta
   
2. **Sistema de Ratings** - Reviews de servicios
   - Tiempo: 8-12 horas
   - Complejidad: Media
   
3. **Multi-idioma** - i18n para otros idiomas (inglés, francés)
   - Tiempo: 12-16 horas
   - Complejidad: Media
   
4. **Análitica Avanzada** - Dashboard de estadísticas detalladas
   - Tiempo: 16-20 horas
   - Complejidad: Alta

5. **Historial de Usuario** - Ver consultas antiguas
   - Tiempo: 4-6 horas
   - Complejidad: Baja

---

## 📋 RESUMEN PRIORIZADO

### 🔴 ALTA PRIORIDAD (Antes de Producción)
1. ⚠️ Cambiar CORS a modo restrictivo (1h)
2. ⚠️ Verificar/rotar JWT secrets (1h)
3. ⏳ Ejecutar tests y generar coverage (4-6h)
4. ⏳ Email de reset de contraseña (2-3h)

**Total**: ~8-11 horas

### 🟡 MEDIA PRIORIDAD (Post-Launch v1.1)
1. Admin Panel completo (24-32h)
2. Sentry integration (2-4h)
3. SEO básico (6-8h)
4. Performance optimization (6-8h)
5. Emails adicionales (bienvenida, resumen) (4-6h)

**Total**: ~42-58 horas

### 🟢 BAJA PRIORIDAD (v1.2+)
1. Chat en vivo (16-24h)
2. Sistema de ratings (8-12h)
3. Multi-idioma (12-16h)
4. Analytics avanzado (16-20h)
5. DOMPurify sanitization (2-3h)

**Total**: ~54-75 horas

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
- Chat en vivo si hay demanda alta
- Multi-idioma si hay usuarios internacionales
- Analytics avanzado si se necesitan insights
```

---

## 📝 NOTAS IMPORTANTES

1. **Admin Panel** es la única feature "grande" que falta para tener un MVP completo y gestionable.

2. **CORS y JWT secrets** son críticos de seguridad que DEBEN arreglarse antes de quitar el modo test de Stripe.

3. **Tests execution** es crítico para validar que todo funciona correctamente antes de lanzamiento.

4. **Sentry** es altamente recomendado para monitorear errores en producción desde el día 1.

5. **SEO y Performance** pueden esperar hasta después del lanzamiento inicial, pero deben priorizarse en v1.1 para mejorar adquisición de usuarios.

6. **Chat en vivo y features avanzadas** son deseables pero NO críticas. Evaluar según demanda real de usuarios.

---

**Documento creado**: Noviembre 13, 2025
**Próxima revisión**: Después de completar Admin Panel
**Owner**: Development Team
