#!/bin/bash
# Script para inicializar la base de datos en DigitalOcean

echo "🔄 Conectando a PostgreSQL..."

psql "$DATABASE_URL" << 'EOF'

-- Dar permisos
GRANT ALL PRIVILEGES ON SCHEMA public TO barbwebdb;

-- Crear tablas
CREATE TABLE IF NOT EXISTS users (
  id TEXT NOT NULL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  "passwordHash" TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "emailVerifiedAt" TIMESTAMP(3),
  "refreshTokens" TEXT[],
  "lastLogin" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS oauth_accounts (
  id TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  email TEXT,
  name TEXT,
  picture TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, "providerAccountId")
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL,
  "stripePaymentId" TEXT,
  question TEXT,
  "consultationDetails" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS faqs (
  id TEXT NOT NULL PRIMARY KEY,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  keywords TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS custom_agents (
  id TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  "systemPrompt" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Dar permisos finales
GRANT ALL ON ALL TABLES IN SCHEMA public TO barbwebdb;

EOF

echo "✅ Base de datos inicializada"
