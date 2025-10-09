import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.HUME_API_KEY;
    const secretKey = process.env.HUME_SECRET_KEY;

    if (!apiKey || !secretKey) {
      return NextResponse.json(
        { error: "Hume API credentials not configured" },
        { status: 500 }
      );
    }

    // Create access token for Hume EVI
    const response = await fetch(
      "https://api.hume.ai/oauth2-cc/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: apiKey,
          client_secret: secretKey,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Hume API error:", error);
      return NextResponse.json(
        { error: "Failed to create access token" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    });
  } catch (error) {
    console.error("Error generating voice agent token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

