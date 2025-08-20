import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminHash = process.env.ADMIN_PASSWORD_HASH
  const nextauthUrl = process.env.NEXTAUTH_URL
  const nextauthSecret = process.env.NEXTAUTH_SECRET

  return NextResponse.json({
    adminEmailPresent: !!adminEmail,
    adminHashPresent: !!adminHash,
    adminHashLength: adminHash ? adminHash.trim().length : 0,
    adminHashStartsWith2: adminHash ? adminHash.trim().startsWith('$2') : false,
    nextauthUrl,
    nextauthSecretPresent: !!nextauthSecret,
    nextauthSecretLength: nextauthSecret ? nextauthSecret.length : 0,
  })
}


