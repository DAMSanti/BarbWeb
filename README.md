# 🏛️ Barbara & Abogados - Plataforma de Consultas Legales# 🏛️ Bufete Jurídico - Plataforma de Consultas Legales



Plataforma web para consultas legales en línea con sistema inteligente de filtrado de preguntas usando IA.Una plataforma web moderna para un bufete de abogados que ofrece consultas legales rápidas, seguras y accesibles. Con un sistema inteligente de filtrado de preguntas que proporciona respuestas automáticas cuando es posible, o facilita la conexión con abogados profesionales a través de una pasarela de pagos segura.



## 🏗️ Estructura del Proyecto## ✨ Características Principales



```### 🤖 Sistema Inteligente de Filtrado

BarbWeb/- **Detección Automática de Categoría**: Analiza la pregunta del usuario y detecta automáticamente su categoría legal

├── frontend/          # Aplicación React + Vite- **Respuestas Automáticas**: Base de datos de preguntas frecuentes con respuestas verificadas por abogados

│   ├── src/           # Código fuente- **Similitud Semántica**: Algoritmo de similitud para encontrar preguntas relacionadas

│   ├── public/        # Archivos estáticos

│   └── package.json### 💳 Pasarela de Pagos Integrada

├── backend/           # API Node.js + Express- **Stripe Integration**: Sistema de pagos seguro y confiable

│   ├── src/           # Código fuente- **Checkout Simplificado**: Proceso de compra rápido y eficiente

│   └── package.json- **Confirmación Inmediata**: Recepción instantánea de confirmación de pago

├── .github/           # GitHub Actions

└── app.yaml           # Config Digital Ocean### 🎨 Diseño Moderno

```- **Interfaz No-Cuadriculada**: Diseño fluido y agradable, no basado en grillas simples

- **Responsivo**: Funciona perfectamente en móvil, tablet y desktop

## 🚀 Inicio Rápido- **TailwindCSS**: Estilos modernos y consistentes

- **Animaciones Suaves**: Transiciones elegantes entre elementos

### Frontend

```bash### 📱 Responsive Design

cd frontend- Mobile-first approach

npm install- Menú adaptable para dispositivos pequeños

npm run dev- Formularios optimizados para todos los tamaños de pantalla

```

## 🏗️ Estructura del Proyecto

### Backend

```bash```

cd backendbufete-abogados-web/

npm install├── src/

npm run dev│   ├── components/

```│   │   ├── Header.tsx          # Navbar principal

│   │   └── Footer.tsx          # Pie de página

## 🎨 Stack Tecnológico│   ├── pages/

│   │   ├── HomePage.tsx        # Página de inicio

### Frontend│   │   ├── FAQPage.tsx         # Centro de consultas (el corazón del app)

- **React 18** - Framework UI│   │   └── CheckoutPage.tsx    # Página de pago

- **TypeScript** - Tipado estático│   ├── store/

- **Vite** - Build tool rápido│   │   └── appStore.ts         # Estado global con Zustand

- **TailwindCSS** - Estilos modernos│   ├── types/

- **React Router v6** - Navegación│   │   └── index.ts            # Definiciones de tipos TypeScript

- **Zustand** - Estado global│   ├── utils/

- **Lucide Icons** - Iconografía│   │   └── faqMatcher.ts       # Lógica de detección y matching de preguntas

│   ├── styles/

### Backend│   │   └── globals.css         # Estilos globales

- **Node.js** - Runtime│   ├── App.tsx                 # Componente raíz

- **Express** - Framework web│   └── main.tsx                # Punto de entrada

- **TypeScript** - Tipado estático├── index.html                  # HTML principal

- **Google Gemini AI** - Inteligencia artificial├── vite.config.ts              # Configuración de Vite

- **@google/generative-ai** - SDK oficial├── tailwind.config.ts          # Configuración de TailwindCSS

├── postcss.config.js           # Configuración de PostCSS

## 💡 Características Principales├── tsconfig.json               # Configuración de TypeScript

└── package.json                # Dependencias y scripts

### 🤖 Agente Legal IA```

- Análisis automático de preguntas legales

- Detección de categoría (Civil, Penal, Laboral, etc.)## 🚀 Instalación y Setup

- Evaluación de complejidad

- Respuesta orientativa inmediata### Requisitos Previos

- Recomendación inteligente de consulta profesional- Node.js >= 16

- npm o yarn

### 💼 Sistema de Conversión

- ~80% de casos redirigen a consulta pagada### Pasos de Instalación

- Respuesta básica gratuita (genera confianza)

- CTA claro para solicitar consulta profesional1. **Clona el repositorio**

- Precio: $29.99 por consulta```bash

git clone <repository-url>

### 🎨 Diseño Corporativocd bufete-abogados-web

- **Colores**: Oro (#d4af37) y Negro (#1a1a1a)```

- **Responsive**: Mobile-first

- **Moderno**: Gradientes y sombras suaves2. **Instala las dependencias**

- **Profesional**: Tipografía clara y espaciado generoso```bash

npm install

## 🌐 Deploy en Digital Ocean```



La aplicación se despliega automáticamente desde GitHub (rama `master`).3. **Configura las variables de entorno**

```bash

- **Frontend**: https://back-jqdv9.ondigitalocean.app/barbweb2/cp .env.example .env.local

- **API**: https://back-jqdv9.ondigitalocean.app/api/```



### Variables de Entorno RequeridasEdita `.env.local` y añade tu clave pública de Stripe:

```env```

GEMINI_API_KEY=tu_clave_api_geminiVITE_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_aqui

PORT=3000```

NODE_ENV=production

```### Desarrollo Local



## 📊 Flujo de Usuario```bash

npm run dev

``````

Usuario hace pregunta

    ↓La aplicación se abrirá en `http://localhost:5173`

IA analiza (Gemini 2.5 Flash Lite)

    ↓## 📚 Cómo Funciona el Sistema de Preguntas

Muestra respuesta básica orientativa

    ↓### 1. **Flujo de Usuario**

Evalúa complejidad```

    ↓Usuario hace pregunta

Si es complejo → Recomienda consulta profesional ($29.99)        ↓

    ↓Detección automática de categoría

Usuario solicita consulta        ↓

    ↓Búsqueda en base de datos FAQ

Pasarela de pago (Stripe - próximamente)        ↓

    ↓┌─ Respuesta encontrada → Mostrar respuesta automática

Abogado recibe consulta organizada por categoría│

```└─ Sin respuesta → Redireccionar a checkout para consulta profesional

```

## 📂 Categorías Legales

### 2. **Base de Datos de FAQs**

- CivilUbicada en `src/utils/faqMatcher.ts`, contiene:

- Penal- Preguntas comunes organizadas por categoría

- Laboral- Respuestas verificadas por expertos

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
