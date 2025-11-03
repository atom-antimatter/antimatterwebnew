import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Manual migration endpoint
 * Access this route to run Payload migrations after deployment
 * GET /api/payload-migrate
 */
export async function GET() {
  try {
    const payload = await getPayload({ config })
    
    // Migrations are automatically run when Payload initializes
    // This endpoint just ensures Payload is initialized
    
    return NextResponse.json({
      success: true,
      message: 'Payload initialized successfully. Migrations run automatically on first access.',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error initializing Payload:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to initialize Payload',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

