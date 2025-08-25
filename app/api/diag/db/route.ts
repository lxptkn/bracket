import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  try {
    // Check environment variables
    const hasPostgresUrl = !!process.env.POSTGRES_URL
    const hasDatabaseUrl = !!process.env.DATABASE_URL
    const nextPhase = process.env.NEXT_PHASE
    const vercelEnv = process.env.VERCEL_ENV
    
    // Try to connect to database
    let dbStatus = 'unknown'
    let tableStatus = 'unknown'
    let error = null
    
    if (hasPostgresUrl || hasDatabaseUrl) {
      try {
        const prisma = new PrismaClient()
        await prisma.$connect()
        dbStatus = 'connected'
        
        // Try to query tables to see if they exist
        try {
          const seasons = await prisma.season.findMany({ take: 1 })
          tableStatus = 'tables_exist'
        } catch (tableError) {
          tableStatus = 'tables_missing'
          error = tableError.message
        }
        
        await prisma.$disconnect()
      } catch (dbError) {
        dbStatus = 'connection_failed'
        error = dbError.message
      }
    } else {
      dbStatus = 'no_url'
    }
    
    return NextResponse.json({
      environment: {
        hasPostgresUrl,
        hasDatabaseUrl,
        nextPhase,
        vercelEnv
      },
      database: {
        status: dbStatus,
        tableStatus,
        error
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Diagnostic failed',
      details: error.message 
    }, { status: 500 })
  }
}
