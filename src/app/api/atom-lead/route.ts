import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface LeadData {
  name: string;
  email: string;
  company?: string;
  interest?: string;
  notes?: string;
  comparingVendors: string[];
  userMessage?: string;
  context: {
    vendors: string[];
    url: string;
    timestamp: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const data: LeadData = await req.json();

    // Validate required fields
    if (!data.name || !data.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
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

    // Send via Resend (matching Contact page behavior)
    const apiKey = process.env.resend_key_new || process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM || "onboarding@resend.dev";
    
    if (!apiKey) {
      console.warn("[Atom Lead] Resend not configured - lead logged only");
      console.log("[Atom Lead]", {
        ...data,
        timestamp: new Date().toISOString(),
      });
      
      return NextResponse.json({
        ok: true,
        message: "Thanks — we'll reach out shortly.",
        warning: "Email notification not sent (Resend not configured)",
      });
    }

    const subject = `Atom Chat Lead: ${data.name}`;
    const html = `
      <div style="font-family:Inter,system-ui,Arial,sans-serif;line-height:1.6;color:#0b0b0b">
        <h2 style="margin:0 0 12px;color:#6366f1">Atom Chat Lead Captured</h2>
        <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
        ${data.company ? `<p><strong>Company:</strong> ${escapeHtml(data.company)}</p>` : ""}
        ${data.interest ? `<p><strong>Looking to deploy:</strong> ${escapeHtml(data.interest)}</p>` : ""}
        ${data.notes ? `<p><strong>Notes:</strong></p><div style="white-space:pre-wrap;border:1px solid #eee;padding:12px;border-radius:8px;background:#fafafa">${escapeHtml(data.notes)}</div>` : ""}
        
        <hr style="margin:20px 0;border:none;border-top:1px solid #eee" />
        
        <h3 style="margin:16px 0 8px;color:#6366f1;font-size:16px">Context</h3>
        <p><strong>Source:</strong> Atom Chat Widget</p>
        <p><strong>Comparing vendors:</strong> ${data.comparingVendors.join(", ")}</p>
        ${data.userMessage ? `<p><strong>User message that triggered form:</strong></p><div style="white-space:pre-wrap;border:1px solid #eee;padding:12px;border-radius:8px;background:#fafafa">${escapeHtml(data.userMessage)}</div>` : ""}
        <p><strong>URL:</strong> <a href="${escapeHtml(data.context.url)}">${escapeHtml(data.context.url)}</a></p>
        <p><strong>Timestamp:</strong> ${new Date(data.context.timestamp).toLocaleString()}</p>
      </div>
    `.trim();

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Antimatter AI <${fromEmail}>`,
        to: ["matt@antimatterai.com"],
        reply_to: data.email,
        subject,
        html,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("[Atom Lead] Resend API error:", errText);
      
      return NextResponse.json({
        ok: true,
        message: "Thanks — we'll reach out shortly.",
        warning: "Email notification failed but lead was logged",
      });
    }

    const resendData = await resp.json();
    console.log("[Atom Lead] Email sent successfully:", resendData?.id);

    return NextResponse.json({
      ok: true,
      message: "Thanks — we'll reach out shortly.",
      emailId: resendData?.id,
    });
  } catch (error) {
    console.error("[Atom Lead] Error:", error);
    return NextResponse.json(
      { error: "Failed to submit lead" },
      { status: 500 }
    );
  }
}

function escapeHtml(input?: string) {
  if (!input) return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
