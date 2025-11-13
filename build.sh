#!/bin/bash
set -e

echo "📦 Step 1: Installing dependencies..."
npm ci --prefer-offline --no-audit

echo "🎨 Step 2: Building frontend..."
cd frontend
npm ci --prefer-offline --no-audit
npm run build
cd ..

echo "🔨 Step 3: Building backend..."
cd backend
npm ci --prefer-offline --no-audit
npm run build
cd ..

echo "✅ Build completed successfully!"
