import type { Metadata } from 'next'
import { GeistMono } from 'geist/font/mono'
import { EB_Garamond } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/auth-provider'

export const metadata: Metadata = {
  title: 'Brackets',
  description: 'Tournament bracket management system',
  generator: 'v0.dev',
}

const garamond = EB_Garamond({ subsets: ['latin'], display: 'swap' })

/**
 * Root layout applied to all pages. Sets fonts, icons, theme, and wraps
 * children with the authentication provider.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/android-chrome-192x192.png" />
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
