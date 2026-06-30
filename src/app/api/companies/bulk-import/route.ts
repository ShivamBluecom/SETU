import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreateCompanySchema } from '@/lib/validations/company'
import type { SessionUser } from '@/types/api'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser

  const body = await req.json()
  const { companies } = body

  if (!Array.isArray(companies) || companies.length === 0) {
    return NextResponse.json({ error: 'companies must be a non-empty array' }, { status: 400 })
  }
  if (companies.length > 500) {
    return NextResponse.json({ error: 'Maximum 500 companies per import' }, { status: 400 })
  }

  // Validate each row with Zod schema
  type ValidRow = { index: number; data: ReturnType<typeof CreateCompanySchema.parse> }
  const validRows: ValidRow[] = []
  const errors: Array<{ index: number; name: string; error: string }> = []

  for (let i = 0; i < companies.length; i++) {
    const parsed = CreateCompanySchema.safeParse(companies[i])
    if (!parsed.success) {
      const msgs = Object.values(parsed.error.flatten().fieldErrors).flat()
      errors.push({ index: i, name: companies[i]?.name ?? `Row ${i + 1}`, error: msgs[0] ?? 'Validation failed' })
    } else {
      validRows.push({ index: i, data: parsed.data })
    }
  }

  if (validRows.length === 0) {
    return NextResponse.json({ created: 0, errors })
  }

  // Check for DB duplicates in a single query (SQL Server CI collation handles case)
  const names = validRows.map(r => r.data.name.trim())
  const existing = await prisma.company.findMany({
    where: { name: { in: names } },
    select: { name: true },
  })
  const existingSet = new Set(existing.map(e => e.name.toLowerCase()))

  const toInsert: ValidRow[] = []
  for (const row of validRows) {
    if (existingSet.has(row.data.name.trim().toLowerCase())) {
      errors.push({ index: row.index, name: row.data.name, error: `A company named '${row.data.name}' already exists` })
    } else {
      toInsert.push(row)
    }
  }

  let created = 0
  if (toInsert.length > 0) {
    await prisma.company.createMany({
      data: toInsert.map(r => ({ ...r.data, createdById: user.id })),
    })
    created = toInsert.length
  }

  // Sort errors by original row index for consistent ordering
  errors.sort((a, b) => a.index - b.index)

  return NextResponse.json({ created, errors })
}
