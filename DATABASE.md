# 🗄️ Base de Datos - Prisma + PostgreSQL

## Estructura

La base de datos está configurada con **Prisma ORM** y **PostgreSQL**:

### Tablas Principales

#### 1. **Users** - Usuarios del sistema
```typescript
model User {
  id        String     @id @default(cuid())
  email     String     @unique
  name      String
  role      String     @default("user") // user, lawyer, admin
  payments  Payment[]
}
```

#### 2. **Payments** - Registro de transacciones
```typescript
model Payment {
  id                  String   @id @default(cuid())
  userId              String
  stripeSessionId     String   @unique
  amount              Decimal  @db.Decimal(10, 2)
  status              String   // pending, succeeded, failed, refunded
  question            String   
  category            String
  consultationSummary String?  // Respuesta de IA
  receiptUrl          String?
}
```

#### 3. **FAQs** - Base de preguntas frecuentes
```typescript
model FAQ {
  id       String   @id @default(cuid())
  category String
  question String   
  answer   String   
  keywords String[]
}
```

## Uso Local

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Crear archivo `.env.local`
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/barbweb"
```

### 3. Ejecutar migraciones
```bash
npm run db:migrate
```

### 4. Poblar con datos iniciales (seed)
```bash
npm run db:seed
```

### 5. Generar cliente Prisma
```bash
npm run db:generate
```

## Comandos Útiles

```bash
# Ver/editar BD con interfaz gráfica
npm run db:studio

# Hacer push de cambios al schema
npm run db:push

# Ver migraciones
prisma migrate status

# Crear migración manual
prisma migrate dev --name nombre_migracion

# Generar types de Prisma
npm run db:generate
```

## Conexión en DigitalOcean

En DigitalOcean App Platform, la cadena de conexión será:

```
postgresql://doadmin:PASSWORD@barbweb-db-xxxxx.ondigitalocean.com:25060/defaultdb?sslmode=require
```

Se establece automáticamente en la variable de entorno `DATABASE_URL`.

## Migraciones

Las migraciones se ejecutan automáticamente en el build:
```bash
npx prisma db push --skip-generate
```

## Estructura de Archivos

```
backend/
├── prisma/
│   ├── schema.prisma     # Definición del esquema
│   ├── seed.ts           # Script para poblar datos iniciales
│   └── migrations/       # Historial de cambios
├── src/
│   └── index.ts
├── package.json
└── .env.local            # (No compartir en Git)
```

## Siguientes Pasos

1. ✅ PostgreSQL en DigitalOcean
2. ✅ Schema Prisma
3. ⏳ CRUD endpoints con Prisma
4. ⏳ Autenticación con JWT
5. ⏳ Integración con Stripe
