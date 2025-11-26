#!/bin/bash
# Script para verificar que no hay console.log/console.error en código de producción
# Excluye scripts, archivos de configuración y comentarios

echo "🔍 Verificando console.log y console.error en código de producción..."
echo ""

# Archivos que deben ser revisados (excluyendo scripts, configs, tests)
SEARCH_PATTERNS=(
  "backend/src/**/*.ts"
  "frontend/src/**/*.ts"
  "frontend/src/**/*.tsx"
)

# Archivos y directorios a ignorar
IGNORE_PATTERNS=(
  "**/scripts/**"
  "**/test/**"
  "*.config.*"
  "**/node_modules/**"
  "**/dist/**"
  "generate-secrets.js"
  "test-import.mjs"
)

FOUND=0

# Función para buscar console.log/error
check_files() {
  local pattern="$1"
  
  # Buscar console.log y console.error (pero no en comentarios)
  # Excluir líneas que están comentadas
  matches=$(grep -r "console\.\(log\|error\|warn\|debug\)" $pattern 2>/dev/null | grep -v "^.*//.*console\." | grep -v "^\s*//" || true)
  
  if [ ! -z "$matches" ]; then
    echo "$matches"
    FOUND=$((FOUND + 1))
  fi
}

# Backend
echo "📍 Revisando backend/src..."
result=$(find backend/src -name "*.ts" -type f -exec grep -l "console\.\(log\|error\|warn\|debug\)" {} \; 2>/dev/null | grep -v "node_modules" || true)
if [ ! -z "$result" ]; then
  echo "  ❌ Encontrados console.log/error en:"
  echo "$result" | sed 's/^/     - /'
  FOUND=$((FOUND + 1))
fi

# Frontend
echo "📍 Revisando frontend/src..."
result=$(find frontend/src -name "*.ts" -o -name "*.tsx" -type f -exec grep -l "console\.\(log\|error\|warn\|debug\)" {} \; 2>/dev/null | grep -v "node_modules" || true)
if [ ! -z "$result" ]; then
  echo "  ❌ Encontrados console.log/error en:"
  echo "$result" | sed 's/^/     - /'
  FOUND=$((FOUND + 1))
fi

echo ""
if [ $FOUND -eq 0 ]; then
  echo "✅ ¡Excelente! No se encontraron console.log/error en código de producción"
  exit 0
else
  echo "❌ Se encontraron $FOUND archivo(s) con console.log/error"
  exit 1
fi
