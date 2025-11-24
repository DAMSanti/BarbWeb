# 🧪 Setup de Testing - PowerShell (Referencia Local)
# Este script es para referencia - en DO usar: bash scripts/setup-testing.sh

# Verificar Node.js
Write-Host "1️⃣ Verificando Node.js..." -ForegroundColor Blue
$nodeVersion = node --version
Write-Host "✅ Node.js $nodeVersion encontrado" -ForegroundColor Green

# Instalar dependencias
Write-Host "`n2️⃣ Instalando dependencias..." -ForegroundColor Blue
npm ci
Write-Host "✅ Dependencias instaladas" -ForegroundColor Green

# Generar tipos de Prisma
Write-Host "`n3️⃣ Generando tipos de Prisma..." -ForegroundColor Blue
npm run db:generate
Write-Host "✅ Tipos generados" -ForegroundColor Green

# Instalar Playwright
Write-Host "`n4️⃣ Instalando Playwright..." -ForegroundColor Blue
npx playwright install
Write-Host "✅ Playwright instalado" -ForegroundColor Green

Write-Host "`n✅ Setup completado!" -ForegroundColor Green
Write-Host "`nPróximos pasos:" -ForegroundColor Cyan
Write-Host "  npm run test           - Ejecutar tests"
Write-Host "  npm run test:coverage  - Ver cobertura"
Write-Host "  npm run test:watch     - Modo watch"
Write-Host "  npm run test:e2e       - E2E tests"
