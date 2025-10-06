import { NextResponse } from "next/server";

// Lightweight email sender using Resend (https://resend.com)
// Expects RESEND_API_KEY in env. Client sends HTML string to email.

export async function POST(request: Request) {
  try {
    const { to, subject, html } = (await request.json()) as {
      to?: string;
      subject?: string;
      html?: string;
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

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Antimatter AI <${fromEmail}>`,
        to: [to],
        bcc: ["matt@antimatterai.com", "paul@antimatterai.com"],
        subject: subject || "Your Antimatter AI Website Audit",
        html,
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


