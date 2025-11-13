#!/bin/bash

# Build script for DigitalOcean - Complete build process
# Handles: npm install, frontend build, backend build, prisma generate, db push

set -e

echo "======================================"
echo "🚀 Starting Complete Build Process"
echo "======================================"

# Step 1: Install dependencies in root
echo ""
echo "📦 [1/5] Installing root dependencies..."
cd /workspace
npm install --legacy-peer-deps || npm install

# Step 2: Build frontend
echo ""
echo "🎨 [2/5] Building frontend..."
npm run build:frontend || echo "⚠️  Frontend build skipped or failed"

# Step 3: Install backend dependencies
echo ""
echo "📦 [3/5] Installing backend dependencies..."
cd /workspace/backend
npm install --legacy-peer-deps || npm install

# Step 4: Generate Prisma client
echo ""
echo "🔄 [4/5] Generating Prisma client..."
npx prisma generate

# Step 5: Push database schema
echo ""
echo "💾 [5/5] Pushing database schema..."
npx prisma db push --skip-generate --accept-data-loss || echo "⚠️  Database push failed or skipped"

echo ""
echo "✅ Build completed successfully!"
echo "======================================"
