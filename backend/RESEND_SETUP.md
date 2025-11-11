# 📧 Configuración de Resend - Email Service

## 🚀 Paso 1: Crear Cuenta en Resend

1. Ve a https://resend.com/signup
2. Regístrate con tu email
3. Verifica tu cuenta (check your inbox)

## 🔑 Paso 2: Obtener API Key

1. Inicia sesión en https://resend.com
2. Ve a **Settings → API Keys**
3. Click en **"Create API Key"**
4. Dale un nombre (ej: "BarbWeb Production")
5. Copia la API key (empieza con `re_...`)
6. **IMPORTANTE**: Guárdala en un lugar seguro, no la volverás a ver

## ⚙️ Paso 3: Configurar Variables de Entorno

### En Local (archivo `.env`)

```bash
# Resend API Key
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx

# Email del remitente (mientras verificas dominio usa el de Resend)
EMAIL_FROM=onboarding@resend.dev

# Email del abogado (para notificaciones)
LAWYER_EMAIL=abogados.bgarcia@gmail.com
```

### En DigitalOcean

1. Ve a tu app en DigitalOcean App Platform
2. Settings → App-Level Environment Variables (Backend)
3. Añade:
   - `RESEND_API_KEY` = `re_xxxxxxxxxxxxxxxxxx`
   - `EMAIL_FROM` = `onboarding@resend.dev`
   - `LAWYER_EMAIL` = `abogados.bgarcia@gmail.com`
4. Guarda y espera redeploy automático

## 📬 Paso 4: Verificar Dominio (OPCIONAL - pero recomendado)

### ¿Por qué verificar tu dominio?

- Tus emails vendrán de `tu-nombre@tudominio.com` en lugar de `onboarding@resend.dev`
- Mayor tasa de entrega (menos spam)
- Más profesional

### Cómo verificar

1. En Resend Dashboard → **Domains**
2. Click **"Add Domain"**
3. Ingresa tu dominio (ej: `barbaraabogados.com`)
4. Resend te dará registros DNS para añadir:
   - **SPF**: TXT record
   - **DKIM**: TXT record
   - **DMARC**: TXT record

5. Ve a tu proveedor de dominio (GoDaddy, Namecheap, etc.)
6. Añade los registros DNS
7. Espera 24-48 horas para propagación
8. Verifica en Resend Dashboard (aparecerá ✅ verde)

### Ejemplo de configuración DNS (GoDaddy)

```
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all

Type: TXT
Name: resend._domainkey
Value: (el valor que te da Resend)

Type: TXT  
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@tudominio.com
```

## ✅ Paso 5: Testing

### Opción A: Usar el endpoint de testing

```bash
# En tu terminal
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "oOoRathmaoOo@gmail.com",
    "clientName": "Juan Pérez"
  }'
```

### Opción B: Hacer un pago de prueba

1. Ve a tu app local: http://localhost:5173
2. Haz login
3. Ve a FAQ → Hacer una pregunta
4. Rellena el checkout
5. Usa tarjeta test: `4242 4242 4242 4242`
6. Submit
7. ✅ Deberías recibir 2 emails:
   - Uno a tu email (confirmación)
   - Uno a `abogados.bgarcia@gmail.com` (notificación)

## 📊 Monitoreo

### Ver emails enviados

1. Dashboard de Resend: https://resend.com/emails
2. Verás todos los emails enviados
3. Click en uno para ver:
   - Estado (delivered, bounced, etc.)
   - Contenido HTML
   - Logs de entrega

### Límites del plan gratuito

- ✅ **3,000 emails/mes gratis**
- ✅ Sin tarjeta de crédito requerida
- ✅ Ilimitados dominios

## 🚨 Troubleshooting

### Error: "API key is invalid"

- Verifica que copiaste bien la API key
- Asegúrate de que empieza con `re_`
- Revisa que no haya espacios al inicio/final

### Error: "Domain not verified"

- Si usas tu dominio propio, verifica que los DNS estén configurados
- Usa temporalmente `onboarding@resend.dev` hasta verificar

### Emails no llegan (van a spam)

- Verifica tu dominio (SPF, DKIM, DMARC)
- Usa `EMAIL_FROM` con dominio verificado
- Evita palabras spam en asunto ("gratis", "oferta", etc.)

### Error: "Rate limit exceeded"

- Superaste 3,000 emails/mes
- Upgrade a plan pagado ($20/mes por 50,000 emails)

## 📧 Tipos de Email Implementados

1. **Payment Confirmation** (Cliente)
   - Se envía cuando el pago es exitoso
   - Incluye detalles de la consulta
   - Template: Green gradient header

2. **Lawyer Notification** (Abogado)
   - Se envía al abogado cuando hay nueva consulta
   - Incluye datos del cliente
   - Template: Blue-green gradient header

3. **Payment Failed** (Cliente)
   - Se envía si el pago falla
   - Incluye razón del error
   - Template: Red gradient header

4. **Refund Confirmation** (Cliente)
   - Se envía cuando se procesa un reembolso
   - Incluye monto reembolsado
   - Template: Green gradient header

## 🎨 Personalizar Templates

Los templates están en:
`backend/src/services/emailService.ts`

Cada función `get*Template()` retorna HTML inline.

### Ejemplo de customización

```typescript
// Cambiar colores del header
style="background: linear-gradient(135deg, #TU_COLOR_1 0%, #TU_COLOR_2 100%);"

// Cambiar logo
<img src="https://tu-dominio.com/logo.png" alt="Logo" style="width: 150px;" />

// Cambiar texto
<h1>¡Tu Título Aquí!</h1>
```

## 💰 Costos

| Plan | Emails/Mes | Precio |
|------|-----------|--------|
| **Free** | 3,000 | $0 |
| **Pro** | 50,000 | $20/mes |
| **Pro+** | 100,000 | $80/mes |

**Recomendación**: Empieza con Free, upgrade cuando superes 3,000 emails/mes.

---

**¿Preguntas?** 
- Docs oficiales: https://resend.com/docs
- Soporte: support@resend.com
