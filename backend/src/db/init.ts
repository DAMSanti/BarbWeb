import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Inicializa la base de datos ejecutando SQL directo para crear tablas
 */
export async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database tables...')
    console.log(`📍 Attempting to connect to Prisma with DATABASE_URL`)
    console.log(`📍 Prisma connection test starting...`)

    // Crear tabla users
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "passwordHash" TEXT,
        "role" TEXT NOT NULL DEFAULT 'user',
        "emailVerified" BOOLEAN NOT NULL DEFAULT false,
        "emailVerifiedAt" TIMESTAMP(3),
        "refreshTokens" TEXT[],
        "lastLogin" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      )
    `

    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email")`

    // Crear tabla oauth_accounts
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "oauth_accounts" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "email" TEXT,
        "name" TEXT,
        "picture" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "oauth_accounts_pkey" PRIMARY KEY ("id")
      )
    `

    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "oauth_accounts_provider_providerAccountId_key" ON "oauth_accounts"("provider", "providerAccountId")`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "oauth_accounts_userId_idx" ON "oauth_accounts"("userId")`

    // Crear tabla payments
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "payments" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "currency" TEXT NOT NULL DEFAULT 'EUR',
        "status" TEXT NOT NULL,
        "stripePaymentId" TEXT,
        "question" TEXT,
        "consultationDetails" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
      )
    `

    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "payments_userId_idx" ON "payments"("userId")`

    // Crear tabla faqs
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "faqs" (
        "id" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "question" TEXT NOT NULL,
        "answer" TEXT NOT NULL,
        "keywords" TEXT[],
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
      )
    `

    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "faqs_category_idx" ON "faqs"("category")`

    // Crear tabla custom_agents
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "custom_agents" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "specialty" TEXT NOT NULL,
        "systemPrompt" TEXT NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "custom_agents_pkey" PRIMARY KEY ("id")
      )
    `

    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "custom_agents_userId_idx" ON "custom_agents"("userId")`

    console.log('✅ Database tables initialized successfully')
    return true
  } catch (error: any) {
    // Si el error es porque las tablas ya existen, no es un problema
    if (error.message?.includes('already exists')) {
      console.log('✅ Database tables already exist')
      return true
    }
    console.error('⚠️ Database initialization error:', error.message)
    return false
  }
}

export default prisma
