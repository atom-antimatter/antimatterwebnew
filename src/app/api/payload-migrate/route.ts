import { getPayloadClient } from "@/lib/payloadSingleton"
import { NextResponse } from 'next/server'

/**
 * Manual migration endpoint
 * Access this route to run Payload migrations after deployment
 * GET /api/payload-migrate
 */
export async function GET() {
  try {
    await getPayloadClient()
    
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

