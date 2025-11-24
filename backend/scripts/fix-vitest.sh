#!/bin/bash

# 🔧 Script para Limpiar y Reinstalar Vitest
# Ejecutar: bash scripts/fix-vitest.sh

echo "╔════════════════════════════════════════════════════════════╗"
echo "║ 🔧 Limpiando y Reinstalando Vitest                        ║"
echo "╚════════════════════════════════════════════════════════════╝"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Paso 1: Borrar package-lock.json
echo -e "\n${BLUE}1️⃣ Borrando package-lock.json...${NC}"
if rm -f package-lock.json; then
    echo -e "${GREEN}✅ package-lock.json borrado${NC}"
else
    echo -e "${YELLOW}⚠️ No se encontró package-lock.json (ok)${NC}"
fi

# Paso 2: Borrar node_modules
echo -e "\n${BLUE}2️⃣ Borrando node_modules...${NC}"
if rm -rf node_modules; then
    echo -e "${GREEN}✅ node_modules borrado${NC}"
else
    echo -e "${RED}❌ Error borrando node_modules${NC}"
    exit 1
fi

# Paso 3: Limpiar caché de npm
echo -e "\n${BLUE}3️⃣ Limpiando caché de npm...${NC}"
if npm cache clean --force > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Caché de npm limpiado${NC}"
else
    echo -e "${YELLOW}⚠️ Error limpiando caché (continuando)${NC}"
fi

# Paso 4: Reinstalar dependencias
echo -e "\n${BLUE}4️⃣ Reinstalando dependencias...${NC}"
if npm install; then
    echo -e "${GREEN}✅ Dependencias reinstaladas${NC}"
else
    echo -e "${RED}❌ Error reinstalando dependencias${NC}"
    exit 1
fi

# Paso 5: Verificar que vitest está
echo -e "\n${BLUE}5️⃣ Verificando vitest...${NC}"
if command -v npx &> /dev/null && npx vitest --version > /dev/null 2>&1; then
    VITEST_VERSION=$(npx vitest --version 2>/dev/null || echo "unknown")
    echo -e "${GREEN}✅ Vitest ${VITEST_VERSION} verificado${NC}"
else
    echo -e "${YELLOW}⚠️ No se puede verificar vitest (pero debería estar instalado)${NC}"
fi

# Resumen
echo -e "\n${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║ ✅ Limpieza Completada                                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${BLUE}Próximos pasos:${NC}"
echo "  1. Correr tests:"
echo -e "     ${YELLOW}npm run test${NC}"
echo ""
echo "  2. Con cobertura:"
echo -e "     ${YELLOW}npm run test:coverage${NC}"
echo ""
echo "  3. Modo watch:"
echo -e "     ${YELLOW}npm run test:watch${NC}"

echo ""
