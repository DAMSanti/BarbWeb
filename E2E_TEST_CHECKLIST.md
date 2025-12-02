# 🧪 Checklist de Pruebas E2E en Producción

**URL**: https://www.damsanti.app
**Fecha**: Diciembre 2, 2025
**Estado**: En Progreso

---

## ✅ Verificaciones Automáticas Completadas

| Test | URL | Estado | Resultado |
|------|-----|--------|-----------|
| Health Check | /health | ✅ PASS | `{"status":"running","version":"1.0.0"}` |
| Sitemap.xml | /sitemap.xml | ✅ PASS | 8 URLs indexadas |
| Robots.txt | /robots.txt | ✅ PASS | Allow: / + Sitemap |
| API Docs | /api-docs | ✅ PASS | 29 endpoints documentados |
| Homepage | / | ✅ PASS | Contenido carga correctamente |
| Imagen Local | /images/chess-bg-original.jpg | ✅ PASS | Imagen carga |

---

## 📋 Pruebas Manuales Requeridas

### 1. 🔐 Autenticación (5-10 min)

#### Registro de Usuario
- [ ] Ir a https://www.damsanti.app/register
- [ ] Completar formulario con email nuevo
- [ ] Verificar que llegue email de verificación
- [ ] Click en link de verificación
- [ ] Verificar redirección a login

#### Login con Email
- [ ] Ir a https://www.damsanti.app/login
- [ ] Ingresar credenciales válidas
- [ ] Verificar redirección a home
- [ ] Verificar que Header muestra nombre de usuario
- [ ] Verificar que "Logout" funciona

#### OAuth Google
- [ ] Click en "Continuar con Google"
- [ ] Seleccionar cuenta Google
- [ ] Verificar redirección exitosa
- [ ] Verificar usuario logueado

#### OAuth Microsoft
- [ ] Click en "Continuar con Microsoft"
- [ ] Seleccionar cuenta Microsoft
- [ ] Verificar redirección exitosa
- [ ] Verificar usuario logueado

#### Password Reset
- [ ] Ir a "¿Olvidaste tu contraseña?"
- [ ] Ingresar email registrado
- [ ] Verificar que llegue email
- [ ] Click en link y cambiar contraseña
- [ ] Login con nueva contraseña

---

### 2. 🤖 Sistema de FAQ / IA (5 min)

- [ ] Ir a https://www.damsanti.app/faq
- [ ] Escribir pregunta: "¿Cómo puedo divorciarme?"
- [ ] Verificar que aparezca respuesta de IA
- [ ] Verificar categoría detectada correctamente
- [ ] Probar otra pregunta: "Me han despedido sin justificación"
- [ ] Verificar respuesta relevante

---

### 3. 💳 Flujo de Pago Stripe (10-15 min)

> ⚠️ **IMPORTANTE**: Usar tarjeta de prueba: `4242 4242 4242 4242`

#### Crear Consulta Pagada
- [ ] Estar logueado
- [ ] Hacer pregunta que requiera consulta pagada
- [ ] Click en "Solicitar Consulta Profesional"
- [ ] Verificar redirección a /checkout

#### Proceso de Pago
- [ ] Verificar que PaymentElement carga (campos de tarjeta)
- [ ] Ingresar datos de prueba:
  - Tarjeta: `4242 4242 4242 4242`
  - Fecha: cualquier fecha futura (ej: 12/28)
  - CVC: cualquier 3 dígitos (ej: 123)
  - Código postal: cualquier código (ej: 28001)
- [ ] Click en "Pagar"
- [ ] Verificar spinner de procesamiento
- [ ] Verificar pantalla de éxito

#### Verificaciones Post-Pago
- [ ] Verificar en Stripe Dashboard: Payment Intent creado
- [ ] Verificar email de confirmación recibido
- [ ] Verificar email a abogado enviado (si tienes acceso)

#### Test de Pago Fallido
- [ ] Repetir proceso con tarjeta de error: `4000 0000 0000 0002`
- [ ] Verificar mensaje de error mostrado
- [ ] Verificar que NO se cobra

---

### 4. 👨‍💼 Panel de Administración (5-10 min)

> Requiere usuario con rol `admin`

- [ ] Login con cuenta admin
- [ ] Ir a https://www.damsanti.app/admin
- [ ] Verificar Dashboard carga con estadísticas
- [ ] Click en "Usuarios" - verificar lista
- [ ] Click en "Pagos" - verificar historial
- [ ] Click en "Analytics" - verificar gráficos
- [ ] Probar cambiar rol de un usuario (si es seguro)

---

### 5. 📧 Emails (verificar en inbox)

- [ ] Email de verificación de cuenta
- [ ] Email de reset password
- [ ] Email de confirmación de pago
- [ ] Email de fallo de pago (usar tarjeta `4000 0000 0000 0002`)

---

### 6. 🛡️ Seguridad (2-3 min)

#### Headers de Seguridad
Verificar en DevTools > Network > Response Headers:
- [ ] `Content-Security-Policy` presente
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `Strict-Transport-Security` presente

#### Rate Limiting
- [ ] Hacer 6+ intentos de login fallidos seguidos
- [ ] Verificar que aparezca error de "Too many requests"

#### CORS
- [ ] Abrir consola del navegador
- [ ] Verificar NO hay errores de CORS

---

### 7. 📱 Responsive (3-5 min)

- [ ] Abrir en móvil (o DevTools responsive)
- [ ] Verificar Homepage se ve bien
- [ ] Verificar menú hamburguesa funciona
- [ ] Verificar FAQ page funciona en móvil
- [ ] Verificar Checkout funciona en móvil
- [ ] Verificar Login/Register en móvil

---

### 8. 🔍 SEO & Analytics (2-3 min)

#### Meta Tags
- [ ] Ver código fuente de la página
- [ ] Verificar `<title>` presente
- [ ] Verificar `<meta name="description">` presente
- [ ] Verificar Open Graph tags presentes

#### Google Analytics
- [ ] Abrir GA4 Real-time
- [ ] Navegar por la web
- [ ] Verificar que se registran visitas

#### Google Search Console
- [ ] Verificar que sitemap está indexado
- [ ] Verificar no hay errores de cobertura

---

### 9. 🧪 Sentry Error Tracking (1-2 min)

- [ ] Abrir Sentry Dashboard
- [ ] Verificar que no hay errores recientes críticos
- [ ] (Opcional) Provocar error y verificar que aparece en Sentry

---

## 📊 Resumen de Resultados

| Categoría | Pruebas | Pasadas | Fallidas |
|-----------|---------|---------|----------|
| Autenticación | 10 | | |
| FAQ/IA | 4 | | |
| Pagos Stripe | 8 | | |
| Admin Panel | 5 | | |
| Emails | 4 | | |
| Seguridad | 5 | | |
| Responsive | 6 | | |
| SEO/Analytics | 5 | | |
| Sentry | 2 | | |
| **TOTAL** | **49** | | |

---

## 🐛 Issues Encontrados

| # | Descripción | Severidad | Estado |
|---|-------------|-----------|--------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

---

## ✅ Aprobación Final

- [ ] Todas las pruebas críticas pasadas
- [ ] No hay errores bloqueantes
- [ ] Emails funcionando
- [ ] Pagos funcionando
- [ ] **APROBADO PARA PRODUCCIÓN**

**Fecha de Aprobación**: ________________
**Aprobado por**: ________________
