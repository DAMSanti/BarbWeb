#!/bin/bash
set -e

echo "======================================"
echo "🚀 Starting Build Process"
echo "======================================"

# Force npm to install devDependencies even in production
export NODE_ENV=development

# Step 1: Install all dependencies (including devDependencies)
echo "📦 Installing dependencies..."
cd /workspace
npm install --legacy-peer-deps --force --workspaces=true

# Step 2: Run console check script
echo "🔍 Checking for console statements in production code..."
cd /workspace
node scripts/check-console.js || { echo "❌ Console statements found. Build failed."; exit 1; }

# Step 3: Build frontend
echo "🎨 Building frontend..."
cd /workspace
npm run build:frontend

# Step 4: Build backend
echo "🔨 Building backend..."
cd /workspace
npm run build:backend

# Step 4: Generate Prisma client
echo "🔄 Generating Prisma client..."
cd /workspace/backend
npx prisma generate

echo ""
echo "✅ Build completed successfully!"
echo "======================================"
