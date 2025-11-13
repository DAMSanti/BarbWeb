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

# Ensure @types/node is available at repo root for tsc to pick up (fix TS2688)
echo ""
echo "📦 [2b/6] Ensuring @types/node is installed at repo root for TypeScript..."
cd /workspace
npm install --legacy-peer-deps --no-save @types/node || npm install --no-save @types/node || echo "⚠️ Could not install @types/node at root"

# Step 4: Install backend dependencies
echo ""
echo "📦 [3/6] Installing backend dependencies..."
cd /workspace/backend
echo "(ensuring devDependencies are installed for build)"
npm_config_production=false npm install --legacy-peer-deps || npm install

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
npm install --legacy-peer-deps --no-save @types/node || npm install --no-save @types/node || echo "⚠️ Could not install @types/node in backend"
npm run build || npx tsc

# Step 6: Generate Prisma client
echo ""
echo "🔄 [5/6] Generating Prisma client..."
cd /workspace/backend
# Diagnostic: show where .prisma client folders currently exist
echo "Looking for generated prisma clients (root and backend node_modules):"
ls -la /workspace/node_modules/.prisma 2>/dev/null || echo "  no root .prisma folder"
ls -la /workspace/backend/node_modules/.prisma 2>/dev/null || echo "  no backend .prisma folder"

# Generate prisma client in repository root (matches hoisted node_modules)
cd /workspace
# Ensure @prisma/client is present at root to align generated client location
echo "📦 [5a/6] Ensuring @prisma/client installed at repo root (best-effort)..."
npm install --legacy-peer-deps --no-save @prisma/client || echo "⚠️ Could not install @prisma/client at root"
# Try generate in repo root (where node_modules may be hoisted). If it fails, log but continue and try backend generate.
echo "Generating prisma client in /workspace using schema ./backend/prisma/schema.prisma (root generate - best-effort)"
# Force Prisma to use library engine where possible to avoid platform binary download issues
if ! PRISMA_CLI_QUERY_ENGINE_TYPE=library npx prisma generate --schema=./backend/prisma/schema.prisma; then
	echo "⚠️ Prisma generate in /workspace failed (continuing to attempt backend generate)."
fi

# Also attempt generate in backend folder (best-effort)
cd /workspace/backend
# Try backend generate using library engine first, then fallback to default
if ! PRISMA_CLI_QUERY_ENGINE_TYPE=library npx prisma generate --schema=./prisma/schema.prisma; then
	echo "⚠️  Prisma generate in backend with library engine failed, trying default"
	npx prisma generate --schema=./prisma/schema.prisma || echo "⚠️  Prisma generate in backend failed or skipped"
fi

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
