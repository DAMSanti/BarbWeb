# 🧹 CÓDIGO LIMPIO - PLAN DE REFACTORIZACIÓN

## 1. ELIMINAR CÓDIGO VIEJO / MOCKUPS

### Backend
#### ❌ Eliminar
- `GET /auth/debug/config` - Endpoint de debug (línea 330-360 en auth.ts)
  - Razón: No debe existir en producción
  - Riesgo: Security issue - expone configuración

### Frontend
#### ❌ Eliminar
- `server/` folder completo
  - Razón: Es un wrapper legacy para DigitalOcean
  - Reemplazar: Actualizar build config en App Platform
  
- `frontend/src/utils/faqMatcher.ts` - Base de datos local de FAQs
  - Razón: Ya tenemos FAQs en base de datos PostgreSQL
  - Impacto: Usar endpoint `/api/faqs` en lugar

- `CheckoutPage.tsx` - Mockup de pago
  - Razón: Implementaremos Stripe real
  - Transición: Mantener pero marcar como TODO

- `ChessboardBackground.tsx` - Componente no usado en Classic Layout
  - Razón: Solo MinimalistLayout lo usa
  - Verificar: Está realmente en uso

### ⚠️ Revisar (No eliminar aún)
- `TECHNICAL_GUIDE.md` - Tiene patrones sugeridos que no se usan
- `README.md` - Duplicado con información
- `AUTH_SETUP.md` - Viejo, info duplicada en ROADMAP

---

## 2. ERROR HANDLING - ESTRATEGIA COMPLETA

### A. Backend Error Handling

#### 1️⃣ Crear Error Classes (backend/src/utils/errors.ts)
```typescript
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(400, message, 'VALIDATION_ERROR')
  }
}

export class AuthError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'AUTH_ERROR')
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND')
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, message, 'CONFLICT')
  }
}

export class InternalError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super(500, message, 'INTERNAL_ERROR')
  }
}
```

#### 2️⃣ Global Error Handler Middleware (backend/src/middleware/errorHandler.ts)
```typescript
import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../utils/errors'
import { logger } from '../utils/logger'

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  if (err instanceof ApiError) {
    logger.warn(`${err.code}: ${err.message}`)
  } else {
    logger.error('Unexpected error:', err)
  }

  // Respond with error
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      },
    })
  } else {
    res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      },
    })
  }
}
```

#### 3️⃣ Input Validation (backend/src/utils/validation.ts)
```typescript
import { z } from 'zod'
import { ValidationError } from './errors'

export const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be 8+ chars'),
  name: z.string().min(2, 'Name required'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})

export function validateRequest<T>(schema: z.Schema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    const fields: Record<string, string> = {}
    result.error.errors.forEach((err) => {
      fields[err.path.join('.')] = err.message
    })
    throw new ValidationError('Validation failed', fields)
  }
  return result.data
}
```

#### 4️⃣ Logger Service (backend/src/utils/logger.ts)
```typescript
import winston from 'winston'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})
```

#### 5️⃣ Apply to Auth Routes
```typescript
// Antes (sin validación):
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body
  // ...
})

// Después (con validación y manejo de errores):
router.post('/register', async (req, res, next) => {
  try {
    const data = validateRequest(registerSchema, req.body)
    const user = await registerUser(data.email, data.password, data.name)
    res.json({ user, tokens })
  } catch (error) {
    next(error) // Pasa al error handler middleware
  }
})
```

---

### B. Frontend Error Handling

#### 1️⃣ API Error Class (frontend/src/utils/apiError.ts)
```typescript
export interface ApiErrorResponse {
  error: {
    message: string
    code: string
    details?: Record<string, string>
  }
}

export class FrontendApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
    public details?: Record<string, string>
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static fromResponse(response: ApiErrorResponse, statusCode: number): FrontendApiError {
    return new FrontendApiError(
      statusCode,
      response.error.message,
      response.error.code,
      response.error.details
    )
  }
}
```

#### 2️⃣ API Client with Error Handling (frontend/src/services/backendApi.ts)
```typescript
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw FrontendApiError.fromResponse(data, response.status)
    }

    return data
  } catch (error) {
    if (error instanceof FrontendApiError) {
      throw error
    }
    throw new FrontendApiError(
      500,
      'Network error',
      'NETWORK_ERROR'
    )
  }
}

export async function login(email: string, password: string) {
  try {
    return await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  } catch (error) {
    if (error instanceof FrontendApiError) {
      if (error.statusCode === 401) {
        throw new Error('Email o contraseña incorrectos')
      }
    }
    throw error
  }
}
```

#### 3️⃣ Error Boundary Component (frontend/src/components/ErrorBoundary.tsx)
```typescript
import { Component } from 'react'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('Error caught:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="text-red-500" />
            <div>
              <h3 className="font-bold text-red-600">Algo salió mal</h3>
              <p className="text-sm text-red-600">{this.state.error?.message}</p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

#### 4️⃣ Hook para manejo de errores (frontend/src/hooks/useError.ts)
```typescript
import { useState, useCallback } from 'react'
import { FrontendApiError } from '../utils/apiError'

export function useError() {
  const [error, setError] = useState<string | null>(null)

  const handleError = useCallback((err: unknown) => {
    if (err instanceof FrontendApiError) {
      setError(err.message)
    } else if (err instanceof Error) {
      setError(err.message)
    } else {
      setError('An unexpected error occurred')
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return { error, handleError, clearError }
}
```

---

## 3. ORDEN DE IMPLEMENTACIÓN

### Fase 1: Backend (1-2 días)
1. ✅ Crear error classes
2. ✅ Crear logger
3. ✅ Crear validation schemas (Zod)
4. ✅ Implementar error handler middleware
5. ✅ Aplicar a todos los endpoints
6. ✅ Eliminar /debug/config endpoint

### Fase 2: Frontend (1-2 días)
1. ✅ Crear FrontendApiError class
2. ✅ Actualizar backendApi.ts
3. ✅ Crear ErrorBoundary
4. ✅ Crear useError hook
5. ✅ Aplicar a todos los formularios
6. ✅ Mostrar errores user-friendly

### Fase 3: Cleanup (1 día)
1. ✅ Eliminar server/ folder
2. ✅ Migrar faqMatcher a backend
3. ✅ Limpiar documentación duplicada
4. ✅ Remover CheckoutPage mockup (o reescribir)
5. ✅ Revisar componentes no usados

---

## 4. BENEFICIOS

| Área | Antes | Después |
|------|-------|---------|
| **Error Handling** | Ad-hoc | Centralizado |
| **Validación** | Manual | Automática (Zod) |
| **Debugging** | console.log | Logger estructurado |
| **User Messages** | Genéricas | Específicas |
| **Code Size** | +5% | -3% |
| **Maintainability** | Media | Alta |

---

**Recomendación**: Implementar error handling PRIMERO, luego hacer cleanup.

Es más importante tener código robusto que limpio cuando viene la Fase 2 (Pagos).
