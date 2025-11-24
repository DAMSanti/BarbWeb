# 🔐 Security Quick Fixes — BarbWeb

**Fecha**: 24 de Noviembre de 2025  
**Responsable**: Security Team  
**Status**: ✅ COMPLETADO

---

## 📋 Cambios Implementados

### 1️⃣ CORS Cambio a Modo Restrictivo ✅

**Problema**: CORS estaba en modo debug (`ALLOW_ALL_CORS=1`), permitiendo requests desde cualquier origen.

**Solución**:
- ✅ Cambiar `ALLOW_ALL_CORS` a `"0"` en `app.yaml`
- ✅ Backend ahora solo acepta requests de:
  - `VITE_FRONTEND_URL` (producción)
  - `http://localhost:5173` (desarrollo local)
  - `http://localhost:3000` (alternativa desarrollo)

**Impacto**: 
- ✅ Seguridad mejorada contra CSRF
- ✅ Más restrictivo, pero funcional para clientes autorizados
- ⚠️ Si el frontend está en un origen diferente, actualizar `VITE_FRONTEND_URL`

**Verificación**:
```bash
# Local test: should work
curl -H "Origin: http://localhost:5173" https://back-jqdv9.ondigitalocean.app/health

# Should fail: from different origin
curl -H "Origin: https://malicious.com" https://back-jqdv9.ondigitalocean.app/health
# Response: 403 Forbidden (CORS blocked)
```

---

### 2️⃣ Validación de JWT Secrets ✅

**Problema**: JWT secrets pueden contener espacios o caracteres inválidos durante copy/paste en DigitalOcean UI.

**Solución**:
- ✅ Crear script `validate-secrets.js` que verifica:
  - JWT_SECRET existe y tiene ≥32 caracteres
  - JWT_REFRESH_SECRET existe y tiene ≥32 caracteres
  - STRIPE_SECRET_KEY existe y tiene ≥20 caracteres
  - NINGUNO contiene espacios (es el problema más común)
  - Alertas si contiene caracteres sospechosos

**Uso**:
```bash
cd backend
npm run validate:secrets
```

**Output esperado si OK**:
```
✅ All secrets validated successfully!
   - JWT_SECRET: valid
   - JWT_REFRESH_SECRET: valid
   - STRIPE_SECRET_KEY: valid

✓ Ready for production deployment
```

**Output si hay error**:
```
🔴 VALIDATION FAILED:
   ❌ JWT_SECRET contains WHITESPACE — this is a common copy/paste issue
   Raw value starts with: "abc123 def456"
```

---

## 🚀 Cómo Desplegar Estos Cambios

### En DigitalOcean App Platform

1. **Verificar que ALLOW_ALL_CORS está en 0**:
   - Abrir DO App → Components → Environment tab
   - Buscar `ALLOW_ALL_CORS`
   - Cambiar a `0` (o crear si no existe)
   - Save

2. **Rotar/Verificar JWT secrets**:
   - Abrir DO App → Components → Environment tab
   - Verificar `JWT_SECRET` y `JWT_REFRESH_SECRET`:
     - Deben ser strings largos (≥32 caracteres)
     - NO deben tener espacios
     - Si fueron copiados sin cuidado, rotar con new ones

3. **Ejecutar validación en container**:
   - DO App → Components → "Run command" button
   - Ejecutar:
     ```bash
     cd /workspace/backend && npm run validate:secrets
     ```
   - Si sale ✅, está OK
   - Si sale ❌, revisar y corregir envs

4. **Hacer deploy**:
   - Cambiar a rama `master` y hacer push a GitHub
   - DO App Platform auto-despliega
   - O hacer click en "Deploy" en el UI

---

## 📊 Verificación Completa (Checklist)

- [ ] ✅ Cambio en `app.yaml`: `ALLOW_ALL_CORS = "0"`
- [ ] ✅ Script creado: `backend/scripts/validate-secrets.js`
- [ ] ✅ Script añadido a `package.json`: `npm run validate:secrets`
- [ ] 🚀 En DigitalOcean:
  - [ ] Actualizar env `ALLOW_ALL_CORS` a `0`
  - [ ] Verificar `JWT_SECRET` (sin espacios)
  - [ ] Verificar `JWT_REFRESH_SECRET` (sin espacios)
  - [ ] Ejecutar `npm run validate:secrets` en container
  - [ ] Hacer deploy

---

## 🔒 Seguridad Post-Fix

### ✅ Ahora Protegido
- ✅ CORS restrictivo (solo frontend autorizado)
- ✅ JWT secrets validados (no hay espacios)
- ✅ Rate limiting activo (3 niveles)
- ✅ Helmet security headers
- ✅ HSTS activo (1 año)
- ✅ CSP personalizado
- ✅ Stripe webhooks con firma verificada

### ⚠️ Próximas Mejoras (Post-Launch)
- ⏳ Email verification flow
- ⏳ Password reset with email validation
- ⏳ 2FA / MFA support
- ⏳ Audit logging
- ⏳ Rate limiting refinement

---

## 🧪 Testing

### Local Test - CORS

```bash
# Test 1: Frontend local development (debería pasar)
curl -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS http://localhost:3000/health -v

# Test 2: Different origin (debería fallar con CORS error)
curl -H "Origin: https://evil.com" \
  -X GET http://localhost:3000/health -v
```

### DO Test - Secrets Validation

```bash
# Acceder al container de DO (Run Command)
cd /workspace/backend && npm run validate:secrets

# Output esperado:
# ✅ All secrets validated successfully!
```

---

## 📝 Notas

- Los cambios se aplican en el próximo deploy
- Si hay CORS issues después de deploy, revisar que `VITE_FRONTEND_URL` esté correcto
- Si hay JWT issues, revisar envs en DO (buscar espacios/caracteres raros)
- El script `validate-secrets.js` se puede ejecutar en DO "Run Command" antes de deploy

---

**Checklist de Despliegue**:
- [ ] Cambios committeados y pusheados a master
- [ ] DO App actualizado (ALLOW_ALL_CORS = 0)
- [ ] JWT secrets verificados
- [ ] `npm run validate:secrets` ejecutado y pasó ✅
- [ ] Deploy completado
- [ ] Test de CORS realizado
- [ ] Health check respondiendo correctamente

**Fecha completado**: 24 Nov 2025  
**Próxima revisión**: Después de primer deploy en producción
