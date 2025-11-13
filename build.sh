#!/bin/bash
set -e

echo "📦 Step 1: Installing dependencies with optional modules..."
npm ci --include=optional --force

echo "🔄 Step 2: Cleaning Rollup cache..."
rm -rf node_modules/@rollup/rollup-linux-x64-gnu
rm -rf node_modules/rollup

echo "🔧 Step 3: Reinstalling Rollup..."
npm install rollup

echo "🎨 Step 4: Building frontend..."
npm run build:frontend

echo "🔨 Step 5: Building backend..."
npm run build:backend

echo "✅ Build completed successfully!"
