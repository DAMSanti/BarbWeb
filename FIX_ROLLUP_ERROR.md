# 🔧 Error: Cannot find module '@rollup/rollup-linux-x64-gnu'

## El Problema

```
Error: Cannot find module '@rollup/rollup-linux-x64-gnu'
Require stack:
  - /workspace/node_modules/rollup/dist/native.js
```

**Causa**: Rollup (dependencia de Vitest) necesita compilar módulos nativos para tu arquitectura Linux, pero falta el binario precompilado.

---

## ✅ Solución (3 Opciones)

### Opción 1: Reinstalar con Build (RECOMENDADO)

```bash
cd ~/barbweb/backend

# Limpiar todo
rm -rf node_modules package-lock.json

# Instalar con build de módulos nativos
npm install --build-from-source

# O más simple, reinstalar Rollup
npm install --save-dev rollup@latest

# Luego correr tests
npm run test
```

**Tiempo**: 5-10 minutos

---

### Opción 2: Actualizar Vitest (ALTERNATIVA)

Vitest tiene una versión más reciente que arregla este bug:

```bash
cd ~/barbweb/backend

# Actualizar Vitest
npm install --save-dev vitest@latest @vitest/coverage-v8@latest

# Correr tests
npm run test
```

**Tiempo**: 2-3 minutos

---

### Opción 3: Usar ESM/CommonJS Fix

```bash
cd ~/barbweb/backend

# Reinstalar todo desde cero
rm -rf node_modules package-lock.json
npm cache clean --force

# Instalar con flags específicos
npm install --legacy-peer-deps

# Luego tests
npm run test
```

---

## 🎯 Mi Recomendación

**Intenta Opción 2 primero** (más rápido):

```bash
npm install --save-dev vitest@latest @vitest/coverage-v8@latest
npm run test
```

**Si no funciona, intenta Opción 1:**

```bash
rm -rf node_modules package-lock.json
npm install --build-from-source
npm run test
```

---

## 📝 Qué es @rollup/rollup-linux-x64-gnu

- Es el **compilador nativo de Rollup para Linux x64 GNU**
- Rollup lo necesita para bundlear código rápidamente
- Vitest depende de Rollup
- El error ocurre cuando falta el binario para tu arquitectura

---

## 🚀 Comando Rápido

```bash
cd ~/barbweb/backend
npm install --save-dev vitest@latest @vitest/coverage-v8@latest
npm run test
```

---

**Próximo paso en DO**: Ejecuta la Opción 2 arriba ⬆️
