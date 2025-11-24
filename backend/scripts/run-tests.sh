#!/bin/bash

# 🧪 Script Helper para ejecutar tests
# Uso: bash scripts/run-tests.sh [opción]
# Opciones: all, unit, integration, e2e, coverage, watch

set -e

OPTION=${1:-all}
BACKEND_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

cd "$BACKEND_DIR"

# Colores
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

case "$OPTION" in
  all)
    echo -e "${BLUE}🧪 Ejecutando TODOS los tests (unit + integration)...${NC}"
    npm run test
    echo -e "${GREEN}✅ Tests completados${NC}"
    ;;
  
  unit)
    echo -e "${BLUE}🧪 Ejecutando tests UNITARIOS...${NC}"
    npx vitest run --include 'tests/unit/**/*.test.ts'
    echo -e "${GREEN}✅ Tests unitarios completados${NC}"
    ;;
  
  integration)
    echo -e "${BLUE}🧪 Ejecutando tests de INTEGRACIÓN...${NC}"
    npx vitest run --include 'tests/integration/**/*.test.ts'
    echo -e "${GREEN}✅ Tests de integración completados${NC}"
    ;;
  
  coverage)
    echo -e "${BLUE}📊 Ejecutando tests con COBERTURA...${NC}"
    npm run test:coverage
    echo -e "${GREEN}✅ Reporte de cobertura generado en coverage/index.html${NC}"
    ;;
  
  watch)
    echo -e "${BLUE}👀 Iniciando modo WATCH...${NC}"
    npm run test:watch
    ;;
  
  e2e)
    echo -e "${BLUE}🌐 Ejecutando E2E tests...${NC}"
    npm run test:e2e
    echo -e "${GREEN}✅ E2E tests completados${NC}"
    ;;
  
  e2e:report)
    echo -e "${BLUE}📊 Mostrando reporte E2E...${NC}"
    npx playwright show-report
    ;;
  
  *)
    echo -e "${YELLOW}Opción no reconocida: $OPTION${NC}"
    echo ""
    echo "Uso: bash scripts/run-tests.sh [opción]"
    echo ""
    echo "Opciones disponibles:"
    echo "  all          - Ejecutar tests unitarios + integración"
    echo "  unit         - Solo tests unitarios"
    echo "  integration  - Solo tests de integración"
    echo "  coverage     - Tests con reporte de cobertura"
    echo "  watch        - Modo watch (desarrollo)"
    echo "  e2e          - E2E tests con Playwright"
    echo "  e2e:report   - Mostrar reporte E2E"
    exit 1
    ;;
esac
