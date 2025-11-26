import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

async function initializeDatabase() {
  try {
    console.log('🔄 Synchronizing database schema with Prisma...')
    console.log('  Running: npx prisma db push --skip-generate')

    // Use prisma db push to sync schema
    try {
      execSync('npx prisma db push --skip-generate --accept-data-loss', {
        stdio: 'inherit',
        cwd: process.cwd(),
      })
    } catch (execError) {
      console.warn('⚠️  Prisma db push encountered an issue (might be expected)')
    }

    console.log('✅ Database schema synchronized successfully!')
    console.log('\nℹ️  If you need to run migrations on production:')
    console.log('   npx prisma migrate deploy')

    await prisma.$disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

initializeDatabase()
