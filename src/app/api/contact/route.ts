import { NextResponse } from "next/server";

// Contact form email sender using Resend (https://resend.com/docs/send-with-nextjs)
// Requires RESEND_API_KEY. Sends to Matt and Paul, reply-to the submitter.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      service?: string;
      message?: string;
    };

    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const phone = (body.phone || "").trim();
    const service = (body.service || "").trim();
    const message = (body.message || "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, and message are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM || "atom@antimatterai.com";
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server is missing RESEND_API_KEY. Add it to .env.local." },
        { status: 500 }
      );
    }

    const html = `
      <div>
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ""}
        ${service ? `<p><strong>Service:</strong> ${escapeHtml(service)}</p>` : ""}
        <hr />
        <p style="white-space: pre-wrap">${escapeHtml(message)}</p>
      </div>
    `;

    const toRecipients = [
      "matt@antimatterai.com",
      "paul@antimatterai.com",
    ];

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Antimatter AI <${fromEmail}>`,
        to: toRecipients,
        subject: `New contact from ${name}`,
        html,
        reply_to: email,
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

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


