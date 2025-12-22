import { NextResponse } from "next/server";

/**
 * Health check endpoint for Atom Chat API
 * Only enabled in development - returns 404 in production
 */
export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const promptId = process.env.ATOM_CHAT_PROMPT_ID;
  const promptVersion = process.env.ATOM_CHAT_PROMPT_VERSION;

  return NextResponse.json({
    status: "ok",
    environment: process.env.NODE_ENV || "unknown",
    vercel_env: process.env.VERCEL_ENV || "local",
    openai_key_configured: !!apiKey,
    openai_key_prefix: apiKey ? `${apiKey.substring(0, 7)}...` : "NOT_SET",
    openai_key_valid_format: apiKey ? apiKey.startsWith("sk-") && !apiKey.startsWith("sk-th-") : false,
    prompt_id_configured: !!promptId,
    prompt_id: promptId || "NOT_SET",
    prompt_version: promptVersion || "1",
    timestamp: new Date().toISOString(),
  });
}

