# ⚠️ ARREGLO URGENTE: Permisos PostgreSQL

## Problema
```
ERROR: permission denied for schema public
```

## Solución (5 minutos)

### 1. Conectar como doadmin

Ve a: https://cloud.digitalocean.com/databases

- Click en tu base de datos
- Tab "Users & Databases"
- Click "Console"
- Usuario: **doadmin** (NO barbwebdb)

### 2. Ejecutar SQL

Copia y pega TODO este código:

```sql
-- Dar permisos
GRANT ALL PRIVILEGES ON SCHEMA public TO barbwebdb;

-- Crear tabla users
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
  PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- Crear tabla oauth_accounts
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
  PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "oauth_accounts_pk" ON "oauth_accounts"("provider", "providerAccountId");

-- Crear tabla payments
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
  PRIMARY KEY ("id")
);

-- Crear tabla faqs
CREATE TABLE IF NOT EXISTS "faqs" (
  "id" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "keywords" TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- Crear tabla custom_agents
CREATE TABLE IF NOT EXISTS "custom_agents" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "specialty" TEXT NOT NULL,
  "systemPrompt" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- Dar permisos finales
GRANT ALL ON ALL TABLES IN SCHEMA public TO barbwebdb;
```

### 3. Redeploy

1. Ve a: Apps → barbweb
2. Click "Redeploy"
3. Espera 2-3 minutos

### 4. Probar

Desde PowerShell:
```powershell
$body = @{ email = "test@test.com"; password = "Test123!"; name = "Test" } | ConvertTo-Json
Invoke-WebRequest -Uri "https://back-jqdv9.ondigitalocean.app/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
```

¡Debería funcionar! ✅
