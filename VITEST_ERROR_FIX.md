# 🚨 Error de Vitest - Solución

## El Problema

```
sh i1: vitest: not found
npm error Lifecycle script 'test' failed with error:
```

**Causa**: Las dependencias no están instaladas. `vitest` está en `package.json` pero no en `node_modules/`.

---

## ✅ Solución - 3 Opciones

### Opción 1: npm ci (Recomendado)

```bash
cd ~/barbweb/backend

# Limpiar caché e instalar
npm ci
```

**Qué hace:**
- Descarga exactamente las versiones especificadas en `package-lock.json`
- Más confiable que `npm install`
- Más rápido si `node_modules` ya existe

**Resultado esperado:**
```
added 450+ packages in 15s
```

### Opción 2: npm install

```bash
cd ~/barbweb/backend

# Instalar dependencias
npm install
```

**Nota**: Puede que actualice versiones. `npm ci` es preferible.

### Opción 3: Limpiar y reinstalar

```bash
cd ~/barbweb/backend

# Borrar node_modules y caché
rm -rf node_modules
npm cache clean --force

# Reinstalar
npm install
```

**Usa esto si `npm ci` falla.**

---

## 🔍 Verificar que se instaló

```bash
# Ver que vitest existe
ls node_modules/.bin/vitest

# O ver que vitest está en package.json
grep -i vitest package.json

# Ver todas las devDependencies instaladas
npm ls --depth=0 | grep -E "vitest|@vitest|playwright"
```

**Resultado esperado:**
```
├── @vitest/coverage-v8@4.0.8
├── @playwright/test@1.56.1
└── vitest@4.0.8
```

---

## 🚀 Luego Intenta los Tests

```bash
# Una vez instaladas las dependencias
npm run test

# O con cobertura
npm run test:coverage
```

---

## 📝 Resumen

```
1. npm ci                  (instalar dependencias)
2. npm run test            (correr tests)
3. npm run test:coverage   (ver cobertura)
```

---

**Próximo paso**: Ejecuta `npm ci` en tu servidor DO 🚀
