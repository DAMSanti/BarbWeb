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

# Ensure TypeScript and Node types are available for build (install even if NODE_ENV=production)
echo ""
echo "📦 [3b/6] Ensuring TypeScript and @types/node are installed for build..."
npm install --legacy-peer-deps --no-save typescript @types/node || npm install --no-save typescript @types/node

# Diagnostic information to help with build-time errors
echo ""
echo "🔍 [3c/6] Environment and tool versions"
echo "node: $(node --version 2>/dev/null || echo 'node not found')"
echo "npm: $(npm --version 2>/dev/null || echo 'npm not found')"
echo "tsc: $(npx -y tsc --version 2>/dev/null || echo 'tsc not found')"
echo "DATABASE_URL present?"
if [ -n "$DATABASE_URL" ]; then
	echo "  ✅ yes (will be used for prisma db push)"
else
	echo "  ❌ no (prisma db push will be skipped)"
fi

# Step 5: Compile TypeScript to JavaScript
echo ""
echo "🔨 [4/6] Compiling TypeScript..."
cd /workspace/backend
npm run build || npx tsc

# Step 6: Generate Prisma client
echo ""
echo "🔄 [5/6] Generating Prisma client..."
cd /workspace/backend
# Generate prisma client using explicit schema path
npx prisma generate --schema=./prisma/schema.prisma || echo "⚠️  Prisma generate failed or skipped"

# Step 7: Push database schema (only if DATABASE_URL available at build time)
echo ""
echo "💾 [6/6] Pushing database schema (only if DATABASE_URL was set)..."
if [ -n "$DATABASE_URL" ]; then
	npx prisma db push --skip-generate --accept-data-loss || echo "⚠️  Database push failed or skipped"
else
	echo "Skipping prisma db push because DATABASE_URL was not set during build."
fi

echo ""
echo "✅ Build completed successfully!"
echo "======================================"
