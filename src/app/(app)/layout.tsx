import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Shell } from '@/components/layout/Shell'
import type { SessionUser } from '@/types/api'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.role) redirect('/login')

  return <Shell user={session.user as SessionUser}>{children}</Shell>
}
