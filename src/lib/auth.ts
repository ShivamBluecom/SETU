import NextAuth from 'next-auth'
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id'
import { prisma } from '@/lib/prisma'
import type { UserRole } from '@/types/enums'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      await prisma.user.upsert({
        where: { email: user.email },
        update: { name: user.name ?? user.email },
        create: {
          email: user.email,
          name: user.name ?? user.email,
          role: 'ISR',
        },
      })
      return true
    },

    async jwt({ token, account }) {
      // Populate token on first sign-in OR if role is missing (stale token / DB error recovery)
      if ((account || !token.role) && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true, buId: true, territoryId: true },
        })
        if (dbUser) {
          token.userId = dbUser.id
          token.role = dbUser.role as UserRole
          token.buId = dbUser.buId
          token.territoryId = dbUser.territoryId
        }
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string
        session.user.role = token.role as UserRole
        session.user.buId = (token.buId as string | null) ?? null
        session.user.territoryId = (token.territoryId as string | null) ?? null
      }
      return session
    },
  },
})

export function canCreate(_role: UserRole): boolean {
  return true
}

export function canAssignOwner(role: UserRole): boolean {
  return ['BU_HEAD', 'TERRITORY_MANAGER', 'ADMIN'].includes(role)
}

export function isStakeholder(role: UserRole): boolean {
  return ['BU_HEAD', 'TERRITORY_MANAGER', 'ADMIN'].includes(role)
}
