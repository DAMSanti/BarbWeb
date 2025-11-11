# 🧪 GUÍA DE TESTING - Error Handling Implementation

**Fecha**: Noviembre 11, 2025
**Versión**: 1.0
**Estado**: Ready to Test

---

## 🎯 Objetivo

Verificar que los errores del backend están siendo parseados correctamente por el frontend y mostrados como **mensajes amigables en español** (NO técnicos).

---

## 🚀 Quick Start - 5 Minutos

### Paso 1: Abre el Frontend
```bash
cd frontend
npm run dev
```

### Paso 2: Abre Chrome/Firefox
```
http://localhost:5173/barbweb2
```

### Paso 3: Ir a LoginPage
```
Clickea el botón "Iniciar Sesión" en el Header
```

### Paso 4: Prueba el Error Handling

**Intentar login con email inválido:**
```
Email: invalid
Password: anything
```

**Esperado:**
```
✅ Mensaje: "Email inválido"
❌ NO deberías ver: JSON técnico
```

---

## 📋 TESTS DETALLADOS

### TEST 1: Validation Error (Email inválido)

**Pasos:**
1. Abre LoginPage
2. Email: `invalid`
3. Password: `password123`
4. Click "Iniciar Sesión"

**Esperado:**
```
UI mostrar:
⚠️ Email inválido

NO mostrar:
{"success":false,"error":"Error interno...
```

**Cómo verificar:**
- [ ] El mensaje es rojo
- [ ] El mensaje es amigable
- [ ] Sin JSON técnico
- [ ] El icono de alerta está presente

---

### TEST 2: Validation Error (Password vacío)

**Pasos:**
1. Abre LoginPage
2. Email: `test@test.com`
3. Password: (vacío)
4. Click "Iniciar Sesión"

**Esperado:**
```
⚠️ Por favor completa todos los campos
```

**Cómo verificar:**
- [ ] Mensaje aparece inmediatamente (sin esperar)
- [ ] No hay llamada al backend
- [ ] Dev Console: Sin errores

---

### TEST 3: Email duplicado en Register

**Pasos:**
1. Abre RegisterPage
2. Nombre: `Test User`
3. Email: `adfa@dsf.cm` (o un email que ya existe)
4. Password: `TestPassword123!`
5. Confirm: `TestPassword123!`
6. Check "Aceptar términos"
7. Click "Crear Cuenta"

**Esperado:**
```
⚠️ Este elemento ya existe
```

**Cómo verificar:**
- [ ] Mensaje es amigable
- [ ] Error HTTP 409 (en Network tab)
- [ ] Parseado correctamente desde backend

---

### TEST 4: Credenciales incorrectas

**Pasos:**
1. Abre LoginPage
2. Email: `adfa@dsf.cm`
3. Password: `wrongpassword123`
4. Click "Iniciar Sesión"

**Esperado:**
```
⚠️ Email o contraseña incorrectos
```

**Cómo verificar:**
- [ ] F12 → Network tab
- [ ] Request POST /auth/login
- [ ] Response status: 401
- [ ] Response body: `{"statusCode": 401, ...}`
- [ ] UI muestra: mensaje amigable

---

### TEST 5: Error del Servidor (500)

**Pasos (Simular error 500):**
1. Backend corriendo
2. Abre Dev Console (F12)
3. Ejecuta:
```javascript
// Simular que el backend devuelve 500
fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'test@test.com',
    password: 'test'
  })
}).then(r => r.json()).then(console.log)
```

**Esperado en Console:**
```json
{
  "statusCode": 500,
  "message": "Error interno del servidor"
}
```

**Cómo verificar parseado:**
1. En Dev Console ejecuta un login normal
2. Guarda en console el error
3. Verifica que `errorMessage` es: "Error del servidor, por favor intenta de nuevo"

---

## 🧪 INTEGRATION TESTS - Flujo Completo

### TEST 6: Login → Success

**Pasos:**
1. RegisterPage: Crea usuario nuevo
   - Email: `testuser_TIMESTAMP@test.com`
   - Password: `TestPass123!`
2. Deberías estar en HomePage
3. Header muestra nombre del usuario

**Esperado:**
```
✅ Autenticación exitosa
✅ Redirect a home
✅ User menu muestra datos
```

---

### TEST 7: Error Boundary Activation

**Pasos (Forzar error en componente):**
1. Abre LoginPage
2. Dev Console (F12)
3. Ejecuta:
```javascript
throw new Error("Test error")
```

**Esperado:**
```
UI muestra:
⚠️ Algo salió mal
[Reintentar] [Ir al inicio]
```

---

### TEST 8: Network Error + Retry

**Pasos:**
1. Backend corriendo
2. Abre FAQPage
3. Escribe una pregunta
4. **Inmediatamente** (antes de 1s): Termina el backend
5. Observa cómo se reintenta

**Esperado en Console:**
```
[DEBUG] Retrying attempt 1/3 after 1500ms due to Network Error
[DEBUG] Retrying attempt 2/3 after 3000ms due to Network Error
```

6. Reinicia backend después de 2.5s
7. La pregunta se procesa exitosamente

---

## 🧬 DEV CONSOLE CHECKS

### Abrir Dev Console
```
F12 → Console
```

### Ver logs de error parsing
```javascript
// En LoginPage, cuando hay error, verás:
[ERROR] LoginPage.handleSubmit: Email inválido
```

### Verificar que parseBackendError funciona
```javascript
// En Console, ejecuta:
import { parseBackendError } from './src/services/errorHandler'
const mockError = {
  response: {
    status: 401,
    data: { error: 'Invalid credentials' }
  }
}
console.log(parseBackendError(mockError))

// Debería mostrar:
// FrontendError {
//   message: "Request failed: 401",
//   userMessage: "Tu sesión expiró, por favor inicia sesión de nuevo",
//   statusCode: 401
// }
```

---

## 🌐 NETWORK TAB CHECKS

### Abrir Network Tab
```
F12 → Network
```

### Verificar Error Responses

**401 Unauthorized:**
```
POST /auth/login
Status: 401
Response:
{
  "success": false,
  "statusCode": 401,
  "message": "Authentication failed"
}
```

**422 Validation Error:**
```
POST /auth/register
Status: 422
Response:
{
  "success": false,
  "statusCode": 422,
  "message": "Validation failed",
  "details": [
    {
      "path": "email",
      "message": "Invalid email"
    }
  ]
}
```

**500 Server Error:**
```
POST /api/filter-question
Status: 500
Response:
{
  "statusCode": 500,
  "message": "Internal server error",
  "timestamp": "2025-11-11T17:30:19.221Z"
}
```

---

## ✅ CHECKLIST COMPLETO

### Frente del Usuario
- [ ] Mensajes de error en ESPAÑOL
- [ ] Icono ⚠️ visible
- [ ] Fondo rojo oscuro
- [ ] Sin JSON técnico visible
- [ ] Mensajes claros y útiles

### Error Handling
- [ ] Email inválido → "Email inválido"
- [ ] Campos vacíos → "Por favor completa todos los campos"
- [ ] Credenciales mal → "Email o contraseña incorrectos"
- [ ] Email duplicado → "Este elemento ya existe"
- [ ] Password muy corto → "La contraseña debe tener..."
- [ ] Validación fallida → Muestra detalles (NO JSON)

### Network + Retry
- [ ] Network error → Reintenta 3 veces (1.5s, 3s, 6s)
- [ ] 5xx error → Reintenta automáticamente
- [ ] 4xx error → NO reintenta
- [ ] Success después de retry → Transparente para usuario

### ErrorBoundary
- [ ] Componente error → Muestra UI amigable
- [ ] Botón "Reintentar" → Funciona
- [ ] Botón "Ir al inicio" → Navega a home
- [ ] Dev details → Visible en desarrollo

### Dev Console
- [ ] Logs: [ERROR] contexto: mensaje
- [ ] Logs: [DEBUG] Retrying...
- [ ] No hay console.errors no manejados
- [ ] Winston logger creando archivos

---

## 🎯 TESTING MATRIX

Marca ✅ conforme completes:

| Error Type | Test Case | Expected Message | UI OK | Network OK | Status |
|-----------|-----------|------------------|-------|-----------|--------|
| Validation | Email invalid | Email inválido | [ ] | [ ] | [ ] |
| Validation | Empty fields | Por favor completa... | [ ] | [ ] | [ ] |
| Auth | Wrong credentials | Email o contraseña... | [ ] | [ ] | [ ] |
| Conflict | Duplicate email | Este elemento ya... | [ ] | [ ] | [ ] |
| Network | Connection lost | Reintenta 3x | [ ] | [ ] | [ ] |
| Server | 500 error | Error del servidor... | [ ] | [ ] | [ ] |
| Boundary | Component error | Algo salió mal | [ ] | [ ] | [ ] |
| Retry | 5xx then success | Transparente | [ ] | [ ] | [ ] |

---

## 🚨 Problemas Comunes y Soluciones

### Problema: Veo JSON técnico en UI

**Causa**: `parseBackendError` NO está siendo usado
**Solución**: 
```bash
# Verificar que backendApi.ts importa parseBackendError
grep -r "parseBackendError" frontend/src/services/backendApi.ts

# Verificar que pages usan useErrorHandler
grep -r "useErrorHandler" frontend/src/pages/LoginPage.tsx
```

### Problema: No veo logs de retry

**Causa**: Node.env puede estar en production
**Solución**:
```javascript
// En Dev Console
console.log(process.env.NODE_ENV)
// Debería mostrar: "development"
```

### Problema: ErrorBoundary no funciona

**Causa**: App.tsx no tiene el wrapper
**Solución**:
```bash
grep -r "<ErrorBoundary" frontend/src/App.tsx
# Debería encontrar el wrapper
```

---

## 📊 Resultados Esperados

### Sesión Exitosa

```
Usuario abre LoginPage
├── Introduce credenciales válidas
├── Click "Iniciar Sesión"
├── Backend valida ✓
├── Frontend recibe respuesta ✓
├── Tokens guardados en localStorage ✓
├── Redirect a HomePage ✓
└── User menu muestra nombre ✓
```

### Error Validación

```
Usuario abre RegisterPage
├── Email inválido
├── Click "Crear Cuenta"
├── Error validación captado
├── parseBackendError convierte a FrontendError
├── UI muestra: "Email inválido"
└── No redirige (esperando corrección)
```

### Error Network con Retry

```
Usuario hace pregunta en FAQPage
├── Backend desconectado
├── API call falla (Network Error)
├── Retry 1: Espera 1500ms → Backend sigue desconectado
├── Retry 2: Espera 3000ms → Backend vuelve
├── Éxito en retry 2
└── Respuesta mostrada (usuario NO ve los reintentos)
```

---

## 🎓 Cómo Funciona (Detrás de Escenas)

### Flujo Normal (SIN error handling antiguo):

```
User → Form Submit
     ↓
Backend Error (500)
     ↓
Fetch falla
     ↓
Catch block
     ↓
err.message = "Error al iniciar sesión"
     ↓
setLocalError(err.message)
     ↓
UI: JSON técnico ❌
```

### Flujo Nuevo (CON error handling):

```
User → Form Submit
     ↓
Backend Error (500)
     ↓
backendApi.login() (con retryAuth)
     ↓
Axios throw AxiosError
     ↓
catch block
     ↓
handleError(err, 'LoginPage')
     ↓
parseBackendError(err)
     ↓
FrontendError {
  userMessage: "Error del servidor, por favor intenta de nuevo"
}
     ↓
error state = FrontendError
     ↓
UI: "⚠️ Error del servidor..." ✅
```

---

## 🔍 Debugging

### Ver logs en tiempo real:

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

**Dev Console (Browser F12):**
```javascript
// Ver último error
localStorage.getItem('lastError')

// Limpiar
localStorage.removeItem('lastError')
```

### Revisar archivos de log (Backend):

```bash
# Si está en DigitalOcean
ssh root@<ip>
tail -f /var/log/app/error.log
tail -f /var/log/app/combined.log
```

---

## 📸 Capturas Esperadas

### ✅ Correcto - Mensaje Amigable

```
┌────────────────────────────────┐
│ 🔴 Bienvenido                  │
│ Inicia sesión en tu cuenta     │
│                                │
│ ⚠️ Email inválido              │
│                                │
│ [Email input field]            │
│ [Password input field]         │
│ [Iniciar Sesión button]        │
└────────────────────────────────┘
```

### ❌ Incorrecto - JSON Técnico

```
┌────────────────────────────────┐
│ 🔴 Bienvenido                  │
│ Inicia sesión en tu cuenta     │
│                                │
│ ⚠️ {"success":false,           │
│    "error":"Error interno...   │
│    "statusCode":500,...        │
│                                │
│ [Email input field]            │
│ [Password input field]         │
│ [Iniciar Sesión button]        │
└────────────────────────────────┘
```

---

## 📝 Notas Finales

- ✅ Todos los archivos fueron actualizados (LoginPage, RegisterPage, backendApi)
- ✅ Frontend compila sin errores (npm run build)
- ✅ ErrorBoundary está integrado en App.tsx
- ✅ Mensajes están en ESPAÑOL
- ✅ Retry logic está activo en endpoints críticos

**¿Siguiente paso?** Ir a FAQPage y hacer una pregunta para ver retry logic en acción.

---

**Versión**: 1.0
**Actualizado**: 11 Nov 2025
**Estado**: ✅ Ready to Deploy
