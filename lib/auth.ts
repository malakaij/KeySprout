import { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { createHash } from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { generateDisplayName } from '@/lib/name-generator'

/** Hash a plain login token with SHA-256 for safe DB storage. */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      // Request only the opaque user ID — no email, name, or profile photo.
      authorization: { params: { scope: 'openid' } },
      profile(profile) {
        return {
          id: profile.sub,
          name: generateDisplayName(profile.sub),
          // NextAuth requires an email field; we synthesise one from the opaque sub
          // rather than storing the user's real address.
          email: `${profile.sub}@keysprout.invalid`,
          image: null,
        }
      },
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Username & Password',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        loginToken: { label: 'Login Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials) return null

        // QR token path: single-use token from printed login card.
        if (credentials.loginToken) {
          const tokenHash = hashToken(credentials.loginToken)
          const record = await prisma.studentLoginToken.findUnique({
            where: { tokenHash },
            include: { user: { select: { id: true, name: true, email: true, role: true } } },
          })
          if (!record) return null
          if (record.usedAt) return null
          if (record.expiresAt < new Date()) return null

          await prisma.studentLoginToken.update({
            where: { id: record.id },
            data: { usedAt: new Date() },
          })
          return { id: record.user.id, name: record.user.name, email: record.user.email }
        }

        // Password path: username (nickname) + password.
        if (!credentials.username || !credentials.password) return null

        const user = await prisma.user.findFirst({
          where: { name: credentials.username },
          select: { id: true, name: true, email: true, passwordHash: true },
        })
        if (!user?.passwordHash) return null

        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null

        return { id: user.id, name: user.name, email: user.email }
      },
    }),
  ],
  session: {
    strategy: 'database',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        })
        session.user.role = dbUser?.role ?? 'STUDENT'
      }
      return session
    },
    async signIn() {
      return true
    },
  },
  pages: {
    signIn: '/login',
  },
}
