#!/bin/bash

# 🧪 Setup Automático de Testing en DigitalOcean
# Ejecutar como: bash scripts/setup-testing.sh

set -e

echo "════════════════════════════════════════════════════════════"
echo "🧪 Setup de Testing para Backend"
echo "════════════════════════════════════════════════════════════"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Verificar Node.js
echo -e "\n${BLUE}1️⃣ Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js ${NODE_VERSION} encontrado${NC}"

# 2. Instalar dependencias
echo -e "\n${BLUE}2️⃣ Instalando dependencias del backend...${NC}"
npm ci
echo -e "${GREEN}✅ Dependencias instaladas${NC}"

# 3. Verificar PostgreSQL
echo -e "\n${BLUE}3️⃣ Verificando PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️ PostgreSQL no está instalado, instalando...${NC}"
    sudo apt-get update
    sudo apt-get install -y postgresql postgresql-contrib
fi

# Iniciar PostgreSQL
sudo systemctl start postgresql || true
sudo systemctl enable postgresql || true
echo -e "${GREEN}✅ PostgreSQL verificado${NC}"

# 4. Crear base de datos de test
echo -e "\n${BLUE}4️⃣ Configurando base de datos de tests...${NC}"

# Verificar si usuario ya existe
if sudo -u postgres psql -tc "SELECT 1 FROM pg_user WHERE usename = 'testuser'" | grep -q 1; then
    echo -e "${YELLOW}⚠️ Usuario 'testuser' ya existe${NC}"
    
    # Recrear la BD
    sudo -u postgres psql << EOF
DROP DATABASE IF EXISTS barbweb_test;
CREATE DATABASE barbweb_test OWNER testuser;
EOF
else
    # Crear usuario y BD
    sudo -u postgres psql << EOF
CREATE USER testuser WITH PASSWORD 'testpass';
CREATE DATABASE barbweb_test OWNER testuser;
ALTER USER testuser CREATEDB;
EOF
fi

echo -e "${GREEN}✅ Base de datos de tests configurada${NC}"

# 5. Instalar Playwright
echo -e "\n${BLUE}5️⃣ Instalando navegadores de Playwright...${NC}"
npx playwright install
echo -e "${GREEN}✅ Navegadores de Playwright instalados${NC}"

# 6. Instalar Chromium (requerido para headless)
echo -e "\n${BLUE}6️⃣ Instalando Chromium...${NC}"
sudo apt-get install -y chromium-browser > /dev/null 2>&1 || true
echo -e "${GREEN}✅ Chromium verificado${NC}"

# 7. Generar tipos de Prisma
echo -e "\n${BLUE}7️⃣ Generando tipos de Prisma...${NC}"
npm run db:generate
echo -e "${GREEN}✅ Tipos de Prisma generados${NC}"

# 8. Resumen
echo -e "\n${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Setup de Testing Completado${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"

echo -e "\n${BLUE}Próximos pasos:${NC}"
echo "  1. Ejecutar tests unitarios + integración:"
echo -e "     ${YELLOW}npm run test${NC}"
echo ""
echo "  2. Ejecutar tests con cobertura:"
echo -e "     ${YELLOW}npm run test:coverage${NC}"
echo ""
echo "  3. Ejecutar E2E tests:"
echo -e "     ${YELLOW}npm run test:e2e${NC}"
echo ""
echo "  4. Modo watch (desarrollo):"
echo -e "     ${YELLOW}npm run test:watch${NC}"

echo -e "\n${BLUE}Información de la BD de test:${NC}"
echo "  Host: localhost"
echo "  Database: barbweb_test"
echo "  User: testuser"
echo "  Password: testpass"

echo -e "\n${YELLOW}Nota: Cambiar contraseña en producción!${NC}\n"
