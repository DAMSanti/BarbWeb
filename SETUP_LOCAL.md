# 🚀 Setup Local - Barbara & Abogados

## Requisitos previos

- **Node.js** >= 16.x (recomendado 18.x o 20.x)
- **npm** >= 8.x o **yarn** >= 3.x
- **Git**

## 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/DAMSanti/BarbWeb.git
cd BarbWeb
```

## 2️⃣ Instalar dependencias globales

### Frontend
```bash
cd frontend
npm install
```

### Backend
```bash
cd ../backend
npm install
```

## 3️⃣ Configurar variables de entorno

### Frontend (.env.local)
```bash
cd frontend
cp .env.example .env.local
```

Edita `frontend/.env.local` con:
```env
VITE_API_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_MICROSOFT_CLIENT_ID=your_microsoft_client_id
```

### Backend (.env.local)
```bash
cd ../backend
cp .env.example .env.local
```

Edita `backend/.env.local` con:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/barbweb
OPENAI_API_KEY=sk_test_your_key
JWT_SECRET=your_secret_key_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
```

## 4️⃣ Setup Base de datos (Opcional - Para desarrollo completo)

### Instalar PostgreSQL
- **Windows**: https://www.postgresql.org/download/windows/
- **macOS**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql`

### Crear base de datos
```bash
psql -U postgres
CREATE DATABASE barbweb;
\q
```

### Migrar schema (desde carpeta backend)
```bash
cd backend
npm run migrate
```

## 5️⃣ Arrancar en desarrollo

### Opción A: Terminal separadas (Recomendado)

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```
Accede a: http://localhost:5173

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```
Backend ejecutándose en: http://localhost:3000

### Opción B: Script automático (si estás en Windows)

Desde la raíz del proyecto:
```bash
npm run dev
```

## 6️⃣ Verificar instalación

### Frontend
- Abre http://localhost:5173
- Deberías ver la página de inicio con logo dorado y diseño elegante

### Backend
- Abre http://localhost:3000
- Deberías ver: `{"message": "Bufete Jurídico Backend", "version": "1.0.0", "status": "running"}`

## 🐛 Troubleshooting

### Error: "Port already in use"
```bash
# Matar proceso en el puerto
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :3000
kill -9 <PID>
```

### Error: "Module not found"
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: "DATABASE_URL not set"
- Asegúrate de que `backend/.env.local` tiene la URL de la base de datos correcta

## 📁 Estructura de carpetas

```
BarbWeb/
├── frontend/          # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── pages/     # HomePage, FAQPage, CheckoutPage, LoginPage, RegisterPage
│   │   ├── components/# Header, Footer, StyleSwitcher, etc.
│   │   ├── layouts/   # ClassicLayout, MinimalistLayout
│   │   ├── store/     # Zustand state management
│   │   └── styles/    # Estilos globales
│   └── package.json
│
├── backend/           # Node.js + Express + Prisma
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── services/  # Lógica de negocio
│   │   ├── middleware/# Auth, CORS, etc.
│   │   └── db/        # Database initialization
│   └── package.json
│
└── README.md
```

## 🔗 URLs útiles

- **Frontend (Desarrollo)**: http://localhost:5173
- **Backend (Desarrollo)**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **GitHub**: https://github.com/DAMSanti/BarbWeb

## 📚 Documentación adicional

- [ROADMAP_PROFESSIONAL.md](./ROADMAP_PROFESSIONAL.md) - Hoja de ruta de producción
- [TECHNICAL_GUIDE.md](./TECHNICAL_GUIDE.md) - Guía técnica arquitectura
- [README.md](./README.md) - Documentación general del proyecto

---

**¿Problemas?** Contacta con el equipo o abre un issue en GitHub.
