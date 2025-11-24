# 🔧 Manual Setup - Si el script falla

Si el script de setup falla por permisos de `sudo`, aquí está el setup manual paso a paso.

## ⚠️ Problema Común

```
scripts/setup-testing.sh: line 42: sudo: command not found
```

**Causa**: No tienes permisos de `sudo` o no está configurado.

**Solución**: Sigue los pasos manuales abajo.

---

## 🚀 Setup Manual en DigitalOcean

### Paso 1: Instalar Dependencias Node

```bash
cd ~/barbweb/backend

# Instalar dependencias npm
npm ci

# o si npm ci no funciona:
npm install
```

**Resultado esperado:** ✅ `node_modules/` creado

### Paso 2: Configurar PostgreSQL (si tienes acceso sudo)

```bash
# Si tienes acceso sudo:
sudo systemctl start postgresql
sudo -u postgres psql << EOF
CREATE USER testuser WITH PASSWORD 'testpass';
CREATE DATABASE barbweb_test OWNER testuser;
ALTER USER testuser CREATEDB;
EOF
```

**Si NO tienes acceso sudo:**
- Contacta a tu admin de DO
- O usa otra BD de test (local SQLite, etc.)
- O salta este paso por ahora

### Paso 3: Instalar Playwright

```bash
# Descargar navegadores de Playwright
npx playwright install

# Esperar a que termine (puede tomar 2-3 min)
```

**Resultado esperado:** ✅ Navegadores descargados

### Paso 4: Generar tipos de Prisma

```bash
# Generar tipos TypeScript
npm run db:generate
```

**Resultado esperado:** ✅ Tipos generados en `node_modules/.prisma`

---

## ✅ Verificar que todo está instalado

```bash
# Verificar dependencias
node --version          # Debe mostrar v20.x
npm --version           # Debe mostrar 10.x
npx --version           # Debe mostrar algo

# Ver que Playwright está instalado
ls -la ~/.cache/ms-playwright/

# Ver que node_modules existe
ls -la node_modules/ | head -20
```

---

## 🎯 Ejecutar Tests

Una vez todo instalado:

```bash
# Tests unitarios + integración
npm run test

# Con cobertura
npm run test:coverage

# E2E tests
npm run test:e2e

# Watch mode (desarrollo)
npm run test:watch
```

---

## 🐛 Troubleshooting Manual

### Problema: "npm ci" falla

```bash
# Intenta esto en lugar de npm ci:
npm install

# Si sigue fallando, limpia caché:
npm cache clean --force
npm install
```

### Problema: PostgreSQL no se conecta

```bash
# Verificar que está corriendo
sudo systemctl status postgresql

# Iniciar si está parado
sudo systemctl start postgresql

# Si fallan, contacta admin:
# - PostgreSQL no está instalado
# - No tienes permisos sudo
# - BD ya existe (intenta DROP DATABASE primero)
```

### Problema: Playwright install falla

```bash
# Instalar dependencias del sistema
sudo apt-get update
sudo apt-get install -y \
    libnss3 \
    libxss1 \
    libasound2 \
    libgconf-2-4

# Luego intentar de nuevo
npx playwright install
```

### Problema: "prisma not found"

```bash
# Regenerar Prisma
npm run db:generate

# Si falla, limpia y reinstala
rm -rf node_modules/.prisma
npm run db:generate
```

---

## 📝 BD de Test Manual

Si no puedes usar `sudo`, crea la BD así:

```bash
# Conectar a PostgreSQL (si tienes acceso)
psql -U postgres

# Una vez dentro (psql >):
CREATE USER testuser WITH PASSWORD 'testpass';
CREATE DATABASE barbweb_test OWNER testuser;
ALTER USER testuser CREATEDB;

# Salir con \q
\q
```

**O edita `tests/setup.ts`:**

```typescript
// tests/setup.ts
// Cambiar DATABASE_URL a tu BD disponible
process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/your_existing_db'
```

---

## ✨ Alternative: Setup Rápido (sin BD)

Si no tienes acceso PostgreSQL y solo quieres correr tests unitarios:

```bash
# Solo instalar dependencias
npm ci

# Solo instalar Playwright
npx playwright install

# Correr tests unitarios (sin integración)
npm run test -- tests/unit/
```

**Resultado**: Tests unitarios corren sin BD 🎉

---

## 🎬 TL;DR - Comandos Mínimos

```bash
npm ci                    # Instalar dependencias
npx playwright install    # Instalar Playwright
npm run test              # Correr tests
npm run test:coverage     # Ver cobertura
```

---

## 📞 Si nada funciona

1. Verifica que estés en: `~/barbweb/backend/`
2. Verifica que existe `package.json`
3. Verifica que tienes Node 20.x: `node --version`
4. Verifica npm: `npm --version`
5. Limpia caché: `npm cache clean --force`
6. Reinstala: `rm -rf node_modules && npm ci`
7. Intenta nuevamente: `npm run test`

---

**Siguiente paso**: Una vez todo instalado, corre `npm run test` 🚀
