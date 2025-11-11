# 🏛️ BarbWeb - Plataforma de Consultas Legales# 🏛️ BarbWeb - Plataforma de Consultas Legales



Plataforma web moderna para un bufete de abogados con sistema inteligente de filtrado de preguntas usando IA. Proporciona respuestas automáticas o facilita la conexión con abogados profesionales a través de una pasarela de pagos segura.



## ✨ Características PrincipalesPlataforma web para consultas legales en línea con sistema inteligente de filtrado de preguntas usando IA.Una plataforma web moderna para un bufete de abogados que ofrece consultas legales rápidas, seguras y accesibles. Con un sistema inteligente de filtrado de preguntas que proporciona respuestas automáticas cuando es posible, o facilita la conexión con abogados profesionales a través de una pasarela de pagos segura.



### 🤖 Sistema Inteligente

- **Detección Automática de Categoría**: Analiza preguntas y detecta categoría legal

- **Respuestas Automáticas**: Base de datos de FAQs verificadas por abogados## 🏗️ Estructura del Proyecto## ✨ Características Principales

- **Similitud Semántica**: Algoritmo para encontrar preguntas relacionadas



### 💳 Pasarela de Pagos

- **Stripe Integration**: Sistema de pagos seguro (mockup actualmente)```### 🤖 Sistema Inteligente de Filtrado

- **Checkout Simplificado**: Proceso rápido y eficiente

- **Confirmación Inmediata**: Recepción instantánea de confirmaciónBarbWeb/- **Detección Automática de Categoría**: Analiza la pregunta del usuario y detecta automáticamente su categoría legal



### 🎨 Diseño Moderno├── frontend/          # Aplicación React + Vite- **Respuestas Automáticas**: Base de datos de preguntas frecuentes con respuestas verificadas por abogados

- **Interfaz Responsiva**: Funciona en móvil, tablet y desktop

- **TailwindCSS**: Estilos modernos y consistentes│   ├── src/           # Código fuente- **Similitud Semántica**: Algoritmo de similitud para encontrar preguntas relacionadas

- **Animaciones Suaves**: Transiciones elegantes

│   ├── public/        # Archivos estáticos

### 🔐 Autenticación Completa

- **Email/Password**: Registro e inicio de sesión│   └── package.json### 💳 Pasarela de Pagos Integrada

- **OAuth2**: Google y Microsoft

- **JWT Tokens**: 15 min acceso, 7 días refresh├── backend/           # API Node.js + Express- **Stripe Integration**: Sistema de pagos seguro y confiable

- **Rutas Protegidas**: Acceso autorizado

│   ├── src/           # Código fuente- **Checkout Simplificado**: Proceso de compra rápido y eficiente

## 🏗️ Estructura del Proyecto

│   └── package.json- **Confirmación Inmediata**: Recepción instantánea de confirmación de pago

```

BarbWeb/├── .github/           # GitHub Actions

├── frontend/              # React + TypeScript + Vite

│   ├── src/└── app.yaml           # Config Digital Ocean### 🎨 Diseño Moderno

│   │   ├── components/    # Header, Footer, PrivateRoute

│   │   ├── pages/         # HomePage, FAQPage, LoginPage, CheckoutPage```- **Interfaz No-Cuadriculada**: Diseño fluido y agradable, no basado en grillas simples

│   │   ├── store/         # Zustand global state

│   │   ├── services/      # Backend API calls- **Responsivo**: Funciona perfectamente en móvil, tablet y desktop

│   │   ├── types/         # TypeScript definitions

│   │   ├── theme/         # Theme configuration## 🚀 Inicio Rápido- **TailwindCSS**: Estilos modernos y consistentes

│   │   ├── layouts/       # ClassicLayout, MinimalistLayout

│   │   └── styles/        # Global CSS- **Animaciones Suaves**: Transiciones elegantes entre elementos

│   └── package.json

│### Frontend

├── backend/               # Express + TypeScript + Prisma

│   ├── src/```bash### 📱 Responsive Design

│   │   ├── routes/        # API endpoints (auth, api)

│   │   ├── middleware/    # Auth, error handlerscd frontend- Mobile-first approach

│   │   ├── services/      # Business logic (auth, OpenAI)

│   │   ├── utils/         # FAQ database, OAuth helpersnpm install- Menú adaptable para dispositivos pequeños

│   │   └── db/            # Database initialization

│   ├── prisma/npm run dev- Formularios optimizados para todos los tamaños de pantalla

│   │   ├── schema.prisma  # Database models

│   │   ├── migrations/    # Database migrations```

│   │   ├── init.sql       # Initial schema

│   │   └── seed.ts        # Database seeding## 🏗️ Estructura del Proyecto

│   └── package.json

│### Backend

└── .github/               # GitHub configuration

    └── copilot-instructions.md```bash```

```

cd backendbufete-abogados-web/

## 🚀 Inicio Rápido

npm install├── src/

### Prerequisites

- Node.js >= 16npm run dev│   ├── components/

- npm o yarn

- PostgreSQL (o usar DigitalOcean Managed Database)```│   │   ├── Header.tsx          # Navbar principal



### Frontend│   │   └── Footer.tsx          # Pie de página



```bash## 🎨 Stack Tecnológico│   ├── pages/

cd frontend

npm install│   │   ├── HomePage.tsx        # Página de inicio

npm run dev          # http://localhost:5173

npm run build        # Build para producción### Frontend│   │   ├── FAQPage.tsx         # Centro de consultas (el corazón del app)

npm run preview      # Preview del build

```- **React 18** - Framework UI│   │   └── CheckoutPage.tsx    # Página de pago



### Backend- **TypeScript** - Tipado estático│   ├── store/



```bash- **Vite** - Build tool rápido│   │   └── appStore.ts         # Estado global con Zustand

cd backend

npm install- **TailwindCSS** - Estilos modernos│   ├── types/

npm run dev          # http://localhost:3000

npm run build        # Build para producción- **React Router v6** - Navegación│   │   └── index.ts            # Definiciones de tipos TypeScript

```

- **Zustand** - Estado global│   ├── utils/

## 🛠️ Configuración de Ambiente

- **Lucide Icons** - Iconografía│   │   └── faqMatcher.ts       # Lógica de detección y matching de preguntas

### Backend (.env)

│   ├── styles/

```env

# Database### Backend│   │   └── globals.css         # Estilos globales

DATABASE_URL=postgresql://user:password@host:5432/barbweb

- **Node.js** - Runtime│   ├── App.tsx                 # Componente raíz

# Server

PORT=3000- **Express** - Framework web│   └── main.tsx                # Punto de entrada

NODE_ENV=development

FRONTEND_URL=http://localhost:5173- **TypeScript** - Tipado estático├── index.html                  # HTML principal



# JWT- **Google Gemini AI** - Inteligencia artificial├── vite.config.ts              # Configuración de Vite

JWT_SECRET=your-secret-key-here

JWT_REFRESH_SECRET=your-refresh-secret-here- **@google/generative-ai** - SDK oficial├── tailwind.config.ts          # Configuración de TailwindCSS



# OAuth - Google├── postcss.config.js           # Configuración de PostCSS

GOOGLE_CLIENT_ID=your-client-id

GOOGLE_CLIENT_SECRET=your-client-secret## 💡 Características Principales├── tsconfig.json               # Configuración de TypeScript

GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

└── package.json                # Dependencias y scripts

# OAuth - Microsoft

MICROSOFT_CLIENT_ID=your-client-id### 🤖 Agente Legal IA```

MICROSOFT_CLIENT_SECRET=your-client-secret

MICROSOFT_REDIRECT_URI=http://localhost:3000/auth/microsoft/callback- Análisis automático de preguntas legales



# Gemini AI- Detección de categoría (Civil, Penal, Laboral, etc.)## 🚀 Instalación y Setup

GEMINI_API_KEY=your-gemini-api-key

```- Evaluación de complejidad



### Frontend (.env.local)- Respuesta orientativa inmediata### Requisitos Previos



```env- Recomendación inteligente de consulta profesional- Node.js >= 16

VITE_API_URL=http://localhost:3000

- npm o yarn

# OAuth - Google

VITE_GOOGLE_CLIENT_ID=your-client-id### 💼 Sistema de Conversión



# OAuth - Microsoft- ~80% de casos redirigen a consulta pagada### Pasos de Instalación

VITE_MICROSOFT_CLIENT_ID=your-client-id

VITE_MICROSOFT_REDIRECT_URI=http://localhost:3000/auth/microsoft/callback- Respuesta básica gratuita (genera confianza)

```

- CTA claro para solicitar consulta profesional1. **Clona el repositorio**

## 📦 Stack Tecnológico

- Precio: $29.99 por consulta```bash

### Frontend

- React 18git clone <repository-url>

- TypeScript

- Vite### 🎨 Diseño Corporativocd bufete-abogados-web

- React Router v6

- TailwindCSS- **Colores**: Oro (#d4af37) y Negro (#1a1a1a)```

- Zustand (state management)

- Lucide Icons- **Responsive**: Mobile-first



### Backend- **Moderno**: Gradientes y sombras suaves2. **Instala las dependencias**

- Node.js

- Express- **Profesional**: Tipografía clara y espaciado generoso```bash

- TypeScript

- Prisma ORMnpm install

- PostgreSQL

- JWT## 🌐 Deploy en Digital Ocean```

- Google Gemini AI

- OAuth2 (Google, Microsoft)



## 🔗 API EndpointsLa aplicación se despliega automáticamente desde GitHub (rama `master`).3. **Configura las variables de entorno**



### Authentication```bash

- `POST /auth/register` - Crear cuenta

- `POST /auth/login` - Iniciar sesión- **Frontend**: https://back-jqdv9.ondigitalocean.app/barbweb2/cp .env.example .env.local

- `POST /auth/refresh` - Renovar token

- `POST /auth/logout` - Cerrar sesión- **API**: https://back-jqdv9.ondigitalocean.app/api/```

- `GET /auth/google` - OAuth Google

- `GET /auth/google/callback` - Google callback

- `GET /auth/microsoft` - OAuth Microsoft

- `GET /auth/microsoft/callback` - Microsoft callback### Variables de Entorno RequeridasEdita `.env.local` y añade tu clave pública de Stripe:

- `GET /auth/me` - Obtener usuario actual

- `GET /auth/verify-token` - Verificar token```env```



### APIGEMINI_API_KEY=tu_clave_api_geminiVITE_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_aqui

- `POST /api/ask` - Hacer pregunta (IA + FAQ matching)

- `GET /api/health` - Health checkPORT=3000```



## 📊 Base de DatosNODE_ENV=production



### Models```### Desarrollo Local

- **User**: Usuarios registrados con email/password

- **OAuthAccount**: Cuentas vinculadas con OAuth

- **RefreshToken**: Tokens de refresco para JWT

- **Payment**: Historial de pagos## 📊 Flujo de Usuario```bash

- **FAQ**: Preguntas frecuentes

- **CustomAgent**: Agentes personalizadosnpm run dev



## 🚢 Despliegue``````



### DigitalOcean App PlatformUsuario hace pregunta



```bash    ↓La aplicación se abrirá en `http://localhost:5173`

# Configurar variables de ambiente en DigitalOcean

# Todas las variables VITE_ deben tener prefijo VITE_IA analiza (Gemini 2.5 Flash Lite)



# Hacer push a GitHub (auto-redeploy)    ↓## 📚 Cómo Funciona el Sistema de Preguntas

git push origin master

```Muestra respuesta básica orientativa



## 📚 Documentación Adicional    ↓### 1. **Flujo de Usuario**



- `ROADMAP_PROFESSIONAL.md` - Roadmap completo del proyectoEvalúa complejidad```

- `PROGRESS_REPORT.md` - Reporte de progreso actual

- `CLEANUP_AND_ERROR_HANDLING.md` - Plan de limpieza y error handling    ↓Usuario hace pregunta

- `.github/copilot-instructions.md` - Instrucciones para desarrollo

Si es complejo → Recomienda consulta profesional ($29.99)        ↓

## ✅ Status del Proyecto

    ↓Detección automática de categoría

### Fase 1: Foundation ✅ COMPLETADA (40%)

- ✅ Database schema y modelsUsuario solicita consulta        ↓

- ✅ JWT authentication system

- ✅ Email/password login y register    ↓Búsqueda en base de datos FAQ

- ✅ OAuth2 Google y Microsoft

- ✅ Protected routesPasarela de pago (Stripe - próximamente)        ↓

- ✅ User session management

- ✅ Token persistence    ↓┌─ Respuesta encontrada → Mostrar respuesta automática



**Progreso: 40% (4 semanas de ~10 estimadas)**Abogado recibe consulta organizada por categoría│



### Fase 2: Payments (PRÓXIMA)```└─ Sin respuesta → Redireccionar a checkout para consulta profesional

- Stripe backend integration

- Stripe frontend checkout```

- Email notifications

- Admin panel## 📂 Categorías Legales



## 📄 Licencia### 2. **Base de Datos de FAQs**



Proyecto privado - Todos los derechos reservados- CivilUbicada en `src/utils/faqMatcher.ts`, contiene:



## 👨‍💼 Equipo- Penal- Preguntas comunes organizadas por categoría



- **Developer**: Santiago (@DAMSanti)- Laboral- Respuestas verificadas por expertos

- **Client**: Bufete Jurídico

- Administrativo- Palabras clave para detección automática

- Mercantil

- Familia### 3. **Categorías Legales Soportadas**

- Tributario- 🏛️ **Derecho Civil**: Daños, responsabilidad civil, contratos

- ⚖️ **Derecho Penal**: Procedimientos penales, derechos del detenido

## 📝 API Endpoints- 👔 **Derecho Laboral**: Despidos, conflictos laborales

- 📋 **Derecho Administrativo**: Recursos administrativos

### POST /api/filter-question- 💼 **Derecho Mercantil**: Contratos comerciales

Analiza pregunta y devuelve:- 👨‍👩‍👧 **Derecho de Familia**: Divorcios, custodia, herencias

- Categoría legal

- Respuesta breve## 💳 Integración de Stripe

- Necesidad de consulta profesional

- Complejidad (simple/medium/complex)### Setup Inicial

- Razonamiento1. Crea una cuenta en [stripe.com](https://stripe.com)

2. Obtén tu clave pública de prueba (pk_test_...)

### POST /api/generate-response3. Añádela a `.env.local`

Genera respuesta detallada para una categoría específica.

### Implementación del Checkout

### GET /api/healthEl componente `CheckoutPage.tsx` incluye:

Health check del servidor.- Validación de datos del cliente

- Interfaz de tarjeta (actualmente mockup)

## 🔧 Desarrollo- Procesamiento simulado de pagos

- Confirmación y recepción de consulta

### Requisitos

- Node.js >= 16### Próximas Mejoras para Producción

- npm o yarn```typescript

- Cuenta de Google Cloud (Gemini API)// Integración real de Stripe.js

import { loadStripe } from '@stripe/stripe-js'

### Instalaciónimport { Elements, CardElement, useStripe } from '@stripe/react-stripe-js'

```bash

# Clonar repositorioconst stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

git clone https://github.com/DAMSanti/BarbWeb.git```

cd BarbWeb

## 🛠️ Tecnologías Utilizadas

# Instalar dependencias frontend

cd frontend| Tecnología | Propósito |

npm install|-----------|----------|

| **React** | Framework UI |

# Instalar dependencias backend| **TypeScript** | Tipado estático |

cd ../backend| **Vite** | Build tool ultra-rápido |

npm install| **React Router** | Enrutamiento |

| **TailwindCSS** | Estilos CSS utility-first |

# Configurar variables de entorno| **Zustand** | Estado global ligero |

cp .env.example .env| **Lucide Icons** | Iconografía moderna |

# Editar .env con tus credenciales| **Stripe** | Pagos online |

```

## 📱 Páginas Principales

### Scripts Útiles

### 🏠 HomePage

**Frontend:**- Información del bufete

```bash- Características principales

npm run dev       # Desarrollo (http://localhost:5173)- Área de especialización

npm run build     # Build producción- Call-to-action a consultas

npm run preview   # Preview build

npm run lint      # Linter### ❓ FAQPage (Centro de Consultas)

```- Barra de búsqueda de preguntas

- Filtros por categoría

**Backend:**- Sistema de detección automática

```bash- Respuestas inmediatas o redirección a pago

npm run dev       # Desarrollo (http://localhost:3000)

npm run build     # Compilar TypeScript### 💳 CheckoutPage

npm start         # Producción- Resumen de la consulta

```- Formulario de datos del cliente

- Interfaz de pago

## 📖 Documentación Detallada- Confirmación de pago exitoso



- [Frontend README](./frontend/README.md)## 🎯 Casos de Uso

- [Backend README](./backend/README.md)

### Caso 1: Pregunta con Respuesta Automática

## 👥 Información del Bufete```

Usuario: "¿Cuándo puedo reclamar daños y perjuicios?"

**Bárbara & Abogados**  Sistema: Detecta "Civil" → Busca en FAQ → Muestra respuesta automática

Dña. Bárbara Blasco García```



📍 C/ Castrillo de la Reina, 7  ### Caso 2: Pregunta sin Respuesta Automática

Torre Levante 3ºA  ```

34672 Zarzosa (Palencia)Usuario: "¿Es válido el despido que recibí ayer sin causa?"

Sistema: Detecta "Laboral" → No hay match exacto → Redirige a checkout

📞 +34 672 122 452  Usuario: Realiza pago de $29.99 → Consulta se registra

✉️ legalbar@legalbar.esAbogado: Recibe la consulta y responde en 48 horas

```

## 📄 Licencia

## 🔐 Seguridad

Copyright © 2025 Bárbara & Abogados. Todos los derechos reservados.

- ✅ Encriptación SSL de 256 bits
- ✅ Variables de entorno para datos sensibles
- ✅ Validación de datos en cliente
- ✅ HTTPS recomendado en producción
- ✅ Datos de pago procesados por Stripe (PCI DSS compliant)

## 📈 Próximas Mejoras

- [ ] Backend Node.js/Express para gestión de consultas
- [ ] Base de datos MongoDB para almacenar consultas y respuestas
- [ ] Email notifications para confirmaciones
- [ ] Panel de administración para abogados
- [ ] Sistema de ratings y reviews
- [ ] Chat en vivo con abogados
- [ ] Historial de consultas para usuarios registrados
- [ ] Multi-idioma support
- [ ] Integración de IA (GPT) para respuestas más inteligentes

## 📞 Soporte

Para problemas o sugerencias:
- Email: info@bufete.es
- Teléfono: +34 900 000 000

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Equipo

Desarrollado por el equipo del Bufete Jurídico como una solución moderna para democratizar el acceso a consultas legales.

---

**Nota**: Este es un proyecto frontend. Para producción, se requiere un backend que gestione:
- Almacenamiento de consultas
- Verificación de pagos con Stripe
- Notificaciones por email
- Gestión de casos para abogados
- Base de datos de FAQs
