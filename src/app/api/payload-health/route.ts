import { NextResponse } from 'next/server'

/**
 * Health check endpoint to debug Payload connection issues
 * GET /api/payload-health
 */
export async function GET() {
  try {
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 30) + '...',
        hasPayloadSecret: !!process.env.PAYLOAD_SECRET,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      },
    }

    // Try to load config
    try {
      const configModule = await import('@payload-config')
      diagnostics.config = {
        loaded: true,
        hasCollections: !!configModule.default.collections,
        collectionCount: configModule.default.collections?.length || 0,
      }
    } catch (configError: any) {
      diagnostics.config = {
        loaded: false,
        error: configError.message,
      }
    }

    // Try to initialize Payload
    try {
      const { getPayload } = await import('payload')
      const configModule = (await import('@payload-config')).default
      
      await getPayload({ config: configModule })
      
      diagnostics.payload = {
        initialized: true,
        message: 'Payload connected successfully!',
      }
    } catch (payloadError: any) {
      diagnostics.payload = {
        initialized: false,
        error: payloadError.message,
        stack: process.env.NODE_ENV === 'development' ? payloadError.stack : undefined,
      }
    }

    return NextResponse.json(diagnostics, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

