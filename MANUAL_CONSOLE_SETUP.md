# 🚀 Guía Manual - Instalar Testing en DO desde Consola

Esta guía te permite instalar y configurar el entorno de testing **manualmente desde la consola de DigitalOcean**, sin depender del deploy automático.

---

## 📋 Requisitos Previos

Tienes que estar conectado a tu servidor DO:

```bash
ssh root@tu_servidor_ip
# o
ssh usuario@tu_servidor_ip
```

Verifica que estés en la carpeta correcta:

```bash
pwd
# Debería mostrar: /root o similar

cd ~/barbweb/backend
# o donde tengas el proyecto clonado
```

---

## 🎯 Paso 1: Verificar Versiones

```bash
node --version    # Debe ser v20.x
npm --version     # Debe ser 10.x
```

Si no tienes Node 20, instalalo:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## 🔧 Paso 2: Limpiar e Instalar Dependencias

### Opción A: Limpieza Total (Recomendado si hay problemas)

```bash
cd ~/barbweb/backend

# 1. Eliminar carpetas antiguas
rm -rf node_modules
rm -f package-lock.json

# 2. Limpiar caché de npm
npm cache clean --force

# 3. Instalar dependencias FRESCAS
npm install
```

**Tiempo**: 3-5 minutos  
**Resultado esperado**: `added 450+ packages in 3m`

### Opción B: Instalación Rápida (si node_modules ya existe)

```bash
cd ~/barbweb/backend
npm install
```

**Tiempo**: 30 segundos  
**Resultado esperado**: `up to date`

---

## ✅ Paso 3: Verificar que Vitest Está Instalado

```bash
# Ver que vitest existe
ls -la node_modules/.bin/vitest

# Debería mostrar:
# vitest -> ../vitest/vitest.mjs
```

O simplemente:

```bash
# Ver todas las herramientas instaladas
ls node_modules/.bin/ | grep -E "vitest|playwright"
```

---

## 🧪 Paso 4: Correr Tests

### Tests Básicos (Unit + Integration)

```bash
npm run test
```

**Esperado**:
```
✓ tests/unit/...
✓ tests/integration/...
...
✅ 180+ tests passing
```

### Con Cobertura

```bash
npm run test:coverage
```

**Genera**: `coverage/index.html`

### Solo Tests Unitarios

```bash
npm run test -- tests/unit/
```

### Modo Watch (desarrollo)

```bash
npm run test:watch
```

---

## 🎯 Paso 5: Ver Resultados

### Coverage Report

```bash
# El reporte se genera en:
ls -la coverage/

# Ver resumen en terminal
cat coverage/coverage-summary.json | head -50
```

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

**Genera**: `playwright-report/index.html`

---

## 📥 Paso 6: Descargar Reportes a Tu Laptop

### Coverage Report

```bash
# Desde tu laptop (terminal local):
scp -r root@tu_servidor_ip:~/barbweb/backend/coverage ./coverage

# Luego abre: coverage/index.html en navegador
```

### E2E Report

```bash
# Desde tu laptop:
scp -r root@tu_servidor_ip:~/barbweb/backend/playwright-report ./

# Luego abre: playwright-report/index.html en navegador
```

---

## 🔄 Flujo Completo (de una vez)

```bash
cd ~/barbweb/backend

# 1. Limpiar
rm -rf node_modules package-lock.json
npm cache clean --force

# 2. Instalar
npm install

# 3. Verificar
npm run test

# 4. Con cobertura
npm run test:coverage

# 5. Ver en terminal
cat coverage/coverage-summary.json
```

---

## 🆘 Troubleshooting

### Error: "npm: command not found"

```bash
# Node.js no está instalado
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Error: "vitest: not found"

```bash
# Reinstalar dependencias
cd ~/barbweb/backend
rm -rf node_modules
npm install
```

### Error: "EACCES: permission denied"

```bash
# Cambiar permisos
sudo chown -R $USER:$USER ~/barbweb
chmod -R u+w ~/barbweb
```

### Error: "Cannot find module @rollup..."

```bash
# Limpiar e instalar desde cero
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Tests muy lentos

```bash
# Ver qué tests tardan más
npm run test -- --reporter=verbose 2>&1 | tail -30

# O solo tests unitarios (más rápido)
npm run test -- tests/unit/
```

---

## 📝 Comandos Útiles

```bash
# Ver versión de vitest instalada
npx vitest --version

# Ver todas las dependencias
npm list

# Ver solo devDependencies
npm list --depth=0 --save-dev

# Limpiar todo
npm prune

# Verificar integridad
npm audit
```

---

## 🎬 Mi Recomendación

### Primera vez (instalación completa)

```bash
cd ~/barbweb/backend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm run test
```

### Siguientes veces (solo actualizar)

```bash
cd ~/barbweb/backend
npm install  # Si hay cambios en package.json
npm run test
```

---

## ✨ Automatizar en Background

Si quieres que los tests corran automáticamente sin bloquear la consola:

```bash
# Correr en background
npm run test &

# Ver qué procesos corren
jobs

# Matar un proceso
kill %1
```

O en un screen/tmux:

```bash
# En tmux
tmux new-session -d -s tests "cd ~/barbweb/backend && npm run test"

# Ver sesiones
tmux list-sessions

# Conectar a sesión
tmux attach -t tests
```

---

## 📊 Flujo Típico de Testing

```
1. Conectar a DO
2. cd ~/barbweb/backend
3. npm install              (una sola vez o si hay cambios)
4. npm run test             (correr tests)
5. npm run test:coverage    (ver cobertura)
6. scp coverage/* laptop    (descargar si quieres)
7. Analizar resultados
8. Escribir más tests
9. Repetir 4-7
```

---

**¡Listo! Ya puedes instalar y testear manualmente en DO** 🚀
