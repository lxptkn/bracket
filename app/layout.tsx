import type { Metadata } from 'next'
import { GeistMono } from 'geist/font/mono'
import { EB_Garamond } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/auth-provider'

export const metadata: Metadata = {
  title: 'Bracket',
  description: 'Tournament bracket management system',
  generator: 'v0.dev',
}

const garamond = EB_Garamond({ subsets: ['latin'], display: 'swap' })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className={`${garamond.className} dark bg-slate-800 text-slate-200 antialiased`}> 
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
