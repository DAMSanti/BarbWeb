-- CreateTable users
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
);

-- CreateIndex users_email_key
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateTable oauth_accounts
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
);

-- CreateIndex oauth_accounts_provider_providerAccountId_key
CREATE UNIQUE INDEX "oauth_accounts_provider_providerAccountId_key" ON "oauth_accounts"("provider", "providerAccountId");

-- CreateIndex oauth_accounts_userId_idx
CREATE INDEX "oauth_accounts_userId_idx" ON "oauth_accounts"("userId");

-- CreateTable payments
CREATE TABLE IF NOT EXISTS "payments" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'usd',
  "status" TEXT NOT NULL,
  "stripeSessionId" TEXT UNIQUE,
  "question" TEXT,
  "category" TEXT,
  "consultationSummary" TEXT,
  "reasoning" TEXT,
  "confidence" DOUBLE PRECISION,
  "receiptUrl" TEXT,
  "refundedAmount" DECIMAL(10,2),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex payments_userId_idx
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- CreateIndex payments_status_idx
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex payments_stripeSessionId_idx
CREATE INDEX "payments_stripeSessionId_idx" ON "payments"("stripeSessionId");

-- CreateTable faqs
CREATE TABLE IF NOT EXISTS "faqs" (
  "id" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "keywords" TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex faqs_category_idx
CREATE INDEX "faqs_category_idx" ON "faqs"("category");

-- CreateTable custom_agents
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
);

-- CreateIndex custom_agents_userId_idx
CREATE INDEX "custom_agents_userId_idx" ON "custom_agents"("userId");
