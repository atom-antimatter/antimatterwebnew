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

    // Generate access token using Hume's REST API
    console.log("Attempting to get access token from Hume API...");
    
    const response = await fetch(
      "https://api.hume.ai/v0/evi/chat/access_token",
      {
        method: "POST",
        headers: {
          "X-Hume-Api-Key": apiKey,
          "X-Hume-Secret-Key": secretKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
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

