import { Hume, HumeClient } from "hume";
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

    // Use Hume SDK to get access token
    console.log("Attempting to get access token using Hume SDK...");
    
    const client = new HumeClient({
      apiKey: apiKey,
      secretKey: secretKey,
    });

    // Generate access token using the SDK
    const accessToken = await client.empathicVoice.chat.getAccessToken();
    
    console.log("Successfully got access token via Hume SDK");

    return NextResponse.json({
      accessToken: accessToken,
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

