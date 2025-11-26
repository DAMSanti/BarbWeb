#!/bin/bash
# Script para verificar que ESLint funciona en DigitalOcean

echo "🔍 Verificando ESLint `no-console` Configuration..."
echo ""

# Verificar que los archivos de configuración existen
echo "📋 Verificando .eslintrc.json..."
if [ -f "frontend/.eslintrc.json" ]; then
  echo "  ✅ frontend/.eslintrc.json encontrado"
else
  echo "  ❌ frontend/.eslintrc.json NO ENCONTRADO"
fi

if [ -f "backend/.eslintrc.json" ]; then
  echo "  ✅ backend/.eslintrc.json encontrado"
else
  echo "  ❌ backend/.eslintrc.json NO ENCONTRADO"
fi

echo ""
echo "📦 Verificando dependencias en package.json..."

# Verificar eslint en frontend
if grep -q '"eslint"' frontend/package.json; then
  echo "  ✅ frontend tiene eslint configurado"
else
  echo "  ❌ frontend NO tiene eslint"
fi

# Verificar eslint en backend
if grep -q '"eslint"' backend/package.json; then
  echo "  ✅ backend tiene eslint configurado"
else
  echo "  ❌ backend NO tiene eslint"
fi

echo ""
echo "🧪 Verificando archivos de test..."

if [ -f "frontend/src/eslint-test.ts" ]; then
  echo "  ✅ frontend/src/eslint-test.ts encontrado"
  echo "     (Debería causar error en ESLint)"
else
  echo "  ⚠️  frontend/src/eslint-test.ts NO encontrado"
fi

if [ -f "backend/src/eslint-test.ts" ]; then
  echo "  ✅ backend/src/eslint-test.ts encontrado"
  echo "     (Debería causar error en ESLint)"
else
  echo "  ⚠️  backend/src/eslint-test.ts NO encontrado"
fi

echo ""
echo "📝 Resumen:"
echo "  Si ESLint está correctamente configurado:"
echo "  - El build debería FALLAR debido a console.log en eslint-test.ts"
echo "  - Los errores deberían mencionar 'Unexpected console statement'"
echo ""
echo "  Después de verificar que funciona:"
echo "  - Elimina frontend/src/eslint-test.ts"
echo "  - Elimina backend/src/eslint-test.ts"
echo "  - Haz push nuevamente"
echo "  - El build debería PASAR"
