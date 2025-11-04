import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payloadSingleton'
import { migrate } from '@payloadcms/db-postgres/migrate'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * ONE-TIME ONLY: Run Payload migrations in production
 * Visit this URL once to create all tables
 * DELETE THIS FILE after running
 */
export async function GET() {
  try {
    const payload = await getPayloadClient()
    
    // Run migrations
    await migrate({ payload })
    
    return NextResponse.json({
      success: true,
      message: 'Migrations completed! All Payload tables created.',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    )
  }
}

