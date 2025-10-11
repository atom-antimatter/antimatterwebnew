import { NextResponse } from "next/server";

// Proxies a short‑lived access token from Hume's streaming API
// Requires HUME_API_KEY and HUME_SECRET_KEY in env

async function fetchHumeToken(ttlSeconds: number = 60) {
  const apiKey = process.env.HUME_API_KEY || process.env.HUME_KEY || "";
  const secret = process.env.HUME_SECRET_KEY || process.env.HUME_SECRET || "";
  if (!apiKey || !secret) {
    return NextResponse.json(
      { error: "Missing HUME_API_KEY or HUME_SECRET_KEY in environment" },
      { status: 500 }
    );
  }

  const basic = Buffer.from(`${apiKey}:${secret}`).toString("base64");

  const candidates = [
    "https://api.hume.ai/v0/stream/token",
    "https://api.hume.ai/v0/streaming/token",
    "https://api.hume.ai/v0/evi/stream/token",
    "https://api.hume.ai/v0/evi/streaming/token",
  ];

  let lastErrText = "";
  for (const url of candidates) {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ttl: ttlSeconds }),
    });
    if (resp.ok) {
      const data = (await resp.json()) as { token?: string };
      if (data?.token) return NextResponse.json({ token: data.token });
      lastErrText = (await resp.text().catch(() => "")) || lastErrText;
      break;
    } else {
      lastErrText = (await resp.text().catch(() => "")) || lastErrText;
      // Try next candidate
    }
  }

  return NextResponse.json(
    {
      error: "Failed to create access token from Hume API",
      details: lastErrText,
      status: 404,
    },
    { status: 502 }
  );
}

export async function GET() {
  return fetchHumeToken();
}

export async function POST() {
  return fetchHumeToken();
}


