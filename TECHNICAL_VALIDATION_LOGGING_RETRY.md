# 📚 GUÍA TÉCNICA: Validación, Logging y Retry Logic

## 1️⃣ VALIDACIÓN DE SCHEMAS: ZOD vs JOI

### 🎯 ¿QUÉ ES UN SCHEMA?

Un schema es una **definición de la estructura esperada** de un objeto (usuario, consulta, pago, etc.)

```typescript
// Sin schema - inseguro ❌
function createUser(data) {
  // ¿Qué propiedades tiene data?
  // ¿Qué tipos son?
  // ¿Están validadas?
  return saveToDatabase(data)
}

// Con schema - seguro ✅
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2)
})

function createUser(data) {
  const validated = userSchema.parse(data) // Valida o lanza error
  return saveToDatabase(validated)
}
```

---

## 📋 ZOD - Validación TypeScript-First

### Qué es
- **Librería de validación** escrita en TypeScript
- **TypeScript-nativa**: Infiere tipos automáticamente desde schemas
- **Segura**: Si valida con Zod, TypeScript lo sabe
- **Pequeña**: ~30KB

### Instalación
```bash
npm install zod
```

### Ejemplo Básico
```typescript
import { z } from 'zod'

// Definir schema
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

// Validar datos
const loginData = { email: 'user@example.com', password: 'password123' }
const result = loginSchema.safeParse(loginData)

if (result.success) {
  console.log(result.data) // ✅ Datos validados
} else {
  console.log(result.error.errors) // ❌ Errores de validación
}
```

### Casos de Uso Avanzados
```typescript
// ✅ Tipos complejos
const consultationSchema = z.object({
  question: z.string().min(10).max(1000),
  category: z.enum(['Civil', 'Penal', 'Laboral', 'Administrativo']),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[0-9]{9,}$/).optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    size: z.number().max(5 * 1024 * 1024), // Max 5MB
    type: z.string().regex(/^image\/(png|jpeg|pdf)$/)
  })).default([])
})

// ✅ Transformaciones
const passwordSchema = z.string()
  .min(8)
  .transform(pwd => pwd.toUpperCase()) // Transformar datos

// ✅ Validación personalizada
const uniqueEmailSchema = z.string().email().refine(
  async (email) => {
    const exists = await db.user.findUnique({ where: { email } })
    return !exists // true = válido, false = ya existe
  },
  { message: 'Email ya registrado' }
)

// ✅ Unión de schemas
const paymentSchema = z.union([
  z.object({ type: z.literal('credit_card'), cardNumber: z.string() }),
  z.object({ type: z.literal('paypal'), email: z.string().email() }),
  z.object({ type: z.literal('bitcoin'), address: z.string() })
])
```

### ✅ PROS de ZOD
- **TypeScript puro**: Tipado automático
- **Errores claros**: Mensajes de error detallados
- **Composición**: Combinar schemas fácilmente
- **Transformaciones**: Modificar datos durante validación
- **Pequeño**: Buena para frontend
- **Sin dependencias**: Independiente

### ❌ CONTRAS de ZOD
- **Más nuevo**: Menos adopción que Joi
- **Documentación**: Menos ejemplos online
- **Performance**: Ligeramente más lento en validaciones complejas
- **No tiene plugins**: Menos extensible que Joi

---

## 🎯 JOI - Validación Enterprise

### Qué es
- **Librería de validación** más madura y enterprise
- **Escrita en JavaScript**: Puede ser más flexible
- **Rica en características**: Muchas opciones de validación
- **Grande**: ~300KB

### Instalación
```bash
npm install joi
```

### Ejemplo Básico
```typescript
import Joi from 'joi'

// Definir schema
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email debe ser válido'
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Contraseña mínimo 8 caracteres'
  })
})

// Validar datos
const { error, value } = loginSchema.validate(
  { email: 'user@example.com', password: 'password123' },
  { abortEarly: false } // Retorna TODOS los errores
)

if (error) {
  console.log(error.details) // Todos los errores
} else {
  console.log(value) // Datos validados
}
```

### Casos de Uso Avanzados
```typescript
// ✅ Condicionales
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string().valid('admin', 'user', 'lawyer').required(),
  permissions: Joi.when('role', {
    is: 'admin',
    then: Joi.array().items(Joi.string()).required(),
    otherwise: Joi.forbidden() // Si no es admin, no puede tener permissions
  })
})

// ✅ Referencias entre campos
const passwordChangeSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    .messages({ 'any.only': 'Las contraseñas no coinciden' })
})

// ✅ Funciones de validación personalizadas
const phoneSchema = Joi.object({
  country: Joi.string().valid('ES', 'MX', 'AR'),
  number: Joi.string().custom((value, helpers) => {
    const patterns = {
      'ES': /^(?:\+34|0034|0)?[6789]\d{8}$/,
      'MX': /^(?:\+52)?[0-9]{10}$/,
      'AR': /^(?:\+54)?[0-9]{10}$/
    }
    if (!patterns[helpers.state.ancestors[0].country].test(value)) {
      return helpers.error('any.invalid')
    }
  })
})

// ✅ Validación asíncrona (única consulta DB)
const uniqueEmailSchema = Joi.object({
  email: Joi.string().email().required()
    .external(async (value) => {
      const exists = await db.user.findUnique({ where: { email: value } })
      if (exists) {
        throw new Error('Email ya registrado')
      }
    })
})
```

### ✅ PROS de JOI
- **Maduro y estable**: Usado en producción desde hace años
- **Muy completo**: Casos de uso complejos
- **Excelente documentación**: Muchos ejemplos
- **Condicionales**: `when()` es muy poderoso
- **Mensajes personalizados**: Control total
- **Plugins**: Ecosistema de extensiones

### ❌ CONTRAS de JOI
- **TypeScript débil**: Inferencia de tipos limitada
- **Grande**: ~300KB (más peso)
- **Curva de aprendizaje**: Sintaxis más compleja
- **Performance**: Un poco más lento

---

## 🆚 COMPARATIVA ZOD vs JOI

| Característica | ZOD | JOI |
|---|---|---|
| **TypeScript** | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Tamaño** | ~30KB | ~300KB |
| **Frontend-friendly** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Enterprise** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Condicionales** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Documentación** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Comunidad** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Mensajes Error** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## 🎯 RECOMENDACIÓN PARA BARBWEB

**USA ZOD** porque:
- ✅ TypeScript puro (tu proyecto es 100% TypeScript)
- ✅ Pequeño (bueno para frontend y backend)
- ✅ Errores claros (perfectos para UX)
- ✅ Transformaciones automáticas
- ✅ Menos curva de aprendizaje

---

## 2️⃣ WINSTON - Logger Profesional

### ¿QUÉ ES UN LOGGER?

Un logger registra lo que sucede en tu aplicación:

```typescript
// Sin logger - imposible debuggear ❌
function processPayment(orderId) {
  const order = getOrder(orderId)
  const result = stripe.charge(order.amount)
  // ¿Qué pasó? ¿Por qué falló?
  return result
}

// Con logger - transparent ✅
function processPayment(orderId) {
  logger.info(`Payment initiated for order ${orderId}`)
  const order = getOrder(orderId)
  logger.debug(`Order data: ${JSON.stringify(order)}`)
  
  const result = stripe.charge(order.amount)
  
  if (result.success) {
    logger.info(`Payment successful for order ${orderId}`)
  } else {
    logger.error(`Payment failed: ${result.error}`)
  }
  return result
}
```

### Instalación
```bash
npm install winston
```

### Configuración Básica
```typescript
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    // ✅ Mostrar en consola
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // ✅ Guardar errores en archivo
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    // ✅ Guardar todo en archivo
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
})

export default logger
```

### Niveles de Log
```typescript
logger.error('Error crítico')      // 🔴 Errores graves
logger.warn('Advertencia')         // 🟡 Cosas que preocupan
logger.info('Información')         // 🔵 Eventos importantes
logger.http('HTTP request')        // 📡 Requests HTTP
logger.debug('Debug info')         // 🟢 Información de debug
logger.silly('Detalles')           // ⚪ Detalles muy detallados
```

### Casos de Uso en BarbWeb
```typescript
// ✅ Login
logger.info(`User login attempt: ${email}`)

// ❌ Login fallido
logger.warn(`Failed login for email: ${email} - Invalid credentials`)

// ✅ Pago procesado
logger.info(`Payment processed: Order ${orderId}, Amount: $${amount}`)

// ❌ Error en IA
logger.error(`Gemini API error: ${error.message}`, { orderId, questionId })

// 🔍 Debug: Categoría detectada
logger.debug(`Question category detected: ${category} (confidence: ${confidence})`)
```

### Formato Personalizado
```typescript
const logger = winston.createLogger({
  format: winston.format.combine(
    // 📅 Agregar timestamp
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    // 📝 Colorear por nivel
    winston.format.colorize(),
    // ✅ Formato personalizado
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      let metaStr = ''
      if (Object.keys(meta).length > 0) {
        metaStr = JSON.stringify(meta)
      }
      return `${timestamp} [${level}]: ${message} ${metaStr}`
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log' })
  ]
})

// Output:
// 2025-11-11 14:30:45 [info]: User registered userId="123" email="user@example.com"
```

### ✅ PROS de WINSTON
- **Standard industria**: Usado en empresas grandes
- **Flexible**: Múltiples transportes (console, file, HTTP, DB)
- **Niveles personalizados**: Configurable
- **Rendimiento**: Optimizado para logs en producción
- **Metadatos**: Adjuntar información extra a los logs

### ❌ CONTRAS de WINSTON
- **Configuración verbosa**: Necesita más líneas de código
- **Curva de aprendizaje**: Muchas opciones
- **Performance**: Un poco lento si generas muchos logs

---

## 3️⃣ RETRY LOGIC - Reintentar Consultas IA

### ¿POR QUÉ RETRY LOGIC?

Cuando llamamos a Gemini API o cualquier servicio externo, puede fallar por:
- 🌐 Problemas de red (timeout)
- 🔌 API temporal no disponible
- 📊 Rate limiting (demasiadas requests)
- ⚠️ Error temporal que se auto-resuelve

Sin retry logic:

```typescript
// ❌ Una falla = todo falla
async function askQuestion(question: string) {
  try {
    const response = await gemini.generateContent(question)
    return response
  } catch (error) {
    // 💥 Falla completamente, usuario ve error
    throw error
  }
}

// Usuario hace pregunta → Error en Gemini → Usuario ve "Error 500" ❌
```

Con retry logic:

```typescript
// ✅ Reintentar automáticamente
async function askQuestion(question: string) {
  return retry(
    () => gemini.generateContent(question),
    { maxRetries: 3, delay: 1000 }
  )
}

// Usuario hace pregunta → Error en Gemini → Reintentar 2 veces → Funciona ✅
```

### Implementación Básica
```typescript
interface RetryOptions {
  maxRetries: number        // ¿Cuántos intentos máximo?
  delay: number             // ¿Cuánto esperar entre intentos? (ms)
  backoff?: 'linear' | 'exponential' // ¿Aumentar espera?
  onRetry?: (attempt: number, error: Error) => void
}

async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt < options.maxRetries) {
        // Calcular espera
        const wait = options.backoff === 'exponential'
          ? options.delay * Math.pow(2, attempt - 1)
          : options.delay

        logger.warn(`Retry attempt ${attempt}/${options.maxRetries} after ${wait}ms`, { error: lastError.message })
        
        if (options.onRetry) {
          options.onRetry(attempt, lastError)
        }

        // Esperar antes de reintentar
        await new Promise(resolve => setTimeout(resolve, wait))
      }
    }
  }

  throw lastError
}
```

### Ejemplo en BarbWeb
```typescript
async function askQuestion(question: string, category: string) {
  logger.info(`Question received: "${question}" category: ${category}`)

  const response = await retry(
    () => gemini.generateContent(question),
    {
      maxRetries: 3,
      delay: 1000,
      backoff: 'exponential', // 1s → 2s → 4s
      onRetry: (attempt, error) => {
        logger.warn(`Gemini retry ${attempt}: ${error.message}`)
      }
    }
  )

  logger.info(`Question processed successfully`, { category, confidence: response.confidence })
  return response
}

// Timeline:
// 14:30:00 - Question received
// 14:30:00 - First attempt FAILS (timeout)
// 14:30:01 - Wait 1s + Retry attempt 1
// 14:30:02 - Retry 1 FAILS (service unavailable)
// 14:30:04 - Wait 2s + Retry attempt 2
// 14:30:06 - Retry 2 SUCCESS ✅
```

### Estrategias de Retry

#### 1️⃣ Linear Backoff
```
Intento 1: Inmediato
Intento 2: Esperar 1s
Intento 3: Esperar 1s
Intento 4: Esperar 1s
```

#### 2️⃣ Exponential Backoff (RECOMENDADO)
```
Intento 1: Inmediato
Intento 2: Esperar 1s (2^0 * 1000ms)
Intento 3: Esperar 2s (2^1 * 1000ms)
Intento 4: Esperar 4s (2^2 * 1000ms)
```

#### 3️⃣ Exponential Backoff con Jitter (MEJOR)
```typescript
const jitter = Math.random() * 0.1 // +/- 10%
const wait = baseDelay * Math.pow(2, attempt) * (1 + jitter)
```

Evita "thundering herd" (todos reintentan al mismo tiempo)

### ¿CUÁNDO NO HACER RETRY?

```typescript
// ❌ NO reintentar errores de validación
if (error.statusCode === 400) {
  logger.error('Validation error - no retry', { error })
  throw error
}

// ❌ NO reintentar errores de autenticación
if (error.statusCode === 401) {
  logger.error('Auth error - no retry', { error })
  throw error
}

// ✅ SÍ reintentar errores temporales
if (error.statusCode === 429 || error.statusCode === 503) {
  logger.warn('Temporary error - will retry', { error })
  // retry...
}
```

---

## 🎯 IMPLEMENTACIÓN EN BARBWEB

### Backend (backend/src/utils/retry.ts)
```typescript
import logger from './logger'

interface RetryOptions {
  maxRetries: number
  delay: number
  backoff?: 'linear' | 'exponential'
  onRetry?: (attempt: number, error: Error) => void
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = { maxRetries: 3, delay: 1000, backoff: 'exponential' }
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // No reintentar ciertos errores
      if ((error as any).statusCode === 400 || (error as any).statusCode === 401) {
        throw error
      }

      if (attempt < options.maxRetries) {
        const wait = options.backoff === 'exponential'
          ? options.delay * Math.pow(2, attempt - 1)
          : options.delay

        logger.warn(`Attempt ${attempt}/${options.maxRetries} failed, retrying in ${wait}ms`, {
          error: lastError.message
        })

        if (options.onRetry) {
          options.onRetry(attempt, lastError)
        }

        await new Promise(resolve => setTimeout(resolve, wait))
      }
    }
  }

  logger.error(`All ${options.maxRetries} attempts failed`, { error: lastError?.message })
  throw lastError
}
```

### Usar en API
```typescript
import { retry } from '../utils/retry'
import { generateWithGemini } from '../services/openaiService'

router.post('/api/ask', async (req, res) => {
  const { question } = req.body

  try {
    const response = await retry(
      () => generateWithGemini(question),
      {
        maxRetries: 3,
        delay: 1000,
        backoff: 'exponential'
      }
    )

    res.json(response)
  } catch (error) {
    res.status(500).json({ error: 'Could not process question after retries' })
  }
})
```

---

## 📊 RESUMEN

| Concepto | Propósito | Cuándo usar |
|---|---|---|
| **ZOD** | Validar datos | Siempre - en todo formulario/API |
| **WINSTON** | Registrar eventos | Siempre - en producción |
| **RETRY** | Reintentar fallos | Servicios externos (IA, pagos) |

