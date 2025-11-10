# Frontend - Barbara & Abogados

Frontend React + Vite + TypeScript para la plataforma de consultas legales.

## Stack Tecnológico

- **React 18** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **TailwindCSS** - Estilos
- **React Router** - Navegación
- **Zustand** - Estado global
- **Lucide Icons** - Iconografía

## Comandos

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview

# Linter
npm run lint
```

## Estructura

```
src/
├── components/     # Componentes reutilizables
│   ├── Header.tsx
│   └── Footer.tsx
├── pages/          # Páginas principales
│   ├── HomePage.tsx
│   ├── FAQPage.tsx
│   └── CheckoutPage.tsx
├── store/          # Zustand store
│   └── appStore.ts
├── services/       # API calls
│   └── backendApi.ts
├── types/          # TypeScript types
│   └── index.ts
├── utils/          # Utilidades
│   └── faqMatcher.ts
└── styles/         # Estilos globales
    └── globals.css
```

## Colores Corporativos

- **Oro**: `#d4af37` (primary)
- **Negro**: `#1a1a1a` (dark)

## Deploy

El frontend se construye automáticamente en Digital Ocean y se sirve desde `/barbweb2/`.
