# 🚀 GUÍA COMPLETA: OpenAI + React Frontend + Express Backend

## 📦 Estructura Final del Proyecto

```
BarbWeb/
├── src/                    # Frontend React
│   ├── pages/
│   │   └── FAQPage.tsx    # Ahora usa API backend
│   ├── services/
│   │   └── backendApi.ts  # Cliente HTTP para backend
│   └── ...
├── server/                # Backend Node.js + Express
│   ├── src/
│   │   ├── index.ts       # Servidor principal
│   │   ├── services/
│   │   │   └── openaiService.ts  # Integración OpenAI
│   │   ├── routes/
│   │   │   └── api.ts     # Rutas API
│   │   └── utils/
│   │       └── faqDatabase.ts
│   ├── package.json
│   └── .env.local
├── package.json           # Frontend
├── vite.config.ts
└── ...
```

## 🎯 PASO 1: Obtener API Key de OpenAI

### 1.1 Crear Cuenta

1. Ve a https://platform.openai.com/signup
2. Crea una cuenta o inicia sesión
3. Verifica tu email

### 1.2 Crear API Key

1. Ve a https://platform.openai.com/account/api-keys
2. Haz clic en "Create new secret key"
3. Dale un nombre: `BarbWeb Development`
4. **Copia la clave** (solo aparece una vez!)
5. Guárdala en un lugar seguro

**Ejemplo de clave:**
```
sk_test_abcdefgh123456789...
```

### 1.3 Configurar Créditos

1. Ve a https://platform.openai.com/account/billing/overview
2. Añade método de pago (tarjeta de crédito)
3. (Opcional) Configura límites de gastos en Settings → Billing limits

> ⚠️ Con el uso actual (~$0.75/mes para 10,000 consultas), los costos son mínimos

---

## 🔧 PASO 2: Configurar Backend

### 2.1 Instalar Dependencias del Backend

```powershell
# Navega a la carpeta server
cd server

# Instala dependencias
npm install
```

### 2.2 Configurar Variables de Entorno

```powershell
# Copia el archivo de ejemplo
Copy-Item .env.example .env.local

# Edita el archivo (abre con VS Code)
notepad .env.local
```

**Contenido de `.env.local` (complétalo):**
```env
PORT=3000
NODE_ENV=development
OPENAI_API_KEY=sk_test_TU_CLAVE_AQUI
FRONTEND_URL=http://localhost:5173
```

Reemplaza `sk_test_TU_CLAVE_AQUI` con tu clave real de OpenAI.

### 2.3 Compilar TypeScript (Opcional)

```powershell
npm run build
```

---

## 🚀 PASO 3: Ejecutar Backend

### Terminal 1: Backend

```powershell
cd c:\Users\santiagota\source\repos\BarbWeb\server
npm run dev
```

Deberías ver:
```
✅ Server running on http://localhost:3000
🔗 Frontend CORS enabled for: http://localhost:5173
🤖 OpenAI integration: ✅ Configured
```

---

## 🌐 PASO 4: Ejecutar Frontend

### Terminal 2: Frontend

```powershell
cd c:\Users\santiagota\source\repos\BarbWeb
npm install  # Si no lo has hecho ya
npm run dev
```

Deberías ver:
```
➜  Local:   http://localhost:5173/
```

---

## ✅ PASO 5: Probar la Integración

### 5.1 Test Manual

1. Abre http://localhost:5173/
2. Ve a "Consultas" o "/faq"
3. Prueba estas preguntas:
   - "¿Cómo reclamar daños y perjuicios?" → ✅ Respuesta automática
   - "¿Cuáles son mis derechos si me detienen?" → ✅ Respuesta automática
   - "Mi caso especial" → Ir a checkout (sin respuesta automática)

### 5.2 Verificar Conexión Backend

Abre en el navegador:
```
http://localhost:3000/api/health
```

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 5.3 Ver Logs

En la terminal del backend, verás logs de cada petición:
```
POST /api/filter-question - 200 OK
```

---

## 🎓 ¿Cómo Funciona el Sistema?

### Cuando el usuario hace una pregunta:

```
Usuario escribe: "¿Cuándo puedo reclamar daños?"
    ↓
Frontend envía a http://localhost:3000/api/filter-question
    ↓
Backend recibe petición
    ↓
Llama a OpenAI GPT-4o Mini
    ↓
OpenAI devuelve:
  - Categoría: "Civil"
  - Confianza: 0.95
  - Razonamiento: "Pregunta sobre responsabilidad civil"
    ↓
Backend busca en base de datos local
    ↓
Encuentra FAQ coincidente
    ↓
Devuelve respuesta al frontend
    ↓
Frontend muestra: "✅ Respuesta automática encontrada"
```

---

## 💬 Flujo de Conversación en FAQPage

### Caso 1: Pregunta con Respuesta Automática

```
User input: "¿Cómo reclamar daños?"
Backend response: {
  category: "Civil",
  hasAutoResponse: true,
  autoResponse: "Para reclamar debe demostrar...",
  confidence: 0.95,
  reasoning: "Pregunta sobre reclamación de daños"
}

Frontend muestra:
✅ Respuesta Inteligente
📂 Categoría: Civil
🔍 Confianza: 95%
💡 Análisis: Pregunta sobre reclamación de daños

[Solicitar Consulta Profesional ($29.99)]
```

### Caso 2: Pregunta sin Respuesta Automática

```
User input: "Mi empleador hizo algo muy específico"
Backend response: {
  category: "Laboral",
  hasAutoResponse: false,
  autoResponse: null,
  confidence: 0.75,
  reasoning: "Caso específico sin respuesta genérica"
}

Frontend redirige a: /checkout/:consultationId
Usuario completa formulario y paga
```

---

## 🔍 Entender los Parámetros de Respuesta

Cuando OpenAI analiza una pregunta, devuelve:

```typescript
{
  category: string           // "Civil", "Penal", etc.
  hasAutoResponse: boolean   // ¿Hay respuesta preparada?
  autoResponse?: string      // La respuesta (si existe)
  reasoning: string          // Por qué se eligió esa categoría
  confidence: number         // 0.0 a 1.0 (confianza en la respuesta)
}
```

**Confianza:**
- 0.9-1.0: Muy seguro
- 0.7-0.9: Bastante seguro
- 0.5-0.7: Moderadamente seguro
- < 0.5: No hay respuesta automática

---

## 📊 Monitorear Uso de OpenAI

### Ver Gastos

1. Ve a https://platform.openai.com/account/billing/usage
2. Verás un gráfico del uso
3. Cada petición suma un poquito al total

### Limitar Gastos

1. Ve a https://platform.openai.com/account/billing/limits
2. Configura "Hard limit" a $10/mes por ejemplo
3. Si alcanzas el límite, las peticiones se rechazarán

---

## 🐛 Solucionar Problemas

### Error: "Cannot connect to backend"

**En Frontend console:**
```
Error calling backend: Error: Failed to fetch
```

**Solución:**
- Verifica que backend está corriendo: `npm run dev` en terminal server
- Verifica que está en puerto 3000
- Recarga la página (Ctrl+Shift+R)

### Error: "OpenAI API key not valid"

**Backend logs:**
```
Error filtering question with AI: Invalid API key
```

**Solución:**
- Ve a `.env.local` en carpeta `server/`
- Verifica que copiaste bien la clave de OpenAI
- Asegúrate de que comienza con `sk_`
- Reinicia: `npm run dev`

### Error: "Rate limit exceeded"

**Response:**
```json
{
  "error": "Rate limit exceeded"
}
```

**Solución:**
- Espera 1 minuto
- Reintenta
- Comprueba tu plan en OpenAI

### Backend muestra: "OpenAI integration: ❌ Not configured"

**Solución:**
- La clave de OpenAI no está en `.env.local`
- O el archivo `.env.local` no existe
- Verifica ambos

---

## 📈 Próximos Pasos

Una vez que todo funciona:

1. **Entrenar con más FAQs**: Añade más preguntas a `faqDatabase.ts`
2. **Cambiar modelo**: Actualiza a GPT-4 en `openaiService.ts` para más precisión
3. **Persistencia**: Migra a MongoDB para guardar consultas
4. **Autenticación**: Añade login de usuarios
5. **Deploy**: Sube a Vercel (frontend) + Railway (backend)

---

## 🎉 ¡Listo!

Tu sistema está funcionando con inteligencia artificial real. 

**Resumen:**
- ✅ Frontend React en http://localhost:5173
- ✅ Backend Express en http://localhost:3000
- ✅ Integración con OpenAI GPT-4o Mini
- ✅ Base de datos de FAQs en backend
- ✅ API REST funcionando

**Cualquier pregunta, revisa:**
- Backend README: `server/README.md`
- Frontend README: `README.md`
- Copilot Instructions: `.github/copilot-instructions.md`
