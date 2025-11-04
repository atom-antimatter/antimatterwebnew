import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payloadSingleton'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * ONE-TIME ONLY: Initialize Payload in production
 * This will auto-run migrations when Payload first initializes
 * Visit this URL once to create all tables
 */
export async function GET() {
  try {
    // Simply initializing Payload will run migrations automatically
    const payload = await getPayloadClient()
    
    // Verify tables exist by querying a collection
    const users = await payload.find({
      collection: 'payload-users',
      limit: 1,
    })
    
    return NextResponse.json({
      success: true,
      message: 'Payload initialized! All tables created via auto-migration.',
      userCount: users.totalDocs,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        hint: 'Check DATABASE_URL and ensure Payload secret is set',
      },
      { status: 500 }
    )
  }
}

