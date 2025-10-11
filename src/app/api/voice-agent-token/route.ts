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

  const resp = await fetch("https://api.hume.ai/v0/stream/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ttl: ttlSeconds }),
  });

  if (!resp.ok) {
    const err = await resp.text().catch(() => "");
    return NextResponse.json(
      { error: "Hume token request failed", details: err },
      { status: 502 }
    );
  }

  const data = (await resp.json()) as { token?: string };
  if (!data?.token) {
    return NextResponse.json(
      { error: "Hume response missing token" },
      { status: 502 }
    );
  }
  return NextResponse.json({ token: data.token });
}

export async function GET() {
  return fetchHumeToken();
}

export async function POST() {
  return fetchHumeToken();
}


