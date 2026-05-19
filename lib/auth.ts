import { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/db'

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      // Request only the opaque user ID — no email, name, or profile photo.
      authorization: { params: { scope: 'openid' } },
      profile(profile) {
        // Generate a stable anonymous identity from the Google sub.
        // NextAuth's adapter requires a non-null email string, so we derive
        // a placeholder using the .invalid TLD (RFC 2606 — never routes).
        const suffix = profile.sub.slice(-6)
        return {
          id: profile.sub,
          name: `Sprout-${suffix}`,
          email: `${profile.sub}@keysprout.invalid`,
          image: null,
        }
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
