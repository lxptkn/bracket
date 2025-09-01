'use client'

import { SessionProvider } from 'next-auth/react'

/**
 * Wraps the app with NextAuth's SessionProvider so authentication state is available.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}



