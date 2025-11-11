# ⚡ Quick Start Local

## ✅ Ya instalado:
- ✓ Dependencias del Frontend
- ✓ Dependencias del Backend  
- ✓ Archivos .env.local (plantillas)

## 🚀 Para arrancar en local:

### 1. Abre TWO PowerShell/Terminal

**Terminal 1 - Frontend (Puerto 5173):**
```bash
cd frontend
npm run dev
```

**Terminal 2 - Backend (Puerto 3000):**
```bash
cd backend
npm run dev
```

### 2. Accede a la aplicación:
- 🌐 Frontend: http://localhost:5173
- 🔌 Backend: http://localhost:3000

### 3. Verificar que funciona:
- Frontend: Deberías ver la página de inicio con colores dorados
- Backend: Deberías ver en la consola `✅ Server running on http://0.0.0.0:3000`

## ⚙️ Configurar credenciales (IMPORTANTE):

Edita estos archivos con tus keys reales:

1. **frontend/.env.local**
   - VITE_STRIPE_PUBLISHABLE_KEY (de Stripe Dashboard)
   - VITE_GOOGLE_CLIENT_ID (de Google Console)
   - VITE_MICROSOFT_CLIENT_ID (de Azure)

2. **backend/.env.local**
   - OPENAI_API_KEY (de OpenAI)
   - GOOGLE_CLIENT_* (de Google)
   - MICROSOFT_CLIENT_* (de Azure)
   - JWT_SECRET (clave segura para tokens)
   - DATABASE_URL (si usas base de datos real)

## 🗄️ Base de datos (Opcional)

Si necesitas PostgreSQL:

```bash
# Windows - Descargar PostgreSQL de https://www.postgresql.org/download/windows/

# macOS
brew install postgresql
brew services start postgresql

# Linux
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

Luego crear BD:
```bash
psql -U postgres
CREATE DATABASE barbweb_local;
\q
```

## 📁 Estructura importante:

```
frontend/                  # React + Vite
├── src/pages/            # Todas las páginas
├── src/components/       # Componentes reutilizables
├── src/layouts/          # Diseños (Classic/Minimalist)
├── src/store/            # Estado global (Zustand)
└── .env.local            # Variables de entorno

backend/                   # Node.js + Express
├── src/routes/           # Endpoints de API
├── src/services/         # Lógica de negocio
├── src/middleware/       # Auth, CORS, etc.
└── .env.local            # Variables de entorno
```

## 🐛 Troubleshooting:

**Error: "Cannot find module"**
```bash
rm -r node_modules package-lock.json
npm install
```

**Error: "Port already in use"**
```powershell
# Buscar proceso en puerto 3000
Get-Process | Where-Object {$_.Id -eq (netstat -ano | Select-String ":3000" | Select-Object -First 1).Split()[4]}

# Matar proceso
Stop-Process -Id <PID> -Force
```

**Error: "ENOENT: no such file or directory, open '.env.local'"**
- Los archivos .env.local ya están creados, asegúrate de estar en la carpeta correcta

## 📚 Documentación completa:
- Lee `SETUP_LOCAL.md` para instrucciones detalladas
- Lee `ROADMAP_PROFESSIONAL.md` para el plan de desarrollo
- Lee `TECHNICAL_GUIDE.md` para arquitectura técnica

---

**¡Listo! 🎉 El proyecto debería estar funcionando en local ahora.**
