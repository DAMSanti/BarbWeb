# 🚀 First Run - Testing en DigitalOcean

Guía paso a paso para ejecutar los tests por primera vez en tu servidor DO.

## Paso 1: Conectar a DO

```bash
ssh root@tu_servidor_ip

# o si tienes usuario específico
ssh usuario@tu_servidor_ip
```

## Paso 2: Ir al directorio del backend

```bash
cd ~/barbweb
# o donde tengas el repo clonado

# Verificar que estamos en el lugar correcto
ls -la | grep backend
```

## Paso 3: Ejecutar Setup

### Opción A: Setup Automático (Recomendado)

```bash
cd backend
bash scripts/setup-testing.sh
```

Este script hará automáticamente:
- ✅ Verificar Node.js 20.x
- ✅ Instalar dependencias (`npm ci`)
- ✅ Verificar/iniciar PostgreSQL (si tienes acceso sudo)
- ✅ Crear base de datos de test
- ✅ Instalar Playwright browsers
- ✅ Generar tipos de Prisma

**Tiempo esperado:** 5-10 minutos (primera vez)

**Si el script falla por permisos** → Ver "Opción B" abajo

### Opción B: Setup Manual (Si Opción A falla)

```bash
cd backend

# 1. Instalar dependencias
npm ci

# 2. Instalar Playwright
npx playwright install

# 3. Generar tipos
npm run db:generate

# 4. Configurar BD manualmente (si tienes sudo)
sudo -u postgres psql << EOF
CREATE USER testuser WITH PASSWORD 'testpass';
CREATE DATABASE barbweb_test OWNER testuser;
ALTER USER testuser CREATEDB;
EOF
```

**Tiempo esperado:** 5-10 minutos  
**Nota**: Ver archivo `MANUAL_SETUP_TESTING.md` para más detalles

### Output Esperado

```
════════════════════════════════════════════════════════════
✅ Setup de Testing Completado
════════════════════════════════════════════════════════════

Próximos pasos:
  1. npm run test
  2. npm run test:coverage
  3. npm run test:e2e
  4. npm run test:watch
```

Si ves esto, ¡todo está instalado! ✅

## Paso 4: Ejecutar Tests por Primera Vez

### Option A: Tests básicos (5-10 seg)

```bash
npm run test
```

Deberías ver algo como:

```
✓ tests/unit/...
✓ tests/unit/...
✓ tests/integration/...

✅ 10 passed | 5s
```

### Option B: Con reporte de cobertura (30-40 seg)

```bash
npm run test:coverage
```

Genera reporte en `coverage/index.html`

### Option C: E2E tests (1-2 min)

```bash
npm run test:e2e
```

Genera reporte en `playwright-report/index.html`

## Paso 5: Ver los Reportes

### Coverage Report (unit + integration)

```bash
# El reporte se crea en: backend/coverage/
# Ver lista de archivos
ls -la coverage/

# Para verlo localmente (en tu laptop):
# En otra terminal:
scp -r root@tu_ip:~/barbweb/backend/coverage ./coverage

# Luego abrir: coverage/index.html en navegador
```

### E2E Report (Playwright)

```bash
# El reporte se crea en: backend/playwright-report/
# Para verlo localmente:
scp -r root@tu_ip:~/barbweb/backend/playwright-report ./

# Luego abrir: playwright-report/index.html en navegador
```

## Paso 6: Verificar Cobertura

```bash
# Ver cobertura resumida en terminal
npm run test:coverage
```

Busca líneas como:

```
Lines   : 65.3% ( 200 / 306 )
Functions: 72.4% ( 50 / 69 )
Branches: 58.9% ( 40 / 68 )
Statements: 65.8% ( 205 / 311 )
```

**Meta:** 70% en líneas/funciones/statements, 60% en branches

## Troubleshooting

### ❌ Error: "command not found: npm"

Node.js no está instalado:

```bash
node --version
npm --version

# Si no funciona, instalarlo:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### ❌ Error: "EACCES: permission denied"

Falta de permisos en carpetas:

```bash
sudo chown -R $USER:$USER ~/barbweb
chmod -R u+w ~/barbweb
```

### ❌ Error: "psql: command not found"

PostgreSQL no instalado:

```bash
# Ejecutar setup otra vez
bash scripts/setup-testing.sh

# O instalar manualmente
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib
```

### ❌ Error: "Cannot find module @prisma/client"

Tipos de Prisma no generados:

```bash
npm run db:generate
```

### ❌ Error: "Playwright browsers not installed"

```bash
npx playwright install
sudo apt-get install -y chromium-browser
```

### ❌ Error: "EADDRINUSE: address already in use"

Puerto en uso:

```bash
# Ver qué está usando el puerto
lsof -i :3000

# Matar el proceso
kill -9 <PID>
```

## Próximas Ejecuciones

Una vez hecho el setup inicial, las próximas veces es más rápido:

```bash
cd ~/barbweb/backend

# Tests unitarios + integración
npm run test

# Con cobertura
npm run test:coverage

# E2E tests
npm run test:e2e

# Modo watch (desarrollo)
npm run test:watch
```

## Script Helper (alternativa)

Si prefieres, usa el helper que hemos creado:

```bash
bash scripts/run-tests.sh all        # Todos los tests
bash scripts/run-tests.sh unit       # Solo unitarios
bash scripts/run-tests.sh integration # Solo integración
bash scripts/run-tests.sh coverage   # Con reporte
bash scripts/run-tests.sh watch      # Modo watch
bash scripts/run-tests.sh e2e        # E2E tests
```

## Automatizar en Background

Si quieres que los tests se ejecuten periódicamente:

```bash
# Cron para ejecutar tests cada día a las 3 AM
# Editar: crontab -e
0 3 * * * cd ~/barbweb/backend && npm run test:coverage > /tmp/tests.log 2>&1
```

## Logs y Debugging

```bash
# Ver logs detallados
npm run test -- --reporter=verbose

# Ver solo fallos
npm run test -- --reporter=verbose 2>&1 | grep -A5 "FAIL"

# Guardar en archivo
npm run test > /tmp/test-output.log 2>&1
```

## Performance Tuning

Si los tests son lentos:

```bash
# Ver qué tests tardan más
npm run test -- --reporter=verbose --reporter=default 2>&1 | tail -30

# Ejecutar solo unit tests (más rápido)
bash scripts/run-tests.sh unit

# Ejecutar solo integración
bash scripts/run-tests.sh integration
```

## Siguiente Paso

Una vez todo funcione:

1. ✅ Ejecutar tests regularmente
2. ⏳ Escribir más tests (aumentar cobertura)
3. 🔄 Setup GitHub Actions para CI/CD automático
4. 📊 Monitorear cobertura y trends

---

**¿Problemas?** Revisa el archivo `TESTING_SETUP.md` para más detalles.
