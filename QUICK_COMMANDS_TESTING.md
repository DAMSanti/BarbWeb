# ⚡ Comandos Rápidos - Testing Manual en DO

## 🚀 Setup Inicial (Primera Vez)

```bash
cd ~/barbweb/backend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Tiempo**: 3-5 minutos

---

## 🧪 Correr Tests

```bash
npm run test                # Todos los tests
npm run test:coverage       # Con reporte de cobertura
npm run test:watch         # Modo watch (desarrollo)
npm run test:e2e           # E2E tests
npm run test -- tests/unit/ # Solo tests unitarios
```

---

## 📊 Ver Resultados

```bash
# Coverage en terminal
cat coverage/coverage-summary.json

# Ver archivo de cobertura
ls -la coverage/

# Ver E2E report
ls -la playwright-report/
```

---

## 📥 Descargar a Tu Laptop

```bash
# Desde tu laptop (terminal local)

# Coverage
scp -r user@tu_ip:~/barbweb/backend/coverage ./coverage

# E2E Report
scp -r user@tu_ip:~/barbweb/backend/playwright-report ./

# Luego abre en navegador:
# - coverage/index.html
# - playwright-report/index.html
```

---

## 🔧 Troubleshooting Rápido

```bash
# Vitest no encontrado
npm install

# Problemas de permisos
sudo chown -R $USER:$USER ~/barbweb

# Limpiar todo
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Ver qué está instalado
npm list --depth=0
```

---

## 📋 Flujo Típico

```bash
# 1. Conectar
ssh root@tu_ip

# 2. Ir a carpeta
cd ~/barbweb/backend

# 3. Setup (primera vez)
npm install

# 4. Correr tests
npm run test

# 5. Ver cobertura
npm run test:coverage

# 6. Descargar (en tu laptop)
scp -r user@tu_ip:~/barbweb/backend/coverage ./
```

---

**Ver archivo completo**: `MANUAL_CONSOLE_SETUP.md` 📄
