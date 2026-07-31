import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const opps = await prisma.opportunity.findMany({
    where: { displayId: null },
    orderBy: { createdAt: 'asc' },
    select: { id: true, createdAt: true },
  })

  if (opps.length === 0) {
    console.log('No opportunities need backfilling.')
    return
  }

  // Find the current highest counter value so we don't collide with any existing displayIds
  const existingCounter = await prisma.counter.findUnique({ where: { name: 'opportunity' } })
  let startFrom = (existingCounter?.value ?? 0) + 1

  console.log(`Backfilling ${opps.length} opportunities starting from counter ${startFrom}...`)

  for (let i = 0; i < opps.length; i++) {
    const num = startFrom + i
    const year = new Date(opps[i].createdAt).getFullYear().toString().slice(-2)
    const displayId = `BCG-OPP-${year}-${num.toString().padStart(6, '0')}`
    await prisma.opportunity.update({
      where: { id: opps[i].id },
      data: { displayId },
    })
    if ((i + 1) % 50 === 0) console.log(`  ${i + 1}/${opps.length} done`)
  }

  const finalValue = startFrom + opps.length - 1
  await prisma.counter.upsert({
    where: { name: 'opportunity' },
    create: { name: 'opportunity', value: finalValue },
    update: { value: finalValue },
  })

  console.log(`Done. Counter set to ${finalValue}. Next opportunity will be BCG-OPP-XX-${(finalValue + 1).toString().padStart(6, '0')}.`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
