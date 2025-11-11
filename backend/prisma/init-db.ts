import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const prisma = new PrismaClient()

async function initializeDatabase() {
  try {
    console.log('🔄 Reading SQL initialization script...')
    const sqlPath = join(__dirname, 'init.sql')
    const sql = readFileSync(sqlPath, 'utf-8')

    console.log('🔄 Executing SQL to create tables...')
    await prisma.$executeRawUnsafe(sql)

    console.log('✅ Database tables created successfully!')
    await prisma.$disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

initializeDatabase()
