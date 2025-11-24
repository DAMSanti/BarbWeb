# 📦 Instalar Vitest Manualmente

## ✅ Opción 1: Instalar Todo de package.json (Recomendado)

```bash
cd ~/barbweb/backend

# Instalar TODAS las dependencias (incluyendo vitest)
npm install
```

**Tiempo**: 2-3 minutos  
**Instala**: vitest + 400+ packages más

---

## ⚡ Opción 2: Instalar Solo Vitest

```bash
cd ~/barbweb/backend

# Instalar SOLO vitest
npm install vitest@4.0.8 --save-dev
```

**Tiempo**: 30 segundos  
**Instala**: Solo vitest y sus dependencias

---

## ⚡ Opción 3: Instalar Vitest + Coverage

```bash
cd ~/barbweb/backend

# Instalar vitest y coverage juntos
npm install vitest@4.0.8 @vitest/coverage-v8@4.0.8 --save-dev
```

**Tiempo**: 1 minuto  
**Instala**: vitest + coverage (necesario para `npm run test:coverage`)

---

## 🎯 Mi Recomendación

### Si quieres solo hacer tests:
```bash
npm install vitest@4.0.8 --save-dev
npm run test
```

### Si quieres hacer tests + ver cobertura:
```bash
npm install vitest@4.0.8 @vitest/coverage-v8@4.0.8 --save-dev
npm run test:coverage
```

### Si quieres todo (lo correcto):
```bash
npm install
npm run test
```

---

## ✅ Verificar que se instaló

```bash
# Ver que vitest está instalado
npm list vitest

# O ver el binario
ls node_modules/.bin/vitest

# O simplemente correr un test
npm run test
```

**Resultado esperado**:
```
✓ tests/unit/... 
✓ tests/integration/...
```

---

## 🚀 Comandos Rápidos

```bash
# Instalar TODO
npm install

# Instalar solo vitest
npm install vitest@4.0.8 --save-dev

# Instalar vitest + coverage
npm install vitest@4.0.8 @vitest/coverage-v8@4.0.8 --save-dev

# Correr tests después
npm run test
```

---

## 📝 ¿Cuál Elegir?

| Opción | Comando | Usa Si... |
|--------|---------|----------|
| **1** | `npm install` | Quieres TODO (recomendado) |
| **2** | `npm install vitest@4.0.8 --save-dev` | Solo quieres tests rápido |
| **3** | `npm install vitest@4.0.8 @vitest/coverage-v8@4.0.8 --save-dev` | Quieres tests + cobertura |

---

## 🎬 Flujo Completo (recomendado)

```bash
cd ~/barbweb/backend
npm install
npm run test
npm run test:coverage
```

---

**Próximo paso en DO**: Elige una opción arriba y ejecuta ⬆️
