# 🧪 Setup de Testing en DigitalOcean

## Visión General

El proyecto tiene 3 niveles de testing:
1. **Unit Tests** - Pruebas unitarias con Vitest
2. **Integration Tests** - Pruebas de APIs e integración
3. **E2E Tests** - Pruebas end-to-end con Playwright

## Requisitos Previos

### En el servidor DigitalOcean:

```bash
# 1. Node.js 20.x (ya debería estar instalado)
node --version
npm --version

# 2. PostgreSQL (para tests de integración)
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# 3. Iniciar PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 4. Playwright browsers (para E2E tests)
npx playwright install

# 5. Chrome/Chromium (requerido para Playwright en headless)
sudo apt-get install -y chromium-browser
```

## Estructura de Tests

```
backend/
├── tests/
│   ├── setup.ts                 # Configuración global
│   ├── unit/                    # Tests unitarios
│   │   ├── authService.test.ts
│   │   ├── business.test.ts
│   │   ├── middleware.validation.test.ts
│   │   ├── utilities.test.ts
│   │   ├── validation.test.ts
│   │   └── validators.test.ts
│   ├── integration/             # Tests de integración
│   │   ├── admin.api.test.ts
│   │   ├── auth.api.test.ts
│   │   └── routes/
│   │       └── auth.test.ts
│   └── e2e/                     # Tests end-to-end
│       └── critical-flows.spec.ts
├── vitest.config.ts             # Configuración Vitest (unit + integration)
└── playwright.config.ts         # Configuración Playwright (e2e)
```

## Preparar Base de Datos de Tests

```bash
# Crear usuario de test en PostgreSQL
sudo -u postgres psql << EOF
CREATE USER testuser WITH PASSWORD 'testpass';
CREATE DATABASE barbweb_test OWNER testuser;
ALTER USER testuser CREATEDB;
EOF

# Verificar que se creó
sudo -u postgres psql -l | grep barbweb_test
```

## Configurar Variables de Entorno

El archivo `tests/setup.ts` ya contiene las variables necesarias para tests:

```typescript
process.env.JWT_SECRET = 'test-jwt-secret-32-characters-long'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/barbweb_test'
process.env.NODE_ENV = 'test'
// ... etc
```

Si necesitas cambiar la conexión a la BD de test, edita `tests/setup.ts`.

## Scripts de NPM Disponibles

```bash
# Unit + Integration tests
npm run test                    # Ejecutar tests una vez
npm run test:watch             # Modo watch (reejecutar al cambiar código)
npm run test:coverage          # Ejecutar con reporte de cobertura

# E2E tests (Playwright)
npm run test:e2e               # Ejecutar tests E2E

# Ver reporte de cobertura (generado en coverage/)
# En local: abrir coverage/index.html en navegador
```

## Ejecución Rápida en DO

### 1. Setup Inicial (una sola vez)

```bash
cd ~/barbweb/backend

# Instalar dependencias
npm ci  # o npm install si no existe package-lock.json

# Preparar BD de test
sudo -u postgres psql << EOF
CREATE USER testuser WITH PASSWORD 'testpass';
CREATE DATABASE barbweb_test OWNER testuser;
ALTER USER testuser CREATEDB;
EOF

# Instalar Playwright browsers
npx playwright install
```

### 2. Ejecutar Tests

```bash
cd ~/barbweb/backend

# Ejecutar todos los tests (unit + integration)
npm run test

# Ver cobertura
npm run test:coverage

# Modo watch (desarrollo)
npm run test:watch

# E2E tests
npm run test:e2e
```

### 3. Ver Resultados

#### Unit + Integration Coverage:
```bash
# Generar reporte de cobertura
npm run test:coverage

# El reporte se genera en backend/coverage/
# Para verlo en servidor remoto, puedes:
# - Descargarlo: scp user@server:~/barbweb/backend/coverage/* ./coverage/
# - O usar un servidor HTTP: npx http-server coverage/
```

#### E2E Test Reports:
```bash
# Después de ejecutar npm run test:e2e
# Ver reporte: 
npx playwright show-report

# O descargar el reporte
scp -r user@server:~/barbweb/backend/playwright-report ./
```

## Troubleshooting

### Error: "Cannot find module @prisma/client"
```bash
npm run db:generate
```

### Error: "Database connection refused"
```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# Iniciar si está apagado
sudo systemctl start postgresql
```

### Error: "playwright browsers not installed"
```bash
npx playwright install
sudo apt-get install -y chromium-browser
```

### Error: "Port already in use" (E2E tests)
```bash
# Cambiar puerto en playwright.config.ts o:
killall node  # (con cuidado, mata todos los node processes)
```

## Workflow Típico de Testing

```
1. Cambiar código en src/
2. npm run test:watch
3. Escribir test en tests/unit/ o tests/integration/
4. Ver que pasen
5. Ejecutar npm run test:coverage
6. Verificar que cobertura esté dentro de targets (70%+)
7. Commit cuando todo esté verde
```

## Cobertura de Código Objetivo

```
Lines:       70%
Functions:   70%
Branches:    60%
Statements:  70%
```

Verificar cobertura en: `backend/coverage/index.html` (después de `npm run test:coverage`)

## Próximas Tareas

- [ ] Implementar GitHub Actions para CI/CD
- [ ] Agregar más tests de integración (pagos, admin)
- [ ] Aumentar cobertura E2E (workflows críticos)
- [ ] Agregar performance tests
- [ ] Configurar alerts si cobertura baja

---

**Última actualización**: Nov 24, 2025
**Versiones**: Node 20.x, npm 10.x, Vitest 4.x, Playwright latest
