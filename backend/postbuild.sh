#!/bin/bash
set -e

echo "📝 PostBuild Hook: Executing Prisma migrations..."

cd backend
npx prisma db push --skip-generate --accept-data-loss || echo "⚠️ Database push failed or already synchronized"

echo "✅ PostBuild completed"
