# 🏛️ Bufete Jurídico - Plataforma de Consultas Legales

Una plataforma web moderna para un bufete de abogados que ofrece consultas legales rápidas, seguras y accesibles. Con un sistema inteligente de filtrado de preguntas que proporciona respuestas automáticas cuando es posible, o facilita la conexión con abogados profesionales a través de una pasarela de pagos segura.

## ✨ Características Principales

### 🤖 Sistema Inteligente de Filtrado
- **Detección Automática de Categoría**: Analiza la pregunta del usuario y detecta automáticamente su categoría legal
- **Respuestas Automáticas**: Base de datos de preguntas frecuentes con respuestas verificadas por abogados
- **Similitud Semántica**: Algoritmo de similitud para encontrar preguntas relacionadas

### 💳 Pasarela de Pagos Integrada
- **Stripe Integration**: Sistema de pagos seguro y confiable
- **Checkout Simplificado**: Proceso de compra rápido y eficiente
- **Confirmación Inmediata**: Recepción instantánea de confirmación de pago

### 🎨 Diseño Moderno
- **Interfaz No-Cuadriculada**: Diseño fluido y agradable, no basado en grillas simples
- **Responsivo**: Funciona perfectamente en móvil, tablet y desktop
- **TailwindCSS**: Estilos modernos y consistentes
- **Animaciones Suaves**: Transiciones elegantes entre elementos

### 📱 Responsive Design
- Mobile-first approach
- Menú adaptable para dispositivos pequeños
- Formularios optimizados para todos los tamaños de pantalla

## 🏗️ Estructura del Proyecto

```
bufete-abogados-web/
├── src/
│   ├── components/
│   │   ├── Header.tsx          # Navbar principal
│   │   └── Footer.tsx          # Pie de página
│   ├── pages/
│   │   ├── HomePage.tsx        # Página de inicio
│   │   ├── FAQPage.tsx         # Centro de consultas (el corazón del app)
│   │   └── CheckoutPage.tsx    # Página de pago
│   ├── store/
│   │   └── appStore.ts         # Estado global con Zustand
│   ├── types/
│   │   └── index.ts            # Definiciones de tipos TypeScript
│   ├── utils/
│   │   └── faqMatcher.ts       # Lógica de detección y matching de preguntas
│   ├── styles/
│   │   └── globals.css         # Estilos globales
│   ├── App.tsx                 # Componente raíz
│   └── main.tsx                # Punto de entrada
├── index.html                  # HTML principal
├── vite.config.ts              # Configuración de Vite
├── tailwind.config.ts          # Configuración de TailwindCSS
├── postcss.config.js           # Configuración de PostCSS
├── tsconfig.json               # Configuración de TypeScript
└── package.json                # Dependencias y scripts
```

## 🚀 Instalación y Setup

### Requisitos Previos
- Node.js >= 16
- npm o yarn

### Pasos de Instalación

1. **Clona el repositorio**
```bash
git clone <repository-url>
cd bufete-abogados-web
```

2. **Instala las dependencias**
```bash
npm install
```

3. **Configura las variables de entorno**
```bash
cp .env.example .env.local
```

Edita `.env.local` y añade tu clave pública de Stripe:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_aqui
```

### Desarrollo Local

```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:5173`

## 📚 Cómo Funciona el Sistema de Preguntas

### 1. **Flujo de Usuario**
```
Usuario hace pregunta
        ↓
Detección automática de categoría
        ↓
Búsqueda en base de datos FAQ
        ↓
┌─ Respuesta encontrada → Mostrar respuesta automática
│
└─ Sin respuesta → Redireccionar a checkout para consulta profesional
```

### 2. **Base de Datos de FAQs**
Ubicada en `src/utils/faqMatcher.ts`, contiene:
- Preguntas comunes organizadas por categoría
- Respuestas verificadas por expertos
- Palabras clave para detección automática

### 3. **Categorías Legales Soportadas**
- 🏛️ **Derecho Civil**: Daños, responsabilidad civil, contratos
- ⚖️ **Derecho Penal**: Procedimientos penales, derechos del detenido
- 👔 **Derecho Laboral**: Despidos, conflictos laborales
- 📋 **Derecho Administrativo**: Recursos administrativos
- 💼 **Derecho Mercantil**: Contratos comerciales
- 👨‍👩‍👧 **Derecho de Familia**: Divorcios, custodia, herencias

## 💳 Integración de Stripe

### Setup Inicial
1. Crea una cuenta en [stripe.com](https://stripe.com)
2. Obtén tu clave pública de prueba (pk_test_...)
3. Añádela a `.env.local`

### Implementación del Checkout
El componente `CheckoutPage.tsx` incluye:
- Validación de datos del cliente
- Interfaz de tarjeta (actualmente mockup)
- Procesamiento simulado de pagos
- Confirmación y recepción de consulta

### Próximas Mejoras para Producción
```typescript
// Integración real de Stripe.js
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
```

## 🛠️ Tecnologías Utilizadas

| Tecnología | Propósito |
|-----------|----------|
| **React** | Framework UI |
| **TypeScript** | Tipado estático |
| **Vite** | Build tool ultra-rápido |
| **React Router** | Enrutamiento |
| **TailwindCSS** | Estilos CSS utility-first |
| **Zustand** | Estado global ligero |
| **Lucide Icons** | Iconografía moderna |
| **Stripe** | Pagos online |

## 📱 Páginas Principales

### 🏠 HomePage
- Información del bufete
- Características principales
- Área de especialización
- Call-to-action a consultas

### ❓ FAQPage (Centro de Consultas)
- Barra de búsqueda de preguntas
- Filtros por categoría
- Sistema de detección automática
- Respuestas inmediatas o redirección a pago

### 💳 CheckoutPage
- Resumen de la consulta
- Formulario de datos del cliente
- Interfaz de pago
- Confirmación de pago exitoso

## 🎯 Casos de Uso

### Caso 1: Pregunta con Respuesta Automática
```
Usuario: "¿Cuándo puedo reclamar daños y perjuicios?"
Sistema: Detecta "Civil" → Busca en FAQ → Muestra respuesta automática
```

### Caso 2: Pregunta sin Respuesta Automática
```
Usuario: "¿Es válido el despido que recibí ayer sin causa?"
Sistema: Detecta "Laboral" → No hay match exacto → Redirige a checkout
Usuario: Realiza pago de $29.99 → Consulta se registra
Abogado: Recibe la consulta y responde en 48 horas
```

## 🔐 Seguridad

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
