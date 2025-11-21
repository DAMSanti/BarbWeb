#!/usr/bin/env node
import { getPrismaClient } from '../src/db/init.js'

const prisma = getPrismaClient()

async function main() {
  console.log('🔐 Revoking all refresh tokens for all users...')
  const users = await prisma.user.findMany({ select: { id: true } })
  console.log(`Found ${users.length} users. Clearing refreshTokens for all users...`)

  let counter = 0
  for (const user of users) {
    await prisma.user.update({ where: { id: user.id }, data: { refreshTokens: { set: [] } } })
    counter++
    if (counter % 100 === 0) console.log(`Cleared tokens for ${counter} users...`)
  }

  console.log(`✅ Done. Cleared refresh tokens for ${counter} users.`)
}

main()
  .catch((err) => {
    console.error('❌ Error while revoking refresh tokens:', err)
    process.exit(1)
  })
  .finally(async () => await prisma.$disconnect())
