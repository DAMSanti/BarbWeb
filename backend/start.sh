#!/bin/sh
# Startup wrapper to print environment diagnostics before launching the app
echo "======================================"
echo "🧭 Startup diagnostics"
echo "Working dir: $(pwd)"
echo "node: $(node --version 2>/dev/null || echo 'node not found')"
echo "npm: $(npm --version 2>/dev/null || echo 'npm not found')"
echo "TSC present: $(npx -y tsc --version 2>/dev/null || echo 'tsc not found')"
echo "Environment variables (presence):"
echo "  DATABASE_URL: ${DATABASE_URL:+✅ set}${DATABASE_URL:+' (hidden)'}${DATABASE_URL:-❌ not set}"
echo "  RESEND_API_KEY: ${RESEND_API_KEY:+✅ set}${RESEND_API_KEY:+' (hidden)'}${RESEND_API_KEY:-❌ not set}"
echo "  STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY:+✅ set}${STRIPE_SECRET_KEY:+' (hidden)'}${STRIPE_SECRET_KEY:-❌ not set}"
echo "  NODE_ENV: ${NODE_ENV:-development}"
echo "Listing /workspace and /workspace/backend contents (top-level):"
echo "--- /workspace ---"
ls -la /workspace || true
echo "--- /workspace/backend ---"
ls -la /workspace/backend || true
echo "======================================"

echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy 2>&1 || echo "⚠️ Migration failed or no migrations to apply"
echo "✅ Migrations complete"
echo "======================================"

echo "Starting application: node --trace-warnings dist/index.js"
# Run node with trace warnings and capture exit code; redirect stderr to stdout so DO logs show everything
node --trace-warnings dist/index.js 2>&1
exit_code=$?

if [ $exit_code -ne 0 ]; then
	echo "--------------------------------------"
	echo "⚠️  Application exited with code: $exit_code"
	echo "🔎 Dumping recent log files from ./logs to help debugging:"
	if [ -d ./logs ]; then
		for f in ./logs/*.log; do
			if [ -f "$f" ]; then
				echo "\n--- $f (last 200 lines) ---"
				tail -n 200 "$f" || true
			fi
		done
	else
		echo "No ./logs directory found"
	fi
	echo "--------------------------------------"
fi

exit $exit_code
