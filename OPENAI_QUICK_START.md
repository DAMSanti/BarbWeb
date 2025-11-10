# ⚡ INICIO RÁPIDO - OpenAI Integration

## 📋 Checklist de Setup (5 minutos)

- [ ] Obtener API Key de OpenAI
- [ ] Configurar `.env.local` en carpeta `server/`
- [ ] Instalar dependencias del backend: `cd server && npm install`
- [ ] Instalar dependencias del frontend: `npm install` (root)
- [ ] Ejecutar backend: `cd server && npm run dev`
- [ ] Ejecutar frontend: `npm run dev`
- [ ] Probar en http://localhost:5173/faq

---

## 🔑 Obtener API Key (2 min)

1. Ve a https://platform.openai.com/
2. Inicia sesión (o crea cuenta)
3. Settings → API keys
4. "Create new secret key"
5. Copia la clave (empieza con `sk_`)

---

## 📝 Configurar Backend (1 min)

En carpeta `server/`, crea `.env.local`:

```env
PORT=3000
NODE_ENV=development
OPENAI_API_KEY=sk_test_PEGA_TU_CLAVE_AQUI
FRONTEND_URL=http://localhost:5173
```

---

## 🚀 Ejecutar (2 min)

### Terminal 1 (Backend):
```powershell
cd server
npm install
npm run dev
```

Verás: `✅ Server running on http://localhost:3000`

### Terminal 2 (Frontend):
```powershell
npm install
npm run dev
```

Verás: `http://localhost:5173/`

---

## ✅ Probar

1. Abre http://localhost:5173/
2. Ve a Consultas
3. Pregunta: "¿Cómo reclamar daños y perjuicios?"
4. Deberías ver una respuesta automática con:
   - 📂 Categoría: Civil
   - 🔍 Confianza: XX%
   - 💡 Análisis de OpenAI

---

## 💬 Ejemplos de Preguntas para Probar

✅ **Con respuesta automática:**
- "¿Cómo puedo reclamar daños y perjuicios?"
- "¿Cuándo puedo presentar una demanda?"
- "¿Cuáles son mis derechos si me detienen?"

❌ **Sin respuesta automática (irá a pago):**
- "Mi jefe hizo X cosa muy específica"
- "En mi caso personal, sucedió..."
- "¿Cómo es exactamente el procedimiento en mi situación?"

---

## 📊 Costos

- 1,000 preguntas: ~$0.08
- 10,000 preguntas: ~$0.75
- 100,000 preguntas: ~$7.50

Super barato. No habrá sorpresas.

---

## 🐛 Si Algo Falla

### Backend no conecta:
```powershell
# En carpeta server
npm install
npm run dev
```

### OpenAI error "API key invalid":
- Verifica `.env.local` en carpeta `server/`
- Copia bien la clave
- Reinicia

### CORS error:
- Asegúrate que `FRONTEND_URL=http://localhost:5173` en `.env.local`
- Reinicia backend

### Frontend no ve respuestas:
- Abre DevTools (F12) → Console
- Verifica que no hay errores rojos
- Recarga página

---

## 📚 Documentación Completa

- `OPENAI_SETUP.md` - Guía detallada
- `server/README.md` - Documentación del backend
- `README.md` - Documentación general

---

## 🎉 ¡Listo!

Tu app de consultas legales ahora tiene **verdadera IA**.

```
✅ Frontend React (localhost:5173)
✅ Backend Express (localhost:3000)  
✅ OpenAI GPT-4o Mini (inteligencia)
✅ FAQs locales (respuestas rápidas)
✅ Stripe (pagos)
```

**Preguntas frecuentes** reciben respuesta automática de IA.
**Casos complejos** van a consulta profesional pagada.

🚀 ¡A hacer dinero con IA!
