# 🚀 Guía de Migración a Producción - Barbara & Abogados

**Fecha de creación**: Noviembre 27, 2025  
**Última actualización**: Noviembre 27, 2025  
**Dominio actual**: www.damsanti.app  
**Dominio cliente**: [POR DEFINIR]

---

## 📋 Resumen Ejecutivo

Esta guía documenta todos los cambios necesarios para migrar la aplicación de:
- `www.damsanti.app` → `www.[dominio-cliente].com`
- Stripe TEST → Stripe LIVE
- Email de prueba → Email del dominio del cliente

---

## 1. 🌐 Cambios de Dominio

### 1.1 Variables de Entorno (DigitalOcean App Platform)

**Backend** - Cambiar en DO App Platform → Settings → Environment Variables:

| Variable | Valor Actual | Nuevo Valor |
|----------|--------------|-------------|
| `APP_DOMAIN` | `www.damsanti.app` | `www.[cliente].com` |
| `FRONTEND_URL` | `https://www.damsanti.app` | `https://www.[cliente].com` |
| `ALLOWED_ORIGINS` | `https://www.damsanti.app` | `https://www.[cliente].com` |

**Frontend** - Cambiar en DO App Platform → Settings → Environment Variables:

| Variable | Valor Actual | Nuevo Valor |
|----------|--------------|-------------|
| `VITE_FRONTEND_URL` | `https://www.damsanti.app` | `https://www.[cliente].com` |
| `VITE_API_URL` | `https://www.damsanti.app/api` | `https://www.[cliente].com/api` |

### 1.2 Código Fuente

#### `backend/src/routes/sitemap.ts`
Buscar y reemplazar todas las URLs del sitemap:

```typescript
// ANTES
const baseUrl = 'https://www.damsanti.app';

// DESPUÉS
const baseUrl = 'https://www.[cliente].com';
```

#### `backend/src/middleware/security.ts`
Verificar que CSP permite el nuevo dominio (se configura dinámicamente desde `APP_DOMAIN`).

#### `frontend/src/utils/sentry.ts`
Actualizar `allowUrls` si es necesario:

```typescript
// ANTES
allowUrls: [/https:\/\/www\.damsanti\.app/],

// DESPUÉS  
allowUrls: [/https:\/\/www\.[cliente]\.com/],
```

### 1.3 DNS (Registrador del Cliente)

Configurar los siguientes registros DNS:

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| A | @ | [IP de DigitalOcean] | 300 |
| A | www | [IP de DigitalOcean] | 300 |
| CNAME | @ | [app-slug].ondigitalocean.app | 300 |

> **Nota**: DigitalOcean App Platform genera automáticamente certificados SSL. Solo necesitas apuntar el DNS.

### 1.4 DigitalOcean App Platform

1. Ir a **Apps** → Tu app → **Settings** → **Domains**
2. Click **Add Domain**
3. Añadir `[cliente].com` y `www.[cliente].com`
4. Seguir instrucciones para verificar DNS
5. Esperar propagación (5-30 minutos)

---

## 2. 💳 Stripe: TEST → LIVE

### 2.1 Obtener Credenciales LIVE

1. Ir a [Stripe Dashboard](https://dashboard.stripe.com)
2. **Activar cuenta** (si no está activada):
   - Completar información del negocio
   - Verificar identidad
   - Añadir cuenta bancaria para recibir pagos
3. Cambiar toggle de "Test mode" a "Live mode" (arriba a la derecha)
4. Ir a **Developers** → **API keys**
5. Copiar:
   - `Publishable key` (empieza con `pk_live_`)
   - `Secret key` (empieza con `sk_live_`)

### 2.2 Crear Nuevo Webhook LIVE

1. En Stripe Dashboard (modo LIVE) → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Configurar:
   - **URL**: `https://www.[cliente].com/api/webhooks/stripe`
   - **Eventos**: 
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
4. Click **Add endpoint**
5. Copiar **Signing secret** (empieza con `whsec_`)

### 2.3 Actualizar Variables de Entorno

**Backend** (DigitalOcean):

| Variable | Valor TEST | Valor LIVE |
|----------|------------|------------|
| `STRIPE_SECRET_KEY` | `sk_test_...` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (test) | `whsec_...` (live) |

**Frontend** (DigitalOcean):

| Variable | Valor TEST | Valor LIVE |
|----------|------------|------------|
| `VITE_STRIPE_PUBLIC_KEY` | `pk_test_...` | `pk_live_...` |

### 2.4 Verificación Post-Cambio

```bash
# Test webhook manualmente desde Stripe CLI (opcional)
stripe listen --forward-to https://www.[cliente].com/api/webhooks/stripe

# O hacer una compra real de prueba con tarjeta real
```

---

## 3. 📧 Email: Resend Configuration

### 3.1 Verificar Dominio del Cliente

1. Ir a [Resend Dashboard](https://resend.com/domains)
2. Click **Add Domain**
3. Introducir: `[cliente].com`
4. Añadir los registros DNS que Resend proporciona:
   - SPF record
   - DKIM records (3 registros)
   - DMARC record (opcional pero recomendado)
5. Esperar verificación (5-60 minutos)

### 3.2 Actualizar Variables de Entorno

**Backend** (DigitalOcean):

| Variable | Valor Actual | Nuevo Valor |
|----------|--------------|-------------|
| `EMAIL_FROM` | `onboarding@resend.dev` | `info@[cliente].com` |

> **Nota**: `RESEND_API_KEY` NO cambia. Es la misma API key.

### 3.3 Emails que se Envían

| Email | Cuándo | Template |
|-------|--------|----------|
| Bienvenida | Post-registro | `sendWelcomeEmail()` |
| Confirmación de pago | Webhook payment_intent.succeeded | `sendPaymentConfirmation()` |
| Nueva consulta (admin) | Webhook payment_intent.succeeded | `sendNewConsultationNotification()` |
| Reset password | Solicitud de usuario | `sendPasswordResetEmail()` |

---

## 4. 🔐 OAuth: Google & Microsoft

### 4.1 Google OAuth

1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Seleccionar proyecto → **APIs & Services** → **Credentials**
3. Click en tu OAuth 2.0 Client ID
4. En **Authorized redirect URIs**, añadir:
   - `https://www.[cliente].com/api/auth/oauth/google/callback`
5. En **Authorized JavaScript origins**, añadir:
   - `https://www.[cliente].com`
   - `https://[cliente].com`
6. Guardar cambios

### 4.2 Microsoft OAuth

1. Ir a [Azure Portal](https://portal.azure.com)
2. **Azure Active Directory** → **App registrations** → Tu app
3. **Authentication** → **Platform configurations** → **Web**
4. En **Redirect URIs**, añadir:
   - `https://www.[cliente].com/api/auth/oauth/microsoft/callback`
5. Guardar

### 4.3 Variables de Entorno

Las variables `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` **NO cambian** - son las mismas credenciales.

Solo cambiar:

| Variable | Valor Actual | Nuevo Valor |
|----------|--------------|-------------|
| `GOOGLE_CALLBACK_URL` | `https://www.damsanti.app/api/auth/oauth/google/callback` | `https://www.[cliente].com/api/auth/oauth/google/callback` |
| `MICROSOFT_CALLBACK_URL` | `https://www.damsanti.app/api/auth/oauth/microsoft/callback` | `https://www.[cliente].com/api/auth/oauth/microsoft/callback` |

---

## 5. 📊 Sentry

### 5.1 Actualizar Configuración (Opcional)

Si quieres un proyecto Sentry separado para el cliente:

1. Crear nuevo proyecto en Sentry
2. Obtener nuevo DSN
3. Actualizar `VITE_SENTRY_DSN` en frontend
4. Actualizar `SENTRY_DSN` en backend

> **Recomendación**: Mantener el mismo proyecto Sentry para simplificar. El dominio no afecta al tracking.

---

## 6. ✅ Checklist de Migración

### Antes de Migrar

- [ ] Cliente tiene dominio registrado
- [ ] Cliente tiene acceso a DNS del dominio
- [ ] Stripe cuenta LIVE activada (verificación de negocio completa)
- [ ] Cuenta bancaria añadida a Stripe para recibir pagos
- [ ] Backup de base de datos realizado

### Cambios de Dominio

- [ ] DNS configurado (A, CNAME records)
- [ ] Dominio añadido en DigitalOcean App Platform
- [ ] SSL certificado generado automáticamente
- [ ] `APP_DOMAIN` actualizado
- [ ] `FRONTEND_URL` actualizado
- [ ] `ALLOWED_ORIGINS` actualizado
- [ ] `VITE_FRONTEND_URL` actualizado
- [ ] `VITE_API_URL` actualizado
- [ ] URLs en `sitemap.ts` actualizadas
- [ ] Código desplegado con cambios

### Stripe LIVE

- [ ] `STRIPE_SECRET_KEY` cambiado a `sk_live_`
- [ ] `VITE_STRIPE_PUBLIC_KEY` cambiado a `pk_live_`
- [ ] Webhook LIVE creado en Stripe Dashboard
- [ ] `STRIPE_WEBHOOK_SECRET` actualizado con nuevo `whsec_`
- [ ] Test de pago real exitoso
- [ ] Verificar dinero llega a cuenta Stripe

### Email

- [ ] Dominio verificado en Resend
- [ ] `EMAIL_FROM` actualizado
- [ ] Test de email enviado correctamente
- [ ] Verificar emails no van a spam

### OAuth

- [ ] Google: Redirect URIs actualizadas
- [ ] Google: JavaScript origins actualizadas
- [ ] Microsoft: Redirect URIs actualizadas
- [ ] `GOOGLE_CALLBACK_URL` actualizada
- [ ] `MICROSOFT_CALLBACK_URL` actualizada
- [ ] Test login con Google exitoso
- [ ] Test login con Microsoft exitoso

### Verificación Final

- [ ] Homepage carga correctamente
- [ ] Login funciona (email + OAuth)
- [ ] Registro funciona
- [ ] Pago completo funciona (con tarjeta real)
- [ ] Email de confirmación llega
- [ ] Panel admin accesible
- [ ] Sentry recibiendo eventos
- [ ] No errores en consola del navegador
- [ ] No errores en logs de DigitalOcean

---

## 7. 🔄 Rollback Plan

Si algo falla durante la migración:

### Rollback Rápido (5 minutos)

1. En DigitalOcean App Platform, revertir variables de entorno a valores anteriores
2. Forzar redeploy
3. El dominio anterior (`damsanti.app`) seguirá funcionando

### Rollback de Stripe

1. Cambiar `STRIPE_SECRET_KEY` de vuelta a `sk_test_`
2. Cambiar `VITE_STRIPE_PUBLIC_KEY` de vuelta a `pk_test_`
3. Cambiar `STRIPE_WEBHOOK_SECRET` al webhook de test
4. Redeploy

### Rollback de Base de Datos

1. En DigitalOcean → Databases → Tu DB
2. Click **Backups**
3. Seleccionar backup anterior a la migración
4. Click **Restore** o **Fork**

---

## 8. 📝 Contenido a Revisar con el Cliente

Antes de lanzar, verificar con el cliente:

### Datos Legales (OBLIGATORIO)

- [ ] **Nombre legal completo** del bufete
- [ ] **CIF/NIF** de la empresa
- [ ] **Dirección fiscal** completa
- [ ] **Teléfono** de contacto
- [ ] **Email** de contacto oficial
- [ ] **Número de colegiado** de los abogados (si aplica)

### Textos Legales

- [ ] **Política de Privacidad** - Revisar con abogado del cliente
- [ ] **Términos y Condiciones** - Revisar con abogado del cliente
- [ ] **Política de Cookies** - Actualizar si hay cambios
- [ ] **Aviso Legal** - Datos actualizados del titular

### Precios y Servicios

- [ ] **Precio de consulta** - ¿35€ está bien?
- [ ] **Tipos de consultas** ofrecidas
- [ ] **Tiempo de respuesta** prometido
- [ ] **FAQs** - Revisar y actualizar si es necesario

### Branding (Opcional)

- [ ] **Logo** del cliente (si quiere personalizarlo)
- [ ] **Colores** corporativos (si quiere cambiarlos)
- [ ] **Textos** de la homepage
- [ ] **Descripción** de servicios

---

## 9. 🕐 Timeline Estimado de Migración

| Fase | Duración | Descripción |
|------|----------|-------------|
| Preparación | 1-2 días | Obtener info del cliente, verificar Stripe LIVE |
| DNS Setup | 5-30 min | Configurar DNS + esperar propagación |
| Variables | 15 min | Actualizar todas las env vars |
| Código | 30 min | Actualizar sitemap.ts, deploy |
| Stripe LIVE | 30 min | Crear webhook, actualizar keys |
| Email | 30-60 min | Verificar dominio en Resend |
| OAuth | 15 min | Actualizar redirect URIs |
| Testing | 1-2 horas | Probar todos los flujos |
| **Total** | **~4-6 horas** | (excluyendo tiempo de espera DNS) |

---

## 10. 📞 Soporte Post-Migración

### Primeras 24 horas

- Monitorear logs de DigitalOcean constantemente
- Revisar Sentry para errores
- Verificar que pagos se procesan correctamente
- Responder rápidamente a cualquier incidencia

### Primera semana

- Revisar métricas de Stripe (pagos exitosos vs fallidos)
- Verificar emails no van a spam
- Recolectar feedback del cliente
- Ajustar si es necesario

---

**Documento preparado por**: GitHub Copilot  
**Revisado por**: [Pendiente]  
**Aprobado por**: [Pendiente]
