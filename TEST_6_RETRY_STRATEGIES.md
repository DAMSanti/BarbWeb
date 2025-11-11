# 🧪 TEST 6: Retry Strategies - Guía de Testing Simplificada

**Objetivo**: Verificar que las tres estrategias de retry funcionan correctamente
**Tiempo Estimado**: 30-45 minutos
**Complejidad**: Media
**Estado**: ⏳ LISTO PARA EJECUTAR

---

## 📋 Resumen de Estrategias de Retry

### retryAuth (Usado en Login/Register)
```typescript
// backend/src/utils/retry.ts
export const retryAuth = retryAsync({
  maxRetries: 2,
  initialDelayMs: 500,
  backoffMultiplier: 1.5,
  shouldRetry: (error) => 
    error.response?.status >= 500 || 
    error.code === 'ECONNREFUSED' ||
    error.code === 'ETIMEDOUT'
})
```

**Expectativas**:
- 2 intentos máximo
- Delay: 500ms (1er reintento) → 750ms (2do reintento)
- Reintenta: 5xx, ECONNREFUSED, ETIMEDOUT
- NO reintenta: 4xx errors

### retryAI (Usado en FAQPage)
```typescript
export const retryAI = retryAsync({
  maxRetries: 3,
  initialDelayMs: 1500,
  backoffMultiplier: 2,
  shouldRetry: (error) => 
    error.response?.status >= 500 || 
    error.code === 'ECONNREFUSED' ||
    error.code === 'ETIMEDOUT'
})
```

**Expectativas**:
- 3 intentos máximo
- Delay: 1500ms (1er) → 3000ms (2do) → 6000ms (3er)
- Reintenta: 5xx, ECONNREFUSED, ETIMEDOUT
- NO reintenta: 4xx errors

### retryAsync (Estrategia genérica)
```typescript
export const retryAsync = ({
  maxRetries = 3,
  initialDelayMs = 1000,
  backoffMultiplier = 2,
  shouldRetry = () => true
}) => {
  // Reintenta hasta maxRetries veces con exponential backoff
}
```

---

## 🧪 TEST 6A: retryAuth (2x, 500ms)

### Paso 1: Preparar el entorno

**Terminal 1** - Backend:
```powershell
cd g:\Webs\BarbWeb\backend
node --loader ts-node/esm src/index.ts
# Debe estar corriendo en localhost:3000
```

**Terminal 2** - Frontend:
```powershell
cd g:\Webs\BarbWeb\frontend
npm run dev
# Debe estar corriendo en localhost:5173
```

**Terminal 3** - Abrir navegador:
```
http://localhost:5173/barbweb2/login
```

### Paso 2: Abrir DevTools

```
F12 → Console → Filtrar: "Retrying" o "retry"
```

### Paso 3: Simular error temporal

**Option A - Manera fácil: Pausar el backend**
```powershell
# En Terminal 1 donde corre el backend:
Ctrl+C
# Backend está OFFLINE ahora
```

### Paso 4: Intentar login

En el navegador (localhost:5173/barbweb2/login):
```
Email: test@test.com
Password: Test1234!
Click "Iniciar Sesión"
```

### Paso 5: Observar reintentos en Console

**Esperado en Console**:
```
[DEBUG] Intento 1 de 2 falló. Reintentando en 500ms...
(espera ~500ms)
[DEBUG] Intento 2 de 2 falló. Reintentando en 750ms...
(espera ~750ms)
[ERROR] Todos los intentos fallaron
```

### Paso 6: Recuperación

**En Terminal 1**:
```powershell
# Reinicia el backend
node --loader ts-node/esm src/index.ts
```

### Paso 7: Reintenta login en navegador

```
Email: test@test.com
Password: Test1234!
Click "Iniciar Sesión"
```

**Esperado**:
- ✅ Login exitoso después del reintento automático
- ✅ Usuario vuelve a HomePage
- ✅ User menu muestra email/nombre

### ✅ TEST 6A Resultado

**PASS si**:
- [x] Se ve "Intento 1 de 2" en console
- [x] Se ve "Intento 2 de 2" en console
- [x] Login funciona después de reiniciar backend
- [x] Delays aproximados: 500ms + 750ms

**FAIL si**:
- [x] No hay logs de reintento
- [x] Login falla aunque backend esté corriendo
- [x] Solo intenta 1 vez (no reintentos)

---

## 🧪 TEST 6B: retryAI (3x, 1500ms)

### Paso 1: Preparar el entorno

**Mismo setup que TEST 6A**
```
Backend: localhost:3000 ✅
Frontend: localhost:5173 ✅
DevTools: F12 → Console abierta ✅
```

### Paso 2: Ir a FAQPage

```
http://localhost:5173/barbweb2/faq
```

### Paso 3: Detener el backend

```powershell
# En Terminal donde corre backend:
Ctrl+C
# Backend está OFFLINE
```

### Paso 4: Hacer una pregunta

En el formulario de FAQPage:
```
Pregunta: "¿Cuáles son mis derechos en un despido injustificado?"
Click "Buscar"
```

### Paso 5: Observar reintentos

**Esperado en Console**:
```
[DEBUG] Intento 1 de 3 falló. Reintentando en 1500ms...
(espera ~1500ms)
[DEBUG] Intento 2 de 3 falló. Reintentando en 3000ms...
(espera ~3000ms)
[DEBUG] Intento 3 de 3 falló. Reintentando en 6000ms...
(espera ~6000ms)
[ERROR] Todos los intentos fallaron
```

**Total time**: ~10.5 segundos (1500 + 3000 + 6000 = 10500ms)

### Paso 6: Recuperación durante reintentos

**Opción A - Recuperación antes del 3er intento**:

```powershell
# En Terminal, después de ~5 segundos (durante el 2do reintento):
node --loader ts-node/esm src/index.ts
# Backend vuelve a estar online
```

**Esperado**:
- ✅ Si backend se recupera ANTES del 3er fallo, el 3er intento FUNCIONA
- ✅ Usuario ve respuesta de IA exitosamente
- ✅ Console muestra "Success on attempt 3" o similar

### Paso 7: Alternativa - Dejar fallar todos los intentos

```powershell
# NO reinicies backend, deja que falle completamente
```

**Esperado después de ~10.5s**:
```
[ERROR] Todos los intentos fallaron (3/3)
UI: Muestra mensaje: "Error de conexión"
UI: Fallback a local FAQ data visible
```

### ✅ TEST 6B Resultado

**PASS si**:
- [x] Se ve "Intento 1 de 3" en console
- [x] Se ve "Intento 2 de 3" en console  
- [x] Se ve "Intento 3 de 3" en console
- [x] Delays aproximados: 1500ms → 3000ms → 6000ms
- [x] Si backend se recupera, 3er intento funciona
- [x] Si todos fallan, ve "Error de conexión" en UI

**FAIL si**:
- [x] No hay logs de reintentos
- [x] Solo intenta 1 vez
- [x] Delays no coinciden (ej: mismo delay siempre)

---

## 🧪 TEST 6C: NO reintenta errores 4xx

### Paso 1: Preparar el entorno

```
Backend: localhost:3000 ✅ (corriendo normalmente)
Frontend: localhost:5173 ✅
DevTools: F12 → Console abierta
```

### Paso 2: Ir a LoginPage

```
http://localhost:5173/barbweb2/login
```

### Paso 3: Intentar login con credenciales inválidas

```
Email: invalid@email
Password: 123
Click "Iniciar Sesión"
```

### Paso 4: Verificar que NO reintentos

**Esperado en Console** (INMEDIATO, sin reintentos):
```
[ERROR] Email inválido
```

**NO esperado** (esto sería un FAIL):
```
[DEBUG] Intento 1 de 2 falló...
```

### Paso 5: Intentar con email válido pero password incorrecto

```
Email: test@test.com
Password: wrongpassword123
Click "Iniciar Sesión"
```

**Esperado en Console** (INMEDIATO):
```
[ERROR] Email o contraseña incorrectos
```

**NO reintentos** - Error 401 → NO reintenta

### Paso 6: Intentar register con email duplicado (409 error)

```
Ir a: http://localhost:5173/barbweb2/register

Email: test@test.com (email que ya existe)
Password: Test1234!
Nombre: John Doe
Click "Crear Cuenta"
```

**Esperado en Console** (INMEDIATO):
```
[ERROR] Este email ya está registrado
```

**NO reintentos** - Error 409 → NO reintenta

### ✅ TEST 6C Resultado

**PASS si**:
- [x] Errores 4xx (400, 401, 409, 422) aparecen INMEDIATAMENTE
- [x] NO hay logs de "Intento X de Y"
- [x] Mensajes de error en UI aparecen al instante
- [x] Comportamiento consistente para todos los 4xx

**FAIL si**:
- [x] Hay reintentos después de errores 4xx
- [x] Retardo innecesario antes del mensaje de error
- [x] Console muestra "Retrying" después de error 401/409/422

---

## 📊 Checklist Completo - TEST 6 (Retry Strategies)

### TEST 6A: retryAuth
- [ ] Backend pausable/reiniciable sin problemas
- [ ] 2 reintentos ejecutados
- [ ] Delays: 500ms + 750ms
- [ ] Login funciona después de recuperación
- [ ] Logs visibles en console

### TEST 6B: retryAI
- [ ] 3 reintentos ejecutados
- [ ] Delays: 1500ms + 3000ms + 6000ms
- [ ] Total time ~10.5 segundos
- [ ] Recuperación durante reintento funciona
- [ ] Fallback a local FAQ visible si falla completamente

### TEST 6C: NO 4xx
- [ ] Email inválido: FAIL inmediato (sin reintento)
- [ ] Credenciales incorrectas: FAIL inmediato (401, sin reintento)
- [ ] Email duplicado: FAIL inmediato (409, sin reintento)
- [ ] Validación fallida: FAIL inmediato (422, sin reintento)

---

## 🎯 Resumen Rápido

| Test | Estrategia | Max Intentos | Delays | Esperado |
|------|-----------|--------------|--------|----------|
| 6A | retryAuth | 2 | 500ms → 750ms | Login exitoso tras recuperación |
| 6B | retryAI | 3 | 1500ms → 3000ms → 6000ms | Respuesta IA o fallback local |
| 6C | No 4xx | N/A | N/A | Error inmediato, sin reintento |

---

## 💡 Troubleshooting

### Si no ves logs de reintento:
```javascript
// En console:
localStorage.setItem('DEBUG', 'true')
// Luego recarga la página
window.location.reload()
```

### Si los delays no son correctos:
```javascript
// Verificar que retry.ts tiene el backoffMultiplier correcto:
// retryAuth: 1.5
// retryAI: 2
```

### Si retrying errores 4xx:
```typescript
// Verificar que shouldRetry está correcto en retry.ts:
shouldRetry: (error) => 
  error.response?.status >= 500 ||  // Solo 5xx
  error.code === 'ECONNREFUSED' ||  // Network
  error.code === 'ETIMEDOUT'        // Timeout
// NO debe reintentrar si status < 500
```

---

## ✅ Próximos Pasos

1. ✅ Ejecutar TEST 6A, 6B, 6C
2. ✅ Documentar resultados en ROADMAP
3. ✅ Comenzar TEST 8 (E2E) si todos pasan
4. ✅ Ir a FASE 2: Integración Stripe

**Tiempo Total Estimado**: 45 minutos
**Dificultad**: Media
**Estado**: 🟢 LISTO PARA EJECUTAR

