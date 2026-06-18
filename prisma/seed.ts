import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const territory = await prisma.territory.upsert({
    where: { id: 'seed-territory-all-india' },
    update: { name: 'All India' },
    create: { id: 'seed-territory-all-india', name: 'All India' },
  })

  const bu = await prisma.businessUnit.upsert({
    where: { id: 'seed-bu-direct-sales' },
    update: { name: 'Direct Sales' },
    create: { id: 'seed-bu-direct-sales', name: 'Direct Sales' },
  })

  await prisma.user.upsert({
    where: { email: 'vishnu.sharma@bluecomgroup.in' },
    update: { name: 'Vishnu Sharma', role: 'ADMIN' },
    create: {
      email: 'vishnu.sharma@bluecomgroup.in',
      name: 'Vishnu Sharma',
      role: 'ADMIN',
      buId: bu.id,
      territoryId: territory.id,
    },
  })

  await prisma.company.upsert({
    where: { id: 'seed-company-demo' },
    update: { name: 'Demo Corp' },
    create: {
      id: 'seed-company-demo',
      name: 'Demo Corp',
      industry: 'Technology',
      headOffice: 'Mumbai',
      territoryId: territory.id,
    },
  })

  console.log('Seed complete')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
