# Configuración de Variables de Entorno en DigitalOcean - PASO A PASO

## Problema: "Microsoft OAuth no está configurado"

Esto significa que las variables `MICROSOFT_CLIENT_ID` y/o `MICROSOFT_CLIENT_SECRET` no están en DigitalOcean.

## Solución - Agregar Variables a DigitalOcean

### PASO 1: Ir a DigitalOcean Console

1. Ve a https://cloud.digitalocean.com
2. Inicia sesión
3. Ve a **App Platform**
4. Selecciona tu app (BarbWeb)

### PASO 2: Acceder a Environment Variables

1. Dentro de tu app, ve a la pestaña **Settings**
2. En el menú izquierdo, haz click en **Environment Variables**
3. Deberías ver una tabla con las variables actuales

### PASO 3: Agregar/Actualizar Variables

Para cada variable, haz click en **"Edit"** o **"Add Variable"**:

#### GOOGLE OAuth:
```
Variable Name: GOOGLE_CLIENT_ID
Value: 312191800375-bogtq5k90qlveluaut2408ram3n5v6h.apps.googleusercontent.com

Variable Name: GOOGLE_CLIENT_SECRET
Value: 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

Variable Name: GOOGLE_REDIRECT_URI
Value: https://back-jqdv9.ondigitalocean.app/auth/google/callback
```

#### MICROSOFT OAuth:
```
Variable Name: MICROSOFT_CLIENT_ID
Value: 4c8d46e4-de09-421b-872f-fd42c21fca0b

Variable Name: MICROSOFT_CLIENT_SECRET
Value: 7I58Q~Y70uqqUxLy91lsivGe8hbPJnPJ6SAG-aos

Variable Name: MICROSOFT_REDIRECT_URI
Value: https://back-jqdv9.ondigitalocean.app/auth/microsoft/callback
```

#### FRONTEND:
```
Variable Name: FRONTEND_URL
Value: https://back-jqdv9.ondigitalocean.app/barbweb2/
```

### PASO 4: Guardar y Redeploy

1. Después de agregar cada variable, haz click en **"Save"**
2. DigitalOcean debería mostrar un mensaje diciendo "Trigger deploy?"
3. Haz click en **"Deploy"**
4. Espera 2-3 minutos a que el redeploy termine

### PASO 5: Verificar Configuración

Una vez que el redeploy haya terminado:

1. Abre en tu navegador:
   ```
   https://back-jqdv9.ondigitalocean.app/auth/debug/config
   ```

2. Deberías ver algo como:
   ```json
   {
     "google": {
       "has_client_id": true,
       "has_client_secret": true,
       "has_redirect_uri": true,
       "client_id_preview": "312191800...",
       "redirect_uri": "https://back-jqdv9.ondigitalocean.app/auth/google/callback"
     },
     "microsoft": {
       "has_client_id": true,
       "has_client_secret": true,
       "has_redirect_uri": true,
       "client_id_preview": "4c8d46e4-...",
       "redirect_uri": "https://back-jqdv9.ondigitalocean.app/auth/microsoft/callback"
     },
     "frontend_url": "https://back-jqdv9.ondigitalocean.app/barbweb2/",
     "port": "3000",
     "node_env": "production"
   }
   ```

3. Si alguno muestra `false` o `MISSING`, esa variable no está configurada correctamente.

## Si Aún No Funciona

1. **Verifica que estén todas las variables** usando el endpoint debug
2. **Reinicia la app:**
   - Settings → App → Click el botón "..." → "Restart"
3. **Limpia el cache del navegador:**
   - Presiona Ctrl+Shift+Delete
   - Borra cookies y cache
   - Recarga la página
4. **Prueba nuevamente** los botones de OAuth

## Variables Requeridas - Checklist

- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET  
- [ ] GOOGLE_REDIRECT_URI
- [ ] MICROSOFT_CLIENT_ID
- [ ] MICROSOFT_CLIENT_SECRET
- [ ] MICROSOFT_REDIRECT_URI
- [ ] FRONTEND_URL
- [ ] DATABASE_URL
- [ ] JWT_SECRET
- [ ] JWT_REFRESH_SECRET

## Troubleshooting

| Problema | Solución |
|----------|----------|
| "Microsoft OAuth no está configurado" | Verifica que MICROSOFT_CLIENT_ID y MICROSOFT_CLIENT_SECRET estén en DigitalOcean |
| "Google OAuth no está configurado" | Verifica que GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET estén en DigitalOcean |
| Las variables están pero no funcionan | Haz un restart de la app en DigitalOcean |
| Sigue sin funcionar después de restart | Verifica con el endpoint debug si realmente están las variables |
