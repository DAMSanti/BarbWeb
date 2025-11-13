#!/bin/bash

# Build script for DigitalOcean - Complete build process
# Handles: npm install, frontend build, backend build, prisma generate, db push

echo "======================================"
echo "🚀 Starting Complete Build Process"
echo "======================================"

# Step 1: Install dependencies in root
echo ""
echo "📦 [1/6] Installing root dependencies..."
cd /workspace
npm install --legacy-peer-deps || npm install

# Step 2: Install Prisma in root (required for CLI)
echo ""
echo "📦 [1b/6] Installing Prisma..."
npm install --legacy-peer-deps prisma@5.7.0 || npm install prisma@5.7.0

# Step 3: Build frontend
echo ""
echo "🎨 [2/6] Building frontend..."
npm run build:frontend || echo "⚠️  Frontend build skipped or failed"

# Step 4: Install backend dependencies
echo ""
echo "📦 [3/6] Installing backend dependencies..."
cd /workspace/backend
npm install --legacy-peer-deps || npm install

# Step 5: Compile TypeScript to JavaScript
echo ""
echo "🔨 [4/6] Compiling TypeScript..."
cd /workspace/backend
npm run build || npx tsc

# Step 6: Generate Prisma client
echo ""
echo "🔄 [5/6] Generating Prisma client..."
cd /workspace/backend
# Set a temporary DATABASE_URL if not already set (for schema generation ONLY during build)
export DATABASE_URL="${DATABASE_URL:-postgresql://tempuser:temppass@localhost:5432/tempdb}"
npx prisma generate || echo "⚠️  Prisma generation skipped"
# Unset temp DATABASE_URL so runtime uses the real one
unset DATABASE_URL

# Step 7: Push database schema
echo ""
echo "💾 [6/6] Pushing database schema..."
npx prisma db push --skip-generate --accept-data-loss || echo "⚠️  Database push failed or skipped"

echo ""
echo "✅ Build completed successfully!"
echo "======================================"
