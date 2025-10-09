import { NextResponse } from "next/server";

// POST /api/contact
// Sends contact form submissions via Resend to matt@antimatterai.com
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      service?: string;
      message?: string;
    };

    const { name, email, phone, service, message } = body || {};

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, message" },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = "matt@antimatterai.com";
    const fromEmail = process.env.CONTACT_FROM_EMAIL || "contact@antimatter.ai";
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Server is missing RESEND_API_KEY. Add it to .env / Vercel env.",
        },
        { status: 500 }
      );
    }

    const subject = `New contact form submission from ${name}`;
    const html = `
		  <div style="font-family:Inter,system-ui,Arial,sans-serif;line-height:1.6;color:#0b0b0b">
		    <h2 style="margin:0 0 12px">New Contact Submission</h2>
		    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
		    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
		    ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ""}
		    ${service ? `<p><strong>Service:</strong> ${escapeHtml(service)}</p>` : ""}
		    <p><strong>Message:</strong></p>
		    <div style="white-space:pre-wrap;border:1px solid #eee;padding:12px;border-radius:8px;background:#fafafa">${escapeHtml(
          message
        )}</div>
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
        to: [toEmail],
        reply_to: email,
        subject,
        html,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Resend API error:", errText);
      return NextResponse.json(
        { error: "Email send failed. Please check Resend API configuration.", details: errText },
        { status: 502 }
      );
    }

    const data = await resp.json();

    // Send confirmation email to the submitter (non-fatal if it fails)
    let confirmationId: string | null = null;
    try {
      const confirmSubject = "We've received your message at Antimatter AI";
      const confirmHtml = `
			  <div style="font-family:Inter,system-ui,Arial,sans-serif;line-height:1.6;color:#0b0b0b">
			    <h2 style="margin:0 0 12px">Thanks for reaching out, ${escapeHtml(
            name
          )}!</h2>
			    <p>We received your message and will get back to you shortly.</p>
			    <p><strong>Summary</strong></p>
			    <ul style="padding-left:18px">
			      <li><strong>Name:</strong> ${escapeHtml(name)}</li>
			      <li><strong>Email:</strong> ${escapeHtml(email)}</li>
			      ${phone ? `<li><strong>Phone:</strong> ${escapeHtml(phone)}</li>` : ""}
			      ${
              service
                ? `<li><strong>Service:</strong> ${escapeHtml(service)}</li>`
                : ""
            }
			    </ul>
			    <p><strong>Your message:</strong></p>
			    <div style="white-space:pre-wrap;border:1px solid #eee;padding:12px;border-radius:8px;background:#fafafa">${escapeHtml(
            message
          )}</div>
			    <p style="margin-top:12px">— The Antimatter AI Team</p>
			  </div>
			`.trim();

      const confirmResp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `Antimatter AI <${fromEmail}>`,
          to: [email],
          subject: confirmSubject,
          html: confirmHtml,
        }),
      });
      if (confirmResp.ok) {
        const confirmData = await confirmResp.json();
        confirmationId = confirmData?.id || null;
      }
    } catch {}

    return NextResponse.json({
      ok: true,
      id: data?.id || null,
      confirmationId,
    });
  } catch (e) {
	console.error("Contact API error:", e);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}

function escapeHtml(input?: string) {
  if (!input) return "";
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
