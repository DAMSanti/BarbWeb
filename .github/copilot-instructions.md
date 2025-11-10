# Instrucciones para Copilot - Bufete Jurídico

## Contexto del Proyecto

Este es un proyecto React/Vite con TypeScript para una plataforma de consultas legales en línea. La característica principal es un sistema inteligente de filtrado de preguntas que:

1. Detecta automáticamente la categoría legal de la pregunta
2. Busca en una base de datos de FAQs
3. Proporciona respuestas automáticas cuando encuentra coincidencias
4. Redirige a una pasarela de pagos para consultas profesionales

## Características Principales

- **Sistema de Filtrado Inteligente**: En `src/utils/faqMatcher.ts`
- **Gestión de Estado**: Zustand en `src/store/appStore.ts`
- **Integración de Stripe**: En `src/pages/CheckoutPage.tsx`
- **Diseño Moderno**: TailwindCSS con colores personalizados
- **Tipado Fuerte**: TypeScript en todo el proyecto

## Stack Tecnológico

- React 18
- TypeScript
- Vite
- React Router v6
- TailwindCSS
- Zustand
- Lucide Icons
- Stripe (para pagos)

## Estructura de Carpetas

```
src/
├── components/     # Componentes reutilizables (Header, Footer)
├── pages/          # Páginas principales (Home, FAQ, Checkout)
├── store/          # Gestión de estado global con Zustand
├── types/          # Definiciones de tipos TypeScript
├── utils/          # Funciones auxiliares (faqMatcher para IA)
└── styles/         # Estilos globales
```

## Base de Datos de FAQs

Las preguntas frecuentes se encuentran en `src/utils/faqMatcher.ts` bajo `faqDatabase`. Cada categoría tiene:
- Preguntas reales de clientes
- Respuestas verificadas por expertos
- ID único para referencia

## Colores del Tema

- **Primario**: Azul (primary-500: #0284c7, primary-600: #0369a1)
- **Acento**: Púrpura/Magenta (accent-500: #d946ef)
- **Fondos**: Gradientes suaves, sin cuadrículas

## Flujos Principales

### 1. Búsqueda de Preguntas
```
HomePage → FAQPage → Escribir pregunta → Sistema detecta categoría
→ Si hay FAQ match → Mostrar respuesta → Opción de consulta pagada
→ Si no hay match → Ir directo a CheckoutPage
```

### 2. Proceso de Pago
```
CheckoutPage → Rellenar datos → Pago Stripe → Confirmación
→ Email de confirmación → Abogado recibe consulta
```

## Reglas de Desarrollo

1. **TypeScript**: Siempre tipear variables, funciones y componentes
2. **Componentes**: Usar functional components con hooks
3. **Estilos**: Usar clases de TailwindCSS, nunca CSS puro (excepto globals.css)
4. **Nombrado**: PascalCase para componentes, camelCase para variables/funciones
5. **Imports**: Usar alias `@` si está disponible (no está configurado ahora, usar rutas relativas)

## Próximas Tareas

- [ ] Integración real de Stripe.js
- [ ] Backend Node.js/Express
- [ ] Autenticación de usuarios
- [ ] Panel de administración
- [ ] Email notifications
- [ ] Tests unitarios

## Ambiente

- Node.js >= 16
- npm o yarn
- Variables en `.env.local`

## Comandos Principales

```bash
npm run dev       # Desarrollo local
npm run build     # Build producción
npm run lint      # Verificar código
npm run preview   # Preview de producción
```

## Importante

- El checkout es un mockup por ahora
- Los pagos no se procesan realmente (necesita backend)
- Las consultas se guardan en el estado del cliente (localStorage para persistencia)
- No hay autenticación de usuarios
