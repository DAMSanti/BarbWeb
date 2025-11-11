# 🔧 FIX: Empty Reply from Server Error

**Fecha**: Noviembre 11, 2025  
**Estado**: ✅ RESUELTO  
**Commit**: 9cdc0c2  

---

## 🐛 Problema Reportado

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email", "password": "pass123"}'

# Resultado:
# curl: (52) Empty reply from server
```

El servidor Express estaba cerrando la conexión sin enviar una respuesta HTTP válida, lo que indica un crash no manejado.

---

## 🔍 Root Cause

El problema estaba en el **middleware de validación** (`backend/src/middleware/validation.ts`):

### ❌ ANTES (Código con Error)

```typescript
export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync({...})
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        // ❌ PROBLEMA: Lanzar error en un middleware
        // Express NO puede capturarlo sin pasar a next(error)
        throw new ValidationError(message, fields)
      }
      throw error
    }
  }
}
```

**¿Por qué crashea?**

1. El middleware es una función `async` que usa `try/catch`
2. Cuando se lanza un error con `throw`, Express **no lo captura automáticamente**
3. El error viaja hacia arriba en la cadena de promesas
4. Express crashea porque no hay un manejador de errores en promesas no capturadas
5. Resultado: `Empty reply from server` (conexión cerrada sin respuesta)

---

## ✅ Solución

### 1️⃣ Cambiar el Middleware de Validación

Cambiar de `throw error` a `next(error)`:

```typescript
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {  // ✅ Removido 'async'
    try {
      const validated = schema.parse({  // ✅ Cambiar parseAsync() a parse()
        body: req.body,
        query: req.query,
        params: req.params,
      }) as any

      // ... validación exitosa ...
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const fields = formatZodErrors(error).reduce((acc, err) => {
          acc[err.field] = err.message
          return acc
        }, {} as Record<string, string>)

        const message = formatZodErrors(error)
          .map((e) => e.message)
          .join('; ')

        next(new ValidationError(message, fields))  // ✅ Usar next(error)
      } else {
        next(error)  // ✅ Pasar error a Express
      }
    }
  }
}
```

**Cambios clave:**
- ❌ Removido `async` del middleware
- ❌ Cambiar `parseAsync()` a `parse()` (sincrónico)
- ✅ Usar `next(error)` en lugar de `throw error`

### 2️⃣ Verificar que el Error Handler está Correctamente Configurado

El error handler DEBE ser el último middleware y DEBE tener exactamente 4 parámetros:

```typescript
// ✅ CORRECTO
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  errorHandler(error, req, res, next)
})

// ❌ INCORRECTO (no funcionaría)
app.use(errorHandler)  // Falta el wrapper de 4 parámetros
```

**Por qué 4 parámetros?**

Express reconoce una función middleware como "error handler" SOLO si tiene exactamente 4 parámetros. Sin esto, ignora el error y crashea.

---

## 📊 Comparación: Antes vs Después

| Aspecto | ❌ ANTES | ✅ DESPUÉS |
|---------|----------|-----------|
| **Middleware** | `async` con `throw` | Sincrónico con `next(error)` |
| **Método de parse** | `schema.parseAsync()` | `schema.parse()` |
| **Manejo de errores** | `throw new ValidationError()` | `next(new ValidationError())` |
| **Error handler** | `app.use(errorHandler)` | `app.use((err, req, res, next) => ...)` |
| **Resultado** | Crash: Empty reply | ✅ Respuesta HTTP 422 |

---

## 🧪 Test de la Corrección

Después del fix, el mismo curl ahora retorna:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email", "password": "pass123"}'

# ✅ AHORA Retorna:
{
  "success": false,
  "error": "Invalid email",
  "statusCode": 422,
  "timestamp": "2025-11-11T22:30:45.123Z",
  "path": "/auth/login",
  "fields": {
    "body.email": "Invalid email"
  }
}
```

**Validaciones probadas:**

| Test | Entrada | Código | Mensaje |
|------|---------|--------|---------|
| Email inválido | `"invalid-email"` | 422 | `"Invalid email"` |
| Contraseña corta | `"pass123"` (7 chars) | 422 | `"Mínimo 8 caracteres"` |
| Sin mayúsculas | `"password1"` | 422 | `"Debe contener al menos una mayúscula"` |
| Sin números | `"Password"` | 422 | `"Debe contener al menos un número"` |
| ✅ Válida | `"Password123"` | 200 | Login procesado |

---

## 🚀 Cambios Realizados

### Archivos Modificados

1. **`backend/src/middleware/validation.ts`**
   - Removido `async` del middleware
   - Cambiar `parseAsync()` a `parse()`
   - Cambiar `throw` a `next(error)`

2. **`backend/src/index.ts`**
   - Cambiar error handler a formato de 4 parámetros
   - Asegurar que está al final de la cadena de middlewares

### Commit

```
Commit: 9cdc0c2
Message: fix: resolve empty reply from server error in validation middleware - 
         catch errors in next() instead of throwing
Files changed: 2
Insertions: 15
Deletions: 12
```

---

## 📝 Lecciones Aprendidas

### ❌ Anti-pattern (No Hacer)

```typescript
// ❌ Esto no funcionará en middlewares
router.post('/login', validate(LoginSchema), async (req, res) => {
  throw new Error("Esto crashea sin respuesta HTTP")
})

// ❌ Esto tampoco en middlewares de validación
app.use((req, res, next) => {
  throw new ValidationError("Esto también crashea")
})
```

### ✅ Best Practice (Hacer)

```typescript
// ✅ Correcto en middlewares
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body)
    next()
  } catch (error) {
    next(error)  // ✅ Pasar error a Express
  }
}

// ✅ Correcto para async handlers en rutas
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)  // ✅ Capturar promesas
}
```

---

## 🔍 Cómo Debuggear Este Tipo de Errores

Si ves `Empty reply from server` en el futuro:

1. **Revisar logs del backend** - ¿Hay stack trace?
2. **Validar middlewares** - ¿Están usando `next()` correctamente?
3. **Revisar try/catch en middlewares** - ¿Están pasando errores a `next()`?
4. **Verificar error handler** - ¿Tiene 4 parámetros?
5. **Probar en desarrollo** - `npm run dev` y revisar console

---

## ✅ Verificación Post-Despliegue

Después de desplegar en DigitalOcean, validar que funciona:

```bash
# 1. Test validación fallida (422)
curl -X POST https://barbweb.example.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email", "password": "pass123"}'
# Esperado: 422 JSON response

# 2. Test login con contraseña válida pero credenciales inválidas (401)
curl -X POST https://barbweb.example.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "Password123"}'
# Esperado: 401 JSON response

# 3. Revisar logs
ssh root@<app-ip>
tail -f /var/log/app/error.log
```

---

## 📚 Referencias

- [Express Error Handling](https://expressjs.com/en/guide/error-handling.html)
- [Express Middleware](https://expressjs.com/en/guide/using-middleware.html)
- [Zod Documentation](https://zod.dev)
- [Promise Handling in Node.js](https://nodejs.org/en/docs/guides/nodejs-error-handling/)

---

**Status**: ✅ Deployado en master (9cdc0c2)  
**Próxima revisión**: Verificar en DigitalOcean después de que se redeploy automáticamente
