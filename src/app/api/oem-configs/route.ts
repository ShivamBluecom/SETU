import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { SessionUser } from '@/types/api'

const CreateOemConfigSchema = z.object({
  buType: z.string().min(1),
  name: z.string().min(1).max(200),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const buType = searchParams.get('buType')

  const configs = await prisma.oemConfig.findMany({
    where: buType ? { buType } : undefined,
    orderBy: [{ buType: 'asc' }, { name: 'asc' }],
  })

  return NextResponse.json(configs)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const actor = session.user as SessionUser
  if (actor.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = CreateOemConfigSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const config = await prisma.oemConfig.create({ data: parsed.data })
  return NextResponse.json(config, { status: 201 })
}
