-- Drop existing payments table if it exists
DROP TABLE IF EXISTS "payments" CASCADE;

-- Recreate payments table with correct schema
CREATE TABLE "payments" (
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
  CONSTRAINT "payments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX "payments_userId_idx" ON "payments"("userId");
CREATE INDEX "payments_status_idx" ON "payments"("status");
CREATE INDEX "payments_stripeSessionId_idx" ON "payments"("stripeSessionId");
