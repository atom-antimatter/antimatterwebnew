import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface LeadData {
  name: string;
  email: string;
  company: string;
  role?: string;
  deploymentPreference: string;
  comparingVendors: string[];
  notes?: string;
  context: {
    vendors: string[];
    capabilities: string[];
    url: string;
    timestamp: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const data: LeadData = await req.json();

    // Validate required fields
    if (!data.name || !data.email || !data.company) {
      return NextResponse.json(
        { error: "Name, email, and company are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Log lead (in production, send to CRM)
    console.log("[Atom Lead]", {
      ...data,
      timestamp: new Date().toISOString(),
    });

    // TODO: Send to CRM webhook if configured
    // if (process.env.CRM_WEBHOOK_URL) {
    //   await fetch(process.env.CRM_WEBHOOK_URL, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(data),
    //   });
    // }

    return NextResponse.json({
      ok: true,
      message: "Thanks — we'll reach out shortly.",
    });
  } catch (error) {
    console.error("[Atom Lead] Error:", error);
    return NextResponse.json(
      { error: "Failed to submit lead" },
      { status: 500 }
    );
  }
}

