import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

function createPrisma() {
  const dbUrl = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'
  const dbPath = dbUrl.replace(/^file:/, '')
  const absPath = path.isAbsolute(dbPath) ? dbPath : path.join(process.cwd(), dbPath)
  const adapter = new PrismaBetterSqlite3({ url: absPath })
  return new PrismaClient({ adapter })
}

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || createPrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
