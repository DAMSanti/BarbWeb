#!/bin/bash

# Build script for DigitalOcean
# This script installs dependencies and builds the application

set -e

echo "======================================"
echo "🚀 Starting Backend Build"
echo "======================================"

echo ""
echo "📦 Installing dependencies with npm install..."
cd /workspace/backend
npm install

echo ""
echo "🔄 Generating Prisma client..."
npx prisma generate

echo ""
echo "✅ Build completed successfully!"
echo "======================================"
