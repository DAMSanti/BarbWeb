# 🔧 Problema: "vitest: not found" aunque npm install dice "up to date"

## El Problema Real

- ✅ Vitest está en `package.json`
- ✅ npm dice "up to date"
- ❌ Pero `npm run test` dice "vitest: not found"

**Causa**: El `package-lock.json` está desincronizado o corrupto.

---

## ✅ Solución (Limpiar y Reinstalar)

### Paso 1: Borrar package-lock.json

```bash
cd ~/barbweb/backend

# Borrar los archivos de caché
rm -f package-lock.json
rm -rf node_modules

# En Windows (PowerShell)
Remove-Item -Path package-lock.json -Force
Remove-Item -Path node_modules -Recurse -Force
```

### Paso 2: Limpiar caché de npm

```bash
npm cache clean --force
```

### Paso 3: Reinstalar TODO desde cero

```bash
npm install
```

**Esto va a:**
- Crear un nuevo `package-lock.json`
- Instalar vitest correctamente
- Instalar todos los packages

**Tiempo**: 3-5 minutos

### Paso 4: Verificar que vitest está

```bash
# Ver que vitest existe
ls node_modules/.bin/vitest

# O correr tests
npm run test
```

---

## 🚀 Comando Completo de Una Vez

```bash
cd ~/barbweb/backend && \
rm -f package-lock.json && \
rm -rf node_modules && \
npm cache clean --force && \
npm install && \
npm run test
```

---

## 🆘 Si Sigue Sin Funcionar

### Opción 1: Verificar que npm está correctamente

```bash
npm --version          # Debe ser 10.x
node --version         # Debe ser 20.x
which npm              # Ver dónde está npm

# Actualizar npm si es necesario
npm install -g npm@10
```

### Opción 2: Instalar npx manualmente

```bash
# A veces npx no funciona bien, intenta:
node node_modules/.bin/vitest run
```

### Opción 3: Usar npx explícitamente

```bash
# En lugar de: npm run test
# Intenta: 
npx vitest run
npx vitest run --coverage
```

---

## 📝 Resumen de Solución

```
1. Borrar package-lock.json     (rm -f package-lock.json)
2. Borrar node_modules          (rm -rf node_modules)
3. Limpiar caché npm            (npm cache clean --force)
4. Reinstalar                   (npm install)
5. Correr tests                 (npm run test)
```

---

## ✨ Después de Esto

Si npm install termina y dice `up to date`:

```bash
# Verificar que vitest existe
ls -la node_modules/.bin/ | grep vitest

# Debería mostrar:
# vitest -> ../vitest/vitest.mjs
```

---

**Próximo paso en DO**: Ejecuta los comandos de "Comando Completo" arriba ⬆️
