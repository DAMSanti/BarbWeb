# 🔑 Google OAuth Setup - Paso a Paso

## Tu URL en DigitalOcean

Según tus logs, tu app está corriendo en:

```
https://back-jqdv9.ondigitalocean.app
```

**IMPORTANTE**: Usa esta URL exacta en Google Cloud Console.

---

## ✅ Paso 1: Ir a Google Cloud Console

1. Ve a: https://console.cloud.google.com/
2. Haz login con tu cuenta Google

---

## ✅ Paso 2: Crear/Seleccionar Proyecto

1. En la parte superior, click en **"Select a Project"**
2. Click en **"NEW PROJECT"**
3. Nombre: `BarbWeb` (o lo que prefieras)
4. Click **"CREATE"**
5. Espera a que se cree (unos segundos)

---

## ✅ Paso 3: Habilitar Google+ API

1. En el menú izquierdo, busca **"APIs & Services"**
2. Click en **"APIs & Services"** → **"Library"**
3. Busca: `Google+ API`
4. Click en el resultado
5. Click en botón azul **"ENABLE"**

---

## ✅ Paso 4: Crear OAuth Credentials

1. En el menú izquierdo, click en **"Credentials"**
2. Click en botón **"+ CREATE CREDENTIALS"** (arriba)
3. Selecciona **"OAuth Client ID"**
4. Si aparece un popup de "Configure the OAuth consent screen", click **"CONFIGURE CONSENT SCREEN"**

---

## ✅ Paso 5: Configurar OAuth Consent Screen

1. Elige **"External"** (para testing)
2. Click **"CREATE"**
3. En el formulario:
   - **App name**: `BarbWeb`
   - **User support email**: Tu email
   - **Developer contact information**: Tu email
4. Click **"SAVE AND CONTINUE"**
5. En "Scopes", click **"SAVE AND CONTINUE"** (mantén los defaults)
6. En "Summary", click **"BACK TO DASHBOARD"**

---

## ✅ Paso 6: Crear OAuth Client ID

1. Ve a **"Credentials"** nuevamente
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth Client ID"**
3. En **"Application type"**, selecciona **"Web application"**
4. En **"Name"**, escribe: `BarbWeb Web App`

---

## ✅ Paso 7: Configurar URIs

### En "Authorized JavaScript origins", agrega:

```
https://back-jqdv9.ondigitalocean.app
```

(Esta es la URL de tu app en DigitalOcean)

### En "Authorized redirect URIs", agrega:

```
https://back-jqdv9.ondigitalocean.app/auth/oauth/google/callback
```

(Esta es la ruta específica donde Google redirige después de autenticarse)

---

## ✅ Paso 8: Copiar Credentials

1. Click **"CREATE"**
2. Se abrirá un popup con tus credentials
3. Copia estos dos valores:

```
CLIENT ID: xxx.apps.googleusercontent.com
CLIENT SECRET: xxx
```

**GUARDA ESTOS EN UN LUGAR SEGURO** 🔒

---

## ✅ Paso 9: Agregar a DigitalOcean

1. Ve a DigitalOcean: https://cloud.digitalocean.com/apps
2. Click en tu app `barbweb`
3. Click en **"Settings"**
4. Busca **"Environment Variables"**
5. Click **"Edit"** (ícono de lápiz)
6. Agrega dos variables nuevas:

| Nombre | Valor |
|--------|-------|
| `GOOGLE_CLIENT_ID` | Tu CLIENT ID (xxx.apps.googleusercontent.com) |
| `GOOGLE_CLIENT_SECRET` | Tu CLIENT SECRET |

7. Click **"Save"**
8. Click **"Redeploy"** (botón arriba a la derecha)

---

## 📝 Resumen de URLs

| Campo | Valor |
|-------|-------|
| **JavaScript Origins** | `https://back-jqdv9.ondigitalocean.app` |
| **Redirect URI** | `https://back-jqdv9.ondigitalocean.app/auth/oauth/google/callback` |

---

## ✅ Verificar que Funciona

Después del redeploy, prueba:

```bash
# Test 1: Verificar que el servidor está corriendo
curl https://back-jqdv9.ondigitalocean.app/

# Test 2: Verificar que los OAuth vars están configuradas
# Mira los logs en DigitalOcean
```

Deberías ver en los logs:
```
🔐 JWT Authentication: ✅ Configured (JWT + OAuth2)
```

---

## 🎯 Checklist Final

- [ ] Proyecto creado en Google Cloud Console
- [ ] Google+ API habilitada
- [ ] OAuth Client ID creado
- [ ] Authorized JavaScript Origins: `https://back-jqdv9.ondigitalocean.app`
- [ ] Authorized Redirect URIs: `https://back-jqdv9.ondigitalocean.app/auth/oauth/google/callback`
- [ ] CLIENT ID y CLIENT SECRET copiados
- [ ] Agregados a DigitalOcean Environment Variables
- [ ] Redeploy completado
- [ ] Logs verifican que todo está configurado

---

**¡Listo!** Una vez hagas esto, tu Google OAuth estará completamente funcional 🚀
