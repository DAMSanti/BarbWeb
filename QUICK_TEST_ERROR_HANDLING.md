# 🚀 QUICK START - Cómo Verificar Error Handling

**Tiempo total: 5 minutos**

---

## 1️⃣ Inicia el Backend

```bash
cd backend
npm run dev
```

**Esperado en console:**
```
✅ Server running on http://0.0.0.0:3000
✔️ Validation: ✅ Zod schemas ready
📝 Logging: ✅ Winston logger configured
💾 Database: ✅ Connected and initialized
```

---

## 2️⃣ Inicia el Frontend (otra terminal)

```bash
cd frontend
npm run dev
```

**Esperado en console:**
```
VITE v5.4.21  ready in 567 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

## 3️⃣ Abre el Navegador

```
http://localhost:5173/barbweb2
```

---

## 4️⃣ Prueba 1: Error Validación

**Paso A: Clickea "Iniciar Sesión" en Header**

**Paso B: Ingresa datos inválidos**
```
Email: invalid
Password: anything
```

**Paso C: Click "Iniciar Sesión"**

**Esperado:**
```
⚠️ Email inválido
```

**❌ NO deberías ver:**
```json
{"success":false,"error":"Error interno..."}
```

---

## 5️⃣ Prueba 2: Campos Vacíos

**Ingresa:**
```
Email: (vacío)
Password: (vacío)
```

**Esperado:**
```
⚠️ Por favor completa todos los campos
```

---

## 6️⃣ Prueba 3: Dev Console

**Abre Dev Tools (F12)**

```
Console tab → Ver logs
```

**Esperado:**
```
[ERROR] LoginPage.handleSubmit: Email inválido
```

**❌ NO deberías ver:**
```
Uncaught Error: ...
```

---

## 7️⃣ Prueba 4: Network Tab

**Abre Dev Tools (F12)**

```
Network tab → Refill form → Submit
```

**Busca: POST /auth/login**

**Esperado:**
```
Status: 422
Response: {statusCode: 422, message: "Validation failed", ...}
```

**La UI convierte esto a:**
```
⚠️ Email inválido
```

---

## ✅ CHECKLIST (5 min)

- [ ] Backend corre sin errores
- [ ] Frontend corre sin errores
- [ ] LoginPage carga
- [ ] Email inválido → "Email inválido"
- [ ] Campos vacíos → "Por favor completa todos los campos"
- [ ] Network tab muestra 422
- [ ] Dev console muestra [ERROR]
- [ ] NO hay JSON en UI
- [ ] TODO ES EN ESPAÑOL

---

## 🎯 RESULTADO

Si pasas todos los checks:

✅ **ERROR HANDLING CORRECTAMENTE IMPLEMENTADO**

---

## 🆘 Si Algo No Funciona

### Problema: Veo JSON en UI

**Solución:**
```bash
# 1. Verifica que el build está actualizado
cd frontend && npm run build

# 2. Limpia caché
rm -rf frontend/dist
npm run build

# 3. Recarga el navegador (Ctrl+Shift+R)
```

### Problema: Backend no corre

**Solución:**
```bash
# 1. Instala dependencias
cd backend && npm install

# 2. Inicia el dev server
npm run dev

# 3. Verifica puerto 3000 no está en uso
lsof -i :3000
```

### Problema: Frontend no corre

**Solución:**
```bash
# 1. Instala dependencias
cd frontend && npm install

# 2. Inicia el dev server
npm run dev

# 3. Verifica puerto 5173 no está en uso
lsof -i :5173
```

---

## 📊 Documento Completo

Para más detalles, ver:
- `TESTING_GUIDE.md` - Tests detallados
- `FIX_ERROR_HANDLING_INTEGRATION.md` - Explicación técnica
- `ANTES_DESPUES_ERROR_HANDLING.md` - Comparación visual
- `FRONTEND_ERROR_HANDLING.md` - Arquitectura completa

---

**¡Listo!** Ya puedes testear el error handling en 5 minutos.
