#!/bin/bash
set -e

echo "======================================"
echo "🚀 Starting Build Process"
echo "======================================"

# Step 0: Clean up (CRITICAL FIX)
echo "🧹 Cleaning up corrupted dependencies..."
cd /workspace/backend
rm -f package-lock.json
npm cache clean --force

# Step 1: Install all dependencies (including devDependencies)
echo "📦 Installing dependencies..."
cd /workspace/backend
npm install --legacy-peer-deps

# Step 1b: Force install test packages (FIXED - removed invalid vi-fetch)
echo "🧪 Installing test dependencies..."
cd /workspace/backend
npm install vitest@^4.0.8 @vitest/coverage-v8@^4.0.8 supertest@^7.0.0 @types/supertest@^6.0.2 --save-dev --force --legacy-peer-deps

# Step 2: Build frontend
echo "🎨 Building frontend..."
cd /workspace
npm run build:frontend

# Step 3: Build backend
echo "🔨 Building backend..."
npm run build:backend

# Step 4: Generate Prisma client
echo "🔄 Generating Prisma client..."
cd /workspace/backend
npx prisma generate

# Step 5: Run tests with coverage
echo "🧪 Running tests with coverage..."
cd /workspace/backend
npx vitest run --coverage

echo ""
echo "✅ Build and tests completed successfully!"
echo "======================================"
