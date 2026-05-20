import { seedDatabase } from '../lib/seed-db'
import { prisma } from '../lib/db'

seedDatabase()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
