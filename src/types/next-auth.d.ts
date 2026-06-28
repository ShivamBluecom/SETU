import type { UserRole } from '@/types/enums'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: UserRole
      buId: string | null
      territoryId: string | null
      buIds: string[]
      territoryIds: string[]
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string
    role: UserRole
    buId: string | null
    territoryId: string | null
    buIds: string[]
    territoryIds: string[]
  }
}
