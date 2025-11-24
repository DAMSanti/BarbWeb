#!/bin/bash

# 🧪 Setup Automático de Testing en DigitalOcean
# Ejecutar como: bash scripts/setup-testing.sh

echo "════════════════════════════════════════════════════════════"
echo "🧪 Setup de Testing para Backend"
echo "════════════════════════════════════════════════════════════"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para manejar errores sin detener
handle_error() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

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
if npm ci; then
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
else
    echo -e "${RED}❌ Error instalando dependencias${NC}"
    exit 1
fi

# 3. Verificar PostgreSQL
echo -e "\n${BLUE}3️⃣ Verificando PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️ PostgreSQL no está instalado${NC}"
    echo -e "${YELLOW}Intenta: sudo apt-get update && sudo apt-get install -y postgresql${NC}"
    handle_error "PostgreSQL no instalado, saltando configuración de BD"
else
    echo -e "${GREEN}✅ PostgreSQL encontrado${NC}"
    
    # Intentar iniciar PostgreSQL (puede fallar si no hay permisos)
    if sudo systemctl start postgresql 2>/dev/null; then
        echo -e "${GREEN}✅ PostgreSQL iniciado${NC}"
    else
        handle_error "No se puede iniciar PostgreSQL (sin permisos sudo?)"
        echo -e "${YELLOW}Intenta: sudo systemctl start postgresql${NC}"
    fi

    # 4. Crear base de datos de test (si PostgreSQL está disponible)
    echo -e "\n${BLUE}4️⃣ Configurando base de datos de tests...${NC}"
    
    # Verificar si usuario ya existe
    if sudo -u postgres psql -tc "SELECT 1 FROM pg_user WHERE usename = 'testuser'" 2>/dev/null | grep -q 1; then
        echo -e "${YELLOW}⚠️ Usuario 'testuser' ya existe${NC}"
        
        # Recrear la BD
        if sudo -u postgres psql << EOF 2>/dev/null
DROP DATABASE IF EXISTS barbweb_test;
CREATE DATABASE barbweb_test OWNER testuser;
EOF
        then
            echo -e "${GREEN}✅ Base de datos recreada${NC}"
        else
            handle_error "No se pudo recrear la BD de test"
        fi
    else
        # Crear usuario y BD
        if sudo -u postgres psql << EOF 2>/dev/null
CREATE USER testuser WITH PASSWORD 'testpass';
CREATE DATABASE barbweb_test OWNER testuser;
ALTER USER testuser CREATEDB;
EOF
        then
            echo -e "${GREEN}✅ Base de datos de tests configurada${NC}"
        else
            handle_error "No se pudo crear la BD de test"
        fi
    fi
fi

# 5. Instalar Playwright
echo -e "\n${BLUE}5️⃣ Instalando navegadores de Playwright...${NC}"
if npx playwright install; then
    echo -e "${GREEN}✅ Navegadores de Playwright instalados${NC}"
else
    handle_error "Error instalando Playwright browsers"
fi

# 6. Instalar Chromium (requerido para headless)
echo -e "\n${BLUE}6️⃣ Verificando Chromium...${NC}"
if command -v chromium-browser &> /dev/null || command -v chromium &> /dev/null; then
    echo -e "${GREEN}✅ Chromium ya instalado${NC}"
else
    echo -e "${YELLOW}⚠️ Chromium no encontrado${NC}"
    echo -e "${YELLOW}Intenta: sudo apt-get install -y chromium-browser${NC}"
fi

# 7. Generar tipos de Prisma
echo -e "\n${BLUE}7️⃣ Generando tipos de Prisma...${NC}"
if npm run db:generate 2>/dev/null; then
    echo -e "${GREEN}✅ Tipos de Prisma generados${NC}"
else
    handle_error "Saltando generación de Prisma (puede estar ya generado)"
fi

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

echo -e "\n${YELLOW}📝 Nota: Si la BD no se configuró, ejecuta manualmente:${NC}"
echo -e "  ${YELLOW}sudo systemctl start postgresql${NC}"
echo -e "  ${YELLOW}sudo -u postgres psql${NC}"
echo -e "  ${YELLOW}CREATE USER testuser WITH PASSWORD 'testpass';${NC}"
echo -e "  ${YELLOW}CREATE DATABASE barbweb_test OWNER testuser;${NC}"
echo -e "\n${YELLOW}Cambiar contraseña en producción!${NC}\n"
