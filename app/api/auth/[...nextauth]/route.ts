import NextAuth, { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'

export const runtime = 'nodejs'

const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  debug: process.env.NODE_ENV === 'development',
  providers: [
    Credentials({
      name: 'Admin',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const dev = process.env.NODE_ENV === 'development'
        const adminEmailRaw = process.env.ADMIN_EMAIL
        const adminHashRaw = process.env.ADMIN_PASSWORD_HASH
        const adminPasswordPlain = process.env.ADMIN_PASSWORD

        if (!credentials?.email || !credentials?.password) {
          if (dev) console.log('[auth] missing credentials')
          return null
        }
        if (!adminEmailRaw) {
          if (dev) console.log('[auth] missing ADMIN_EMAIL env')
          return null
        }
        if (!adminHashRaw && !adminPasswordPlain) {
          if (dev) console.log('[auth] missing ADMIN_PASSWORD_HASH (or ADMIN_PASSWORD for dev)')
          return null
        }

        const inputEmail = credentials.email.trim().toLowerCase()
        const expectedEmail = adminEmailRaw.trim().toLowerCase()
        if (inputEmail !== expectedEmail) {
          if (dev) console.log('[auth] email mismatch', { inputEmail })
          return null
        }

        // Dequote and trim hash in case it was wrapped in quotes in .env
        const adminHash = adminHashRaw
          ? adminHashRaw.trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1')
          : undefined

        let ok = false
        if (adminHash) {
          try {
            ok = await compare(credentials.password, adminHash)
          } catch (e) {
            if (dev) console.log('[auth] bcrypt compare error', e)
            ok = false
          }
        }
        if (!ok && dev && adminPasswordPlain) {
          ok = credentials.password === adminPasswordPlain
          if (dev) console.log('[auth] using ADMIN_PASSWORD fallback match:', ok)
        }
        if (!ok) {
          if (dev) console.log('[auth] password mismatch')
          return null
        }
        return { id: 'admin', name: 'Admin', email: adminEmailRaw, role: 'admin' } as any
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = 'admin'
      return token
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = (token as any).role
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }


