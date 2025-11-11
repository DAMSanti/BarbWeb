#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando setup de Barbara & Abogados en local...${NC}\n"

# Check Node.js
echo -e "${BLUE}✓ Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js no está instalado. Por favor, descárgalo de https://nodejs.org/${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js v$(node -v) encontrado${NC}\n"

# Check npm
echo -e "${BLUE}✓ Verificando npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm v$(npm -v) encontrado${NC}\n"

# Frontend
echo -e "${BLUE}📦 Instalando dependencias del Frontend...${NC}"
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Error instalando frontend${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend instalado${NC}\n"

# Backend
echo -e "${BLUE}📦 Instalando dependencias del Backend...${NC}"
cd ../backend
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Error instalando backend${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Backend instalado${NC}\n"

# Create .env files
echo -e "${BLUE}🔧 Creando archivos .env...${NC}"

# Frontend .env
if [ ! -f "frontend/.env.local" ]; then
    echo "VITE_API_URL=http://localhost:3000" > ../frontend/.env.local
    echo "VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key" >> ../frontend/.env.local
    echo -e "${GREEN}✓ frontend/.env.local creado${NC}"
else
    echo -e "${GREEN}✓ frontend/.env.local ya existe${NC}"
fi

# Backend .env
if [ ! -f ".env.local" ]; then
    cat > .env.local << EOF
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/barbweb
OPENAI_API_KEY=sk_test_your_key
JWT_SECRET=your_secret_key_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
EOF
    echo -e "${GREEN}✓ backend/.env.local creado${NC}"
else
    echo -e "${GREEN}✓ backend/.env.local ya existe${NC}"
fi

echo -e "\n${GREEN}✅ Setup completado!${NC}\n"

echo -e "${BLUE}📝 Próximos pasos:${NC}"
echo "1. Edita los archivos .env.local con tus credenciales (Google, Microsoft, Stripe, etc.)"
echo "2. Abre dos terminales:"
echo "   Terminal 1: cd frontend && npm run dev"
echo "   Terminal 2: cd backend && npm run dev"
echo "3. Accede a http://localhost:5173"
echo ""
echo -e "${BLUE}📚 Para más info, lee SETUP_LOCAL.md${NC}\n"
