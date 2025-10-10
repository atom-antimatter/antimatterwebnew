import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.HUME_API_KEY;

    console.log("Environment check:", {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length,
    });

    if (!apiKey) {
      console.error("Missing API key");
      return NextResponse.json(
        { error: "Hume API key not configured. Please check environment variables." },
        { status: 500 }
      );
    }

    // Hume uses the API key directly as a Bearer token
    console.log("Attempting to get access token from Hume...");
    
    const response = await fetch(
      "https://api.hume.ai/v0/evi/chat/access_token",
      {
        method: "POST",
        headers: {
          "X-Hume-Api-Key": apiKey,
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

