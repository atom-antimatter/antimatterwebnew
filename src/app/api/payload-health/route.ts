import { NextResponse } from 'next/server'

/**
 * Health check endpoint to debug Payload connection issues
 * GET /api/payload-health
 */
export async function GET() {
  try {
    const result: any = {
      timestamp: new Date().toISOString(),
      environment: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 40) + '...',
        hasPayloadSecret: !!process.env.PAYLOAD_SECRET,
      },
    }

    // Try to initialize Payload
    try {
      const { getPayload } = await import('payload')
      const config = (await import('@payload-config')).default
      
      await getPayload({ config })
      
      result.status = 'success'
      result.message = 'Payload initialized and database connected successfully!'
    } catch (error: any) {
      result.status = 'error'
      result.error = error.message
      result.code = error.code
      
      if (error.message?.includes('Tenant or user not found')) {
        result.suggestion = 'DATABASE_URL authentication failed. Check password and username in connection string.'
      } else if (error.message?.includes('ENETUNREACH')) {
        result.suggestion = 'Cannot reach database. Verify DATABASE_URL uses pooler connection.'
      }
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

