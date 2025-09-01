export { default } from 'next-auth/middleware'

/**
 * Protect admin pages and admin API routes with NextAuth middleware.
 */
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}



