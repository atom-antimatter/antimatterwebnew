import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasHumeApiKey: !!process.env.HUME_API_KEY,
    hasHumeSecretKey: !!process.env.HUME_SECRET_KEY,
    hasConfigId: !!process.env.NEXT_PUBLIC_HUME_CONFIG_ID,
    apiKeyLength: process.env.HUME_API_KEY?.length || 0,
    secretKeyLength: process.env.HUME_SECRET_KEY?.length || 0,
    configId: process.env.NEXT_PUBLIC_HUME_CONFIG_ID || "not set",
  });
}

