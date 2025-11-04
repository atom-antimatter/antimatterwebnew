import { getPayloadClient } from "@/lib/payloadSingleton"
import { NextResponse } from 'next/server'
import { sql } from '@payloadcms/db-postgres'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * One-time safety endpoint to create missing auth sessions table for Payload users
 * GET /api/payload-fix-sessions
 */
export async function GET() {
  try {
    const payload = await getPayloadClient()

    // Create table and constraints if they don't exist
    await payload.db.drizzle.execute(sql`
      CREATE TABLE IF NOT EXISTS "payload_users_sessions" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "expires_at" timestamp(3) with time zone
      );

      DO $$ BEGIN
        ALTER TABLE "payload_users_sessions" ADD CONSTRAINT "payload_users_sessions_parent_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_users"("id")
        ON DELETE cascade ON UPDATE no action;
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      CREATE INDEX IF NOT EXISTS "payload_users_sessions_order_idx" ON "payload_users_sessions" USING btree ("_order");
      CREATE INDEX IF NOT EXISTS "payload_users_sessions_parent_id_idx" ON "payload_users_sessions" USING btree ("_parent_id");
    `)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 })
  }
}


