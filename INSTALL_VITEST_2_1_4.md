# 🔧 INSTRUCCIONES CLARAS - Instalar Vitest 2.1.4

## El Problema
Vitest 4.0.8 tiene un bug con Rollup en Linux. **Necesitas actualizar a Vitest 2.1.4** que lo arregla.

## ✅ Cómo Instalar (3 Pasos Simples)

### PASO 1: En tu Laptop - Actualizar package-lock.json

```bash
cd ~/barbweb/backend

# BORRAR LOCK FILE VIEJO
rm package-lock.json

# INSTALAR CON VITEST 2.1.4
npm install

# Esto crea un package-lock.json NUEVO con vitest 2.1.4
```

**Resultado esperado**: `added 550+ packages`

### PASO 2: Hacer Git Push

```bash
git add package.json package-lock.json
git commit -m "Upgrade: vitest 4.0.8 -> 2.1.4 (arregla bug de Rollup)"
git push
```

### PASO 3: En DigitalOcean - Usar la Nueva Versión

```bash
cd ~/barbweb/backend

# BORRAR VIEJO
rm -rf node_modules

# INSTALAR NUEVO
npm install

# CORRER TESTS
npm run test
```

**LISTO!** ✅

---

## 📝 Lo Que Cambió

**Antes (ROTO)**:
```json
"vitest": "^4.0.8"
"@vitest/coverage-v8": "^4.0.8"
```

**Ahora (FUNCIONA)**:
```json
"vitest": "^2.1.4"
"@vitest/coverage-v8": "^2.1.4"
```

---

## 🎯 TL;DR

```bash
# En tu laptop
cd ~/barbweb/backend
rm package-lock.json
npm install
git add .
git commit -m "Upgrade vitest"
git push

# En DO
cd ~/barbweb/backend
rm -rf node_modules
npm install
npm run test
```

---

## ✨ Por Qué Vitest 2.1.4?

- ✅ Arregla el bug de Rollup
- ✅ Sin error "@rollup/rollup-linux-x64-gnu"
- ✅ Versión estable y reciente
- ✅ Compatible con tus tests

---

**Ahora debería funcionar de verdad!** 🚀
