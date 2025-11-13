#!/bin/bash
set -e

echo "📦 Step 1: Installing dependencies..."
npm ci

echo "🎨 Step 2: Building frontend with esbuild..."
npm run build:frontend

echo "🔨 Step 3: Building backend..."
npm run build:backend

echo "✅ Build completed successfully!"
