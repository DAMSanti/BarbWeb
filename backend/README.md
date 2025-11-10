# Backend - Barbara & Abogados# 🚀 Backend - Bufete Jurídico



Backend Node.js + Express + TypeScript para la API de consultas legales.Backend de Node.js + Express que integra OpenAI GPT-4o Mini para análisis inteligente de preguntas legales.



## Stack Tecnológico## 📋 Características



- **Node.js** - Runtime- ✅ Integración con OpenAI GPT-4o Mini

- **Express** - Framework web- ✅ Detección automática de categoría legal

- **TypeScript** - Tipado estático- ✅ Búsqueda en base de datos local de FAQs

- **Google Gemini AI** - Inteligencia artificial- ✅ Generación de respuestas detalladas

- **@google/generative-ai** - SDK de Gemini- ✅ API REST con CORS

- ✅ TypeScript para seguridad de tipos

## Comandos

## 📁 Estructura

```bash

# Instalar dependencias```

npm installserver/

├── src/

# Desarrollo│   ├── index.ts              # Servidor Express principal

npm run dev│   ├── routes/

│   │   └── api.ts            # Rutas de API

# Build para producción│   ├── services/

npm run build│   │   └── openaiService.ts  # Integración con OpenAI

│   └── utils/

# Iniciar en producción│       └── faqDatabase.ts    # Base de datos de FAQs

npm start├── package.json

```├── tsconfig.json

└── .env.example

## Estructura```



```## 🔧 Instalación

src/

├── routes/         # Endpoints de la API### 1. Instalar dependencias

│   └── api.ts

├── services/       # Lógica de negocio```bash

│   └── openaiService.ts (Gemini AI)cd server

├── utils/          # Utilidadesnpm install

│   └── faqDatabase.ts```

└── index.ts        # Entry point

```### 2. Configurar variables de entorno



## Variables de Entorno```bash

cp .env.example .env.local

```env```

PORT=3000

NODE_ENV=productionEdita `.env.local` y añade:

GEMINI_API_KEY=tu_api_key_aquí

FRONTEND_URL=https://tu-dominio.com```env

```PORT=3000

NODE_ENV=development

## API EndpointsOPENAI_API_KEY=sk_test_tu_clave_aqui

FRONTEND_URL=http://localhost:5173

### POST /api/filter-question```

Analiza una pregunta legal con IA y devuelve:

- Categoría legal### 3. Obtener API Key de OpenAI

- Respuesta breve orientativa

- Recomendación de consulta profesional1. Ve a https://platform.openai.com/

- Nivel de complejidad2. Inicia sesión o crea una cuenta

3. Ve a "API keys" en settings

### POST /api/generate-response4. Haz clic en "Create new secret key"

Genera una respuesta detallada para una categoría específica.5. Copia la clave (comienza con `sk_`)

6. Pégala en `.env.local`

### GET /api/health

Health check del servidor.> ⚠️ **Importante**: Nunca compartas tu API key. No la subas a GitHub.



## Modelo de IA## ▶️ Ejecutar el Servidor



Usando **Gemini 2.5 Flash Lite**:### Desarrollo (con hot reload)

- Rápido y económico

- Especializado en derecho español```bash

- Orientado a conversión (recomienda consulta profesional en ~80% de casos)npm run dev

```

## Deploy

El servidor estará disponible en `http://localhost:3000`

Se despliega automáticamente en Digital Ocean desde GitHub (rama master).

### Producción

```bash
npm run build
npm start
```

## 📡 API Endpoints

### POST /api/filter-question

Analiza una pregunta legal y detecta su categoría.

**Request:**
```json
{
  "question": "¿Cuándo puedo reclamar daños y perjuicios?"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "question": "¿Cuándo puedo reclamar daños y perjuicios?",
    "category": "Civil",
    "hasAutoResponse": true,
    "autoResponse": "Para reclamar daños y perjuicios debe demostrar...",
    "reasoning": "Pregunta sobre responsabilidad civil y reclamación",
    "confidence": 0.95
  }
}
```

### POST /api/generate-response

Genera una respuesta detallada para una pregunta específica.

**Request:**
```json
{
  "question": "¿Cuáles son mis derechos si me detienen?",
  "category": "Penal"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "question": "¿Cuáles son mis derechos si me detienen?",
    "category": "Penal",
    "response": "Si te detienen tienes derecho a..."
  }
}
```

### GET /api/health

Health check del servidor.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🎯 Flujo de Datos

```
1. Frontend envía pregunta
    ↓
2. Backend recibe y valida
    ↓
3. OpenAI analiza la pregunta
    ↓
4. Backend busca en FAQ local
    ↓
5. Si hay match → Retorna respuesta local
   Si no → OpenAI genera respuesta
    ↓
6. Frontend muestra resultado
```

## 💰 Costos de OpenAI

- **GPT-4o Mini**: $0.15 por 1M tokens de entrada
- **Consulta típica**: ~500 tokens = $0.000075
- **1,000 consultas/mes**: ~$0.075
- **10,000 consultas/mes**: ~$0.75

## 🔐 Seguridad

- ✅ API key en variables de entorno
- ✅ CORS configurado solo para frontend
- ✅ Validación de entrada
- ✅ Manejo de errores

## 🚀 Deploy

### Opción 1: Heroku (Gratis con limitaciones)

```bash
# Instala Heroku CLI
# Inicia sesión
heroku login

# Crea app
heroku create tu-app-name

# Deploy
git push heroku main
```

### Opción 2: Railway

1. Ve a railway.app
2. Conecta tu GitHub
3. Deploy automático

### Opción 3: Vercel Functions

Aunque Vercel es principalmente para frontend, también permite serverless functions.

## 🐛 Troubleshooting

### Error: "Cannot find module 'express'"
```bash
npm install
```

### Error: "OpenAI API key not found"
- Verifica que `.env.local` existe
- Verifica que la variable `OPENAI_API_KEY` tiene tu clave
- Reinicia el servidor

### Error: "CORS blocked"
- Asegúrate que `FRONTEND_URL` en `.env.local` es correcto
- Por defecto es `http://localhost:5173`

### Error: "API rate limit"
- Espera un poco y reintenta
- Aumenta el límite de requests en OpenAI dashboard

## 📊 Monitoreo

Para ver logs del servidor:

```bash
# En desarrollo con npm run dev, los logs aparecen en terminal
# En producción:
npm run build
npm start  # Los logs aparecerán aquí
```

## 🎓 Aprender Más

- Express: https://expressjs.com/
- OpenAI: https://platform.openai.com/docs
- TypeScript: https://www.typescriptlang.org/

## 📝 Notas

- El backend usa GPT-4o Mini para mantener costos bajos
- Puedes cambiar a GPT-4 o GPT-3.5 en `openaiService.ts`
- La base de datos de FAQs es local (puedes migrar a MongoDB)

---

**Backend listo. Ahora ejecuta `npm run dev` en la carpeta `server/`**
