import { NextResponse } from "next/server";

// Lightweight email sender using Resend (https://resend.com)
// Expects RESEND_API_KEY in env. Client sends HTML string to email.

export async function POST(request: Request) {
  try {
    const { to, subject, html, pdfBase64 } = (await request.json()) as {
      to?: string;
      subject?: string;
      html?: string;
      pdfBase64?: string; // optional base64-encoded PDF attachment
    };

    if (!to || !html) {
      return NextResponse.json({ error: "Missing 'to' or 'html'" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM || "atom@antimatterai.com";
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server is missing RESEND_API_KEY. Add it to .env.local." },
        { status: 500 }
      );
    }

    // sanitize and validate recipients
    const raw = String(to || "").trim();
    const pieces = raw.split(/[;,]/).map((s) => s.trim()).filter(Boolean);
    const emails = (pieces.length > 0 ? pieces : [raw]).map((s) => s.trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const recipients = emails.filter((e) => emailRegex.test(e));
    if (recipients.length === 0) {
      return NextResponse.json({ error: "Invalid recipient email address" }, { status: 422 });
    }

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Antimatter AI <${fromEmail}>`,
        to: recipients,
        subject: subject || "Your Antimatter AI Website Audit",
        html,
        attachments: pdfBase64
          ? [
              {
                filename: "Antimatter-AI-Website-Audit.pdf",
                content: pdfBase64,
                type: "application/pdf",
              },
            ]
          : undefined,
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return NextResponse.json({ error: "Email send failed", details: err }, { status: 502 });
    }

    const data = await resp.json();
    return NextResponse.json({ ok: true, id: data?.id || null });
  } catch (e) {
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}


