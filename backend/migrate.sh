#!/bin/bash
set -e

echo "🔄 Running Prisma database migrations..."
npx prisma db push --skip-generate --accept-data-loss

echo "✅ Database migrations completed"
