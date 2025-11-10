# 🔧 GUÍA TÉCNICA DE IMPLEMENTACIÓN
## Detalles de Arquitectura y Decisiones

---

## 1. ARQUITECTURA BASE DE DATOS

### Diagrama Entidad-Relación

```
┌─────────────────┐
│      Users      │
├─────────────────┤
│ id (PK)         │
│ email (UNIQUE)  │
│ password_hash   │
│ name            │
│ role            │──────┐
│ verified        │      │
│ created_at      │      │
│ updated_at      │      │
└─────────────────┘      │
        ▲                │
        │                │
        │          ┌─────────────────────────┐
        │          │   Consultations         │
        │          ├─────────────────────────┤
        │          │ id (PK)                 │
        │          │ user_id (FK) ──────────┼──> Users
        │          │ question                │
        │          │ category                │
        │          │ response                │
        │          │ status                  │
        │          │ estimated_response_time │
        │          │ created_at              │
        │          │ updated_at              │
        │          └──────┬──────────────────┘
        │                 │
        │                 └──────┐
        │                        │
        │                 ┌──────────────────┐
        │                 │    Payments      │
        │                 ├──────────────────┤
        │                 │ id (PK)          │
        │                 │ consultation_id  │
        │                 │ (FK)  ──────┘
        │                 │ user_id (FK)────┼──> Users
        │                 │ stripe_session_id
        │                 │ amount           │
        │                 │ status           │
        │                 │ receipt_url      │
        │                 │ created_at       │
        │                 └──────────────────┘
        │
        └─────────────────┐
                          │
                   ┌──────────────────┐
                   │    Responses     │ (Opcional)
                   ├──────────────────┤
                   │ id (PK)          │
                   │ consultation_id  │
                   │ (FK)  ──────┘
                   │ lawyer_id (FK)───┼──> Users
                   │ response_text    │
                   │ attachments      │
                   │ created_at       │
                   └──────────────────┘
```

### Schema Prisma Completo

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id                String            @id @default(cuid())
  email             String            @unique
  passwordHash      String
  name              String
  role              Role              @default(USER) // USER | LAWYER | ADMIN
  profileImage      String?
  isEmailVerified   Boolean           @default(false)
  emailVerificationToken String?
  passwordResetToken String?
  lastLogin         DateTime?
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  // Relations
  consultations     Consultation[]
  payments          Payment[]
  responses         Response[]

  @@index([email])
  @@map("users")
}

enum Role {
  USER
  LAWYER
  ADMIN
}

enum ConsultationStatus {
  PENDING      // En espera de respuesta
  IN_PROGRESS  // Un abogado está trabajando
  COMPLETED    // Respondida
  ARCHIVED     // Archivada por usuario
}

model Consultation {
  id                    String            @id @default(cuid())
  userId                String
  user                  User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  question              String            @db.Text
  category              String
  briefAnswer           String?           @db.Text
  detailedResponse      String?           @db.Text
  
  status                ConsultationStatus @default(PENDING)
  isPaid                Boolean           @default(false)
  price                 Float             @default(29.99)
  
  confidence            Float?            // 0-1 de la IA
  complexity            String?           // simple | medium | complex
  needsProfessional     Boolean           @default(true)
  
  lawyerId              String?           // ID del abogado asignado
  assignedAt            DateTime?
  completedAt           DateTime?
  
  metadata              Json?             // Datos adicionales
  
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt
  
  // Relations
  payments              Payment[]
  responses             Response[]

  @@index([userId])
  @@index([status])
  @@index([category])
  @@index([createdAt])
  @@map("consultations")
}

enum PaymentStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
  REFUNDED
}

model Payment {
  id                    String            @id @default(cuid())
  userId                String
  user                  User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  consultationId        String
  consultation          Consultation      @relation(fields: [consultationId], references: [id], onDelete: Cascade)
  
  stripeSessionId       String            @unique
  stripePaymentIntentId String?           @unique
  
  amount                Float
  currency              String            @default("USD")
  status                PaymentStatus     @default(PENDING)
  
  receiptUrl            String?
  refundedAt            DateTime?
  refundReason          String?
  
  metadata              Json?
  
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt

  @@index([userId])
  @@index([stripeSessionId])
  @@index([status])
  @@map("payments")
}

model Response {
  id                    String            @id @default(cuid())
  consultationId        String
  consultation          Consultation      @relation(fields: [consultationId], references: [id], onDelete: Cascade)
  
  lawyerId              String
  lawyer                User              @relation(fields: [lawyerId], references: [id])
  
  responseText          String            @db.Text
  attachments           String[]          // URLs o file paths
  
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt

  @@index([consultationId])
  @@index([lawyerId])
  @@map("responses")
}

model FAQ {
  id                    String            @id @default(cuid())
  category              String
  question              String            @db.Text
  answer                String            @db.Text
  keywords              String[]
  
  views                 Int               @default(0)
  helpful               Int               @default(0)
  notHelpful            Int               @default(0)
  
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt

  @@index([category])
  @@fulltext([question, answer])
  @@map("faqs")
}
```

---

## 2. ESTRUCTURA DE CARPETAS SUGERIDA

```
barbweb/
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── auth/
│       │   │   ├── LoginPage.tsx
│       │   │   ├── RegisterPage.tsx
│       │   │   └── ForgotPasswordPage.tsx
│       │   ├── admin/
│       │   │   ├── AdminDashboard.tsx
│       │   │   ├── ConsultationsManager.tsx
│       │   │   ├── ConsultationDetail.tsx
│       │   │   ├── UserManagement.tsx
│       │   │   └── AnalyticsPage.tsx
│       │   ├── HomePage.tsx
│       │   ├── FAQPage.tsx
│       │   └── CheckoutPage.tsx
│       ├── components/
│       │   ├── auth/
│       │   │   ├── LoginForm.tsx
│       │   │   └── RegisterForm.tsx
│       │   ├── admin/
│       │   │   ├── AdminLayout.tsx
│       │   │   ├── AdminSidebar.tsx
│       │   │   ├── StatsCard.tsx
│       │   │   ├── ConsultationTable.tsx
│       │   │   └── ResponseForm.tsx
│       │   ├── common/
│       │   │   ├── Header.tsx
│       │   │   ├── Footer.tsx
│       │   │   ├── ProtectedRoute.tsx
│       │   │   └── Loading.tsx
│       │   └── ...
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useUser.ts
│       │   ├── useConsultations.ts
│       │   └── useAdmin.ts
│       ├── services/
│       │   ├── api.ts
│       │   ├── authService.ts
│       │   ├── consultationService.ts
│       │   └── paymentService.ts
│       ├── store/
│       │   ├── appStore.ts
│       │   ├── authStore.ts
│       │   └── consultationStore.ts
│       ├── utils/
│       │   ├── seo.ts
│       │   ├── validation.ts
│       │   └── formatters.ts
│       └── types/
│           └── index.ts
│
├── backend/
│   └── src/
│       ├── controllers/
│       │   ├── authController.ts
│       │   ├── consultationController.ts
│       │   ├── paymentController.ts
│       │   └── adminController.ts
│       ├── services/
│       │   ├── authService.ts
│       │   ├── emailService.ts
│       │   ├── stripeService.ts
│       │   ├── aiService.ts
│       │   └── consultationService.ts
│       ├── middleware/
│       │   ├── auth.ts
│       │   ├── authorization.ts
│       │   ├── errorHandler.ts
│       │   └── validation.ts
│       ├── routes/
│       │   ├── auth.ts
│       │   ├── consultations.ts
│       │   ├── payments.ts
│       │   ├── admin.ts
│       │   └── webhooks.ts
│       ├── utils/
│       │   ├── logger.ts
│       │   ├── email.ts
│       │   └── validators.ts
│       ├── types/
│       │   └── index.ts
│       ├── database/
│       │   └── connection.ts
│       └── index.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
└── docs/
    ├── API.md
    ├── DEPLOYMENT.md
    └── CONTRIBUTING.md
```

---

## 3. PATRONES DE CODIFICACIÓN

### 3.1 Backend Services

```typescript
// Patrón: Business Logic en Services
// backend/src/services/consultationService.ts

import { prisma } from '@/database/connection'
import { aiService } from './aiService'
import { emailService } from './emailService'

export class ConsultationService {
  async createConsultation(userId: string, question: string) {
    // 1. Validar entrada
    if (!question?.trim()) {
      throw new Error('Question is required')
    }

    // 2. Llamar IA
    const aiResult = await aiService.analyzeQuestion(question)

    // 3. Guardar en BD
    const consultation = await prisma.consultation.create({
      data: {
        userId,
        question,
        category: aiResult.category,
        briefAnswer: aiResult.briefAnswer,
        confidence: aiResult.confidence,
        complexity: aiResult.complexity,
        needsProfessional: aiResult.needsProfessional,
        status: aiResult.needsProfessional ? 'PENDING' : 'COMPLETED',
      },
    })

    // 4. Enviar email
    await emailService.sendConsultationConfirmation(userId, consultation)

    return consultation
  }

  async markAsPaid(consultationId: string) {
    return prisma.consultation.update({
      where: { id: consultationId },
      data: { isPaid: true },
    })
  }
}

export const consultationService = new ConsultationService()
```

### 3.2 Frontend Custom Hooks

```typescript
// frontend/src/hooks/useConsultations.ts

import { useQuery, useMutation } from '@tanstack/react-query'
import { consultationService } from '@/services/consultationService'

export function useConsultations(userId: string) {
  // Listar
  const query = useQuery({
    queryKey: ['consultations', userId],
    queryFn: () => consultationService.getConsultations(userId),
  })

  // Crear
  const createMutation = useMutation({
    mutationFn: (question: string) =>
      consultationService.createConsultation(question),
    onSuccess: () => {
      query.refetch()
    },
  })

  return { ...query, createMutation }
}

// Uso en componentes
export function ConsultationsPage() {
  const { data, createMutation } = useConsultations(userId)

  return (
    <div>
      {data?.map(c => <ConsultationCard key={c.id} consultation={c} />)}
      <button onClick={() => createMutation.mutate('Mi pregunta')}>
        Crear
      </button>
    </div>
  )
}
```

---

## 4. MIGRACIONES INCREMENTALES

### 4.1 Plan de Migración de Datos

```typescript
// backend/prisma/migrations/001_initial_schema.sql
-- Ejecutar después de configurar PostgreSQL

CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER',
  is_email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);

-- Más tablas...
```

### 4.2 Seed de FAQs

```typescript
// backend/prisma/seed.ts

import { prisma } from '@/database/connection'

async function main() {
  await prisma.fAQ.createMany({
    data: [
      {
        category: 'Civil',
        question: '¿Cómo puedo reclamar daños y perjuicios?',
        answer: '...',
        keywords: ['daños', 'perjuicios', 'reclamación'],
      },
      // Más FAQs...
    ],
  })
}

main()
  .catch(console.error)
  .finally(() => process.exit(0))
```

---

## 5. CONFIGURACIÓN DE STRIPE

### 5.1 Ambiente de Prueba

```bash
# En .env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# En .env.local (Frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 5.2 Webhook Handler

```typescript
// backend/src/routes/webhooks.ts

import Stripe from 'stripe'
import { prisma } from '@/database/connection'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

router.post('/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature']

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      
      await prisma.payment.update({
        where: { stripePaymentIntentId: paymentIntent.id },
        data: { status: 'SUCCEEDED' },
      })

      const payment = await prisma.payment.findUnique({
        where: { stripePaymentIntentId: paymentIntent.id },
      })

      await prisma.consultation.update({
        where: { id: payment!.consultationId },
        data: { isPaid: true, status: 'PENDING' },
      })

      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      
      await prisma.payment.update({
        where: { stripePaymentIntentId: paymentIntent.id },
        data: { status: 'FAILED' },
      })
      break
    }
  }

  res.json({received: true})
})
```

---

## 6. TESTING STRATEGY

### 6.1 Backend Tests

```typescript
// backend/src/services/__tests__/consultationService.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { consultationService } from '@/services/consultationService'
import { prisma } from '@/database/connection'
import * as aiService from '@/services/aiService'

vi.mock('@/database/connection')
vi.mock('@/services/aiService')

describe('ConsultationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create consultation with AI analysis', async () => {
    const mockAIResult = {
      category: 'Civil',
      briefAnswer: 'Test answer',
      confidence: 0.9,
      complexity: 'simple',
      needsProfessional: false,
    }

    vi.mocked(aiService.analyzeQuestion).mockResolvedValue(mockAIResult)

    const result = await consultationService.createConsultation(
      'user-123',
      'My legal question'
    )

    expect(result).toHaveProperty('id')
    expect(result.category).toBe('Civil')
    expect(prisma.consultation.create).toHaveBeenCalled()
  })
})
```

### 6.2 Frontend Tests

```typescript
// frontend/src/hooks/__tests__/useConsultations.test.ts

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useConsultations } from '@/hooks/useConsultations'

const queryClient = new QueryClient()

describe('useConsultations', () => {
  it('should fetch consultations', async () => {
    const { result } = renderHook(() => useConsultations('user-123'), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeDefined()
  })
})
```

---

## 7. DEPLOYMENT CHECKLIST

### Pre-Deploy
- [ ] Build passes locally
- [ ] Tests passing (coverage >70%)
- [ ] Linting clean
- [ ] Database migrations tested
- [ ] Environment variables documented
- [ ] Security review completed
- [ ] Performance benchmarks recorded
- [ ] Rollback plan documented

### Post-Deploy
- [ ] Health check endpoints responding
- [ ] Logs aggregated
- [ ] Monitoring alerts active
- [ ] Error tracking working
- [ ] Test transaction in production
- [ ] Team notified

---

## 8. DECISIONES ARQUITECTÓNICAS

### Por qué PostgreSQL
- ✅ Relaciones complejas (Users → Consultations → Payments)
- ✅ Transacciones ACID garantizadas
- ✅ Full-text search para FAQs
- ✅ JSONB para metadata flexible
- ✅ Backups fáciles

### Por qué Prisma
- ✅ Type-safe queries
- ✅ Migraciones automáticas
- ✅ Auto-generated API
- ✅ Built-in relationship loading

### Por qué JWT con Refresh Tokens
- ✅ Stateless (sin sesiones en servidor)
- ✅ Escalable horizontalmente
- ✅ Access token corto-plazo (15 min)
- ✅ Refresh token largo-plazo (7 días)

---

**Última actualización**: Noviembre 11, 2025

