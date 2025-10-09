import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.HUME_API_KEY;
    const secretKey = process.env.HUME_SECRET_KEY;

    console.log("Environment check:", {
      hasApiKey: !!apiKey,
      hasSecretKey: !!secretKey,
      apiKeyLength: apiKey?.length,
      secretKeyLength: secretKey?.length,
    });

    if (!apiKey || !secretKey) {
      console.error("Missing credentials:", {
        apiKey: apiKey ? "present" : "missing",
        secretKey: secretKey ? "present" : "missing",
      });
      return NextResponse.json(
        { error: "Hume API credentials not configured. Please check environment variables." },
        { status: 500 }
      );
    }

    // Create access token for Hume EVI
    console.log("Attempting to fetch access token from Hume...");
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
      console.error("Hume API error response:", {
        status: response.status,
        statusText: response.statusText,
        body: error,
      });
      return NextResponse.json(
        { 
          error: "Failed to create access token from Hume API",
          details: error,
          status: response.status 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Successfully got access token");

    return NextResponse.json({
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    });
  } catch (error) {
    console.error("Error generating voice agent token:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

