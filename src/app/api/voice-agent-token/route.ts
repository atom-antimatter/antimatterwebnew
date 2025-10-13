import { NextResponse } from "next/server";

export async function GET() {
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
      console.error("Missing API credentials");
      return NextResponse.json(
        { error: "Hume API credentials not configured. Please check HUME_API_KEY and HUME_SECRET_KEY environment variables." },
        { status: 500 }
      );
    }

    // Use OAuth2 client credentials flow (same as Hume SDK)
    console.log("Attempting to get access token using OAuth2...");
    
    const authString = Buffer.from(`${apiKey}:${secretKey}`).toString('base64');
    
    const response = await fetch(
      "https://api.hume.ai/oauth2-cc/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${authString}`,
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
        }).toString(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hume API error response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return NextResponse.json(
        { 
          error: "Failed to create access token from Hume API",
          details: errorText,
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
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

