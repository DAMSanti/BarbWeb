#!/bin/bash
set -e

echo "📦 Step 1: Installing dependencies..."
npm ci

echo "🔍 Step 2: Running ESLint to check for console statements..."
npm run lint:console || { echo "❌ ESLint found issues. Build failed."; exit 1; }

echo "🎨 Step 3: Building frontend..."
npm run build:frontend

echo "🔨 Step 4: Building backend..."
npm run build:backend

echo "✅ Build completed successfully!"
