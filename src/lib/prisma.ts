import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient(): PrismaClient {
  // Middleware runs in Edge Runtime where mssql/tedious are unavailable.
  // auth.ts guards all prisma calls with NEXT_RUNTIME === 'edge', so a stub is safe.
  if (process.env.NEXT_RUNTIME === 'edge') return {} as PrismaClient

  const url = (process.env.DATABASE_URL ?? '')
    .replace(/;pool_timeout=\d+/gi, '')
    .replace(/;connection_limit=\d+/gi, '')
    .replace(/;+$/, '')

  console.log('[prisma] connecting to', url.replace(/password=[^;]*/i, 'password=***'))

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaMssql } = require('@prisma/adapter-mssql') as typeof import('@prisma/adapter-mssql')
  const adapter = new PrismaMssql(url)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
