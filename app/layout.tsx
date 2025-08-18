import type { Metadata } from 'next'
import { GeistMono } from 'geist/font/mono'
import { EB_Garamond } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/auth-provider'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
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
      <body className={`${garamond.className} dark bg-stone-800 text-stone-200 antialiased`}> 
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
