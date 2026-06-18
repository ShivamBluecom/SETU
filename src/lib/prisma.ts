import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const base = (process.env.DATABASE_URL ?? '')
    .replace(/;pool_timeout=\d+/gi, '')
    .replace(/;+$/, '')

  const url = base.includes('connection_limit')
    ? base
    : `${base};connection_limit=3`

  console.log('[prisma] datasourceUrl =', url.replace(/password=[^;]*/i, 'password=***'))

  return new PrismaClient({
    datasourceUrl: url,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
