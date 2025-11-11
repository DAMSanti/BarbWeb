@echo off
REM Setup local para Barbara & Abogados - Windows

setlocal enabledelayedexpansion

echo.
echo ============================================
echo   🚀 Setup Local - Barbara & Abogados
echo ============================================
echo.

REM Check Node.js
echo ✓ Verificando Node.js...
node -v >nul 2>&1
if errorlevel 1 (
    echo ✗ Node.js no está instalado
    echo   Descárgalo de: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✓ Node.js %NODE_VERSION% encontrado
echo.

REM Check npm
echo ✓ Verificando npm...
npm -v >nul 2>&1
if errorlevel 1 (
    echo ✗ npm no está instalado
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✓ npm %NPM_VERSION% encontrado
echo.

REM Frontend
echo 📦 Instalando dependencias del Frontend...
cd frontend
call npm install
if errorlevel 1 (
    echo ✗ Error instalando frontend
    pause
    exit /b 1
)
echo ✓ Frontend instalado
echo.

REM Backend
echo 📦 Instalando dependencias del Backend...
cd ..\backend
call npm install
if errorlevel 1 (
    echo ✗ Error instalando backend
    pause
    exit /b 1
)
echo ✓ Backend instalado
echo.

REM Create .env files
echo 🔧 Creando archivos .env...
cd ..

if not exist "frontend\.env.local" (
    (
        echo VITE_API_URL=http://localhost:3000
        echo VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
    ) > frontend\.env.local
    echo ✓ frontend\.env.local creado
) else (
    echo ✓ frontend\.env.local ya existe
)

if not exist "backend\.env.local" (
    (
        echo PORT=3000
        echo NODE_ENV=development
        echo DATABASE_URL=postgresql://user:password@localhost:5432/barbweb
        echo OPENAI_API_KEY=sk_test_your_key
        echo JWT_SECRET=your_secret_key_here
        echo GOOGLE_CLIENT_ID=your_google_client_id
        echo GOOGLE_CLIENT_SECRET=your_google_client_secret
        echo MICROSOFT_CLIENT_ID=your_microsoft_client_id
        echo MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
    ) > backend\.env.local
    echo ✓ backend\.env.local creado
) else (
    echo ✓ backend\.env.local ya existe
)

echo.
echo ✅ Setup completado!
echo.
echo 📝 Próximos pasos:
echo 1. Edita los archivos .env.local con tus credenciales
echo 2. Abre dos PowerShell/CMD:
echo    Terminal 1: cd frontend ^&^& npm run dev
echo    Terminal 2: cd backend ^&^& npm run dev
echo 3. Accede a http://localhost:5173
echo.
echo 📚 Para más info, lee SETUP_LOCAL.md
echo.
pause
