import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Inicializa la base de datos ejecutando las migraciones
 */
export async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...')

    // Ejecutar prisma db push
    const { execSync } = await import('child_process')
    try {
      execSync('npx prisma db push --skip-generate --accept-data-loss', {
        cwd: process.cwd(),
        stdio: 'inherit',
      })
      console.log('✅ Database schema synchronized')
    } catch (error) {
      console.error('⚠️ Database push error (may be already synchronized):', error)
    }

    // Test connection
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connected and ready')

    return true
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    return false
  }
}

export default prisma
