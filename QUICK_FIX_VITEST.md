# 🎯 Flujo Correcto - Setup Testing en DO

## El Problema que Tuviste

```
vitest: not found
```

**Causa**: Las dependencias npm no estaban instaladas.

---

## ✅ El Flujo Correcto (3 pasos)

### Paso 1: Instalar Dependencias

```bash
cd ~/barbweb/backend

# Instalar todo (Vitest, Playwright, etc.)
npm ci
# o: npm install
```

**Esto instala**:
- ✅ vitest
- ✅ @vitest/coverage-v8
- ✅ @playwright/test
- ✅ playwright
- ✅ Todas las otras dependencias

**Tiempo**: 2-3 minutos

**Resultado esperado**:
```
added 450+ packages in 2m
```

### Paso 2: Correr Tests

```bash
# Tests unitarios + integración
npm run test

# O con cobertura
npm run test:coverage

# O en modo watch
npm run test:watch
```

### Paso 3: Ver Resultados

```bash
# Coverage report
npm run test:coverage

# Descargar si quieres ver en tu laptop
scp -r user@server:~/barbweb/backend/coverage ./
```

---

## 🚀 Comando Completo (de una vez)

```bash
cd ~/barbweb/backend && npm ci && npm run test
```

---

## 🎬 TL;DR

Si ves error `vitest: not found`:

```bash
npm ci
npm run test
```

**¡Listo!** 🎉

---

## ❓ Por qué Pasó?

- El `package.json` tiene `vitest@^4.0.8` listado
- Pero los `node_modules/` no estaban creados/instalados
- Cuando hiciste `npm run test`, npm no encontró vitest
- **Solución**: `npm ci` o `npm install` crea `node_modules/`

---

**Próximo paso en DO**:

```bash
cd ~/barbweb/backend
npm ci
npm run test
```
