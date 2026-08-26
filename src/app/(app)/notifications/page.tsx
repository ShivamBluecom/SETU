import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NotificationsClient } from './NotificationsClient'
import type { SessionUser } from '@/types/api'

export default async function NotificationsPage() {
  const session = await auth()
  if (!session) return null

  const user = session.user as SessionUser

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    include: {
      opportunity: {
        include: { company: { select: { id: true, name: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return <NotificationsClient notifications={notifications} />
}
