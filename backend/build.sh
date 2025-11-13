#!/bin/bash

# Build script for DigitalOcean
# This script installs dependencies and builds the application
# Uses npm install instead of npm ci to regenerate lock file if needed

set -e

echo "======================================"
echo "🚀 Starting Backend Build"
echo "======================================"

echo ""
echo "📦 Installing dependencies with npm install (forced)..."
cd /workspace/backend
rm -f package-lock.json
npm install --legacy-peer-deps

echo ""
echo "🔄 Generating Prisma client..."
npx prisma generate

echo ""
echo "✅ Build completed successfully!"
echo "======================================"
