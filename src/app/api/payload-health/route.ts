import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Health check endpoint to debug DNS + DB connectivity without initializing Payload
 * GET /api/payload-health
 */
export async function GET(request: Request) {
  const startedAt = Date.now()
  const result: any = {
    timestamp: new Date().toISOString(),
    environment: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlPresent: Boolean(process.env.DATABASE_URL),
    },
    dns: {},
    db: {},
  }

  try {
    const url = new URL(request.url)
    const shouldInit = url.searchParams.get('init') === 'true'
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'DATABASE_URL is not set',
        },
        { status: 500 }
      )
    }

    let hostname: string | undefined
    try {
      const url = new URL(databaseUrl)
      hostname = url.hostname
      result.environment.databaseUrlHost = hostname
    } catch (e: any) {
      result.environment.databaseUrlParseError = e?.message
    }

    // DNS lookup of DB host
    if (hostname) {
      try {
        const dnsModule = await import('node:dns/promises')
        const lookupRes = await dnsModule.lookup(hostname)
        result.dns = { ok: true, address: lookupRes.address, family: lookupRes.family }
      } catch (e: any) {
        result.dns = { ok: false, error: e?.message }
      }
    }

    // Attempt short-lived pg connection
    try {
      const { Client } = await import('pg')
      const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
      const t0 = Date.now()
      await client.connect()
      await client.query('select 1')
      await client.end()
      result.db = { connected: true, latencyMs: Date.now() - t0 }
    } catch (e: any) {
      result.db = { connected: false, error: e?.message, code: e?.code }
      // Add specific guidance
      if (e?.message?.includes('getaddrinfo ENOTFOUND')) {
        result.hint = 'Use Supabase Connection Pooler (Session). Copy the exact string from Dashboard → Database → Connection pooling.'
      }
      if (e?.message?.includes('password authentication failed') || e?.message?.includes('Tenant or user not found')) {
        result.hint = 'Check Pooler username format (postgres.<project_ref>) and password. Ensure sslmode=require.'
      }
    }

    // Optionally try initializing Payload to surface runtime errors
    if (shouldInit) {
      try {
        const { getPayload } = await import('payload')
        const config = (await import('@payload-config')).default
        const t1 = Date.now()
        await getPayload({ config })
        result.payload = { initialized: true, latencyMs: Date.now() - t1 }
      } catch (e: any) {
        result.payload = { initialized: false, error: e?.message, code: e?.code }
      }
    }

    result.elapsedMs = Date.now() - startedAt
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', error: error?.message },
      { status: 500 }
    )
  }
}

