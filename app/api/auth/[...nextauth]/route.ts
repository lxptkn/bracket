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
        // Load environment variables more robustly
        const adminEmailRaw = process.env.ADMIN_EMAIL?.trim()
        let adminHashRaw = process.env.ADMIN_PASSWORD_HASH?.trim()
        
        // If the hash is truncated, try to reconstruct it from the file
        if (adminHashRaw && adminHashRaw.length < 60) {
          try {
            const fs = require('fs')
            const envContent = fs.readFileSync('.env.local', 'utf8')
            const hashMatch = envContent.match(/ADMIN_PASSWORD_HASH=([^\r\n]+)/)
            if (hashMatch && hashMatch[1]) {
              const newHash = hashMatch[1].trim()
              adminHashRaw = newHash
            }
          } catch (fileError: any) {
            // Silently fall back to truncated hash
          }
        }

        if (!credentials?.email || !credentials?.password) {
          return null
        }
        
        if (!adminEmailRaw) {
          return null
        }
        
        if (!adminHashRaw) {
          return null
        }

        const inputEmail = credentials.email.trim().toLowerCase()
        const expectedEmail = adminEmailRaw.trim().toLowerCase()
        
        if (inputEmail !== expectedEmail) {
          return null
        }

        // Clean up the hash - handle various edge cases
        let adminHash = adminHashRaw
        
        // Remove any surrounding quotes
        adminHash = adminHash.replace(/^["']|["']$/g, '')
        
        // Remove any trailing whitespace or newlines
        adminHash = adminHash.trim()
        
        // Validate hash format
        if (!adminHash.startsWith('$2')) {
          return null
        }
        
        if (adminHash.length !== 60) {
          return null
        }

        try {
          const passwordMatch = await compare(credentials.password, adminHash)
          
          if (!passwordMatch) {
            return null
          }
          
          return { 
            id: 'admin', 
            name: 'Admin', 
            email: adminEmailRaw, 
            role: 'admin' 
          } as any
        } catch (error) {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = (token as any).role
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }


