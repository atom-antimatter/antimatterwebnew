import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// POST /api/contact
// Saves contact form submissions to Supabase and sends email via Resend
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      companyEmail?: string;
      phone?: string;
      service?: string;
      budget?: string;
      message?: string;
    };

    const { name, email, companyEmail, phone, service, budget, message } = body || {};

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, message" },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase credentials");
    }

    const supabase = supabaseUrl && supabaseServiceKey 
      ? createClient(supabaseUrl, supabaseServiceKey)
      : null;

    // Save to Supabase first (so we never lose a lead)
    let submissionId: string | null = null;
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("contact_submissions")
          .insert({
            name,
            email,
            phone,
            service,
            message,
            source: "contact_form",
            email_sent: false,
            metadata: {
              companyEmail,
              budget,
            },
          })
          .select()
          .single();

        if (error) {
          console.error("Supabase insert error:", error);
        } else {
          submissionId = data?.id || null;
          console.log("Saved submission to Supabase:", submissionId);
        }
      } catch (err) {
        console.error("Failed to save to Supabase:", err);
      }
    }

    const apiKey = process.env.resend_key_new || process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM || "onboarding@resend.dev";
    
    if (!apiKey) {
      // Even without Resend, we saved to Supabase
      return NextResponse.json({
        ok: true,
        id: submissionId,
        warning: "Email notification not sent (Resend not configured)",
      });
    }

    const subject = `New contact form submission from ${name}`;
    const html = `
		  <div style="font-family:Inter,system-ui,Arial,sans-serif;line-height:1.6;color:#0b0b0b">
		    <h2 style="margin:0 0 12px;color:#6366f1">New Contact Submission</h2>
		    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
		    <p><strong>Personal Email:</strong> ${escapeHtml(email)}</p>
		    ${companyEmail ? `<p><strong>Company Email:</strong> ${escapeHtml(companyEmail)}</p>` : ""}
		    ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ""}
		    ${service ? `<p><strong>Service:</strong> ${escapeHtml(service)}</p>` : ""}
		    ${budget ? `<p><strong>Budget:</strong> ${escapeHtml(budget)}</p>` : ""}
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
        to: ["matt@antimatterai.com"], // Hardcoded - always send to Matt
        reply_to: email,
        subject,
        html,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Resend API error:", errText);
      
      // Update Supabase with error
      if (supabase && submissionId) {
        await supabase
          .from("contact_submissions")
          .update({ email_error: errText })
          .eq("id", submissionId);
      }
      
      // Still return success since we saved to Supabase
      return NextResponse.json({
        ok: true,
        id: submissionId,
        warning: "Form submitted successfully, but email notification failed",
        emailError: errText,
      });
    }

    const data = await resp.json();
    
    // Update Supabase to mark email as sent
    if (supabase && submissionId) {
      await supabase
        .from("contact_submissions")
        .update({ email_sent: true })
        .eq("id", submissionId);
    }

    // Send confirmation email to the submitter (non-fatal if it fails)
    let confirmationId: string | null = null;
    try {
      const confirmSubject = "We've received your message at Antimatter AI";
      const confirmHtml = `
			  <div style="font-family:Inter,system-ui,Arial,sans-serif;line-height:1.6;color:#0b0b0b">
			    <h2 style="margin:0 0 12px;color:#6366f1">Thanks for reaching out, ${escapeHtml(
            name
          )}!</h2>
			    <p>We received your message and will get back to you shortly.</p>
			    <p><strong>Summary of your submission:</strong></p>
			    <ul style="padding-left:18px">
			      <li><strong>Name:</strong> ${escapeHtml(name)}</li>
			      <li><strong>Email:</strong> ${escapeHtml(email)}</li>
			      ${companyEmail ? `<li><strong>Company Email:</strong> ${escapeHtml(companyEmail)}</li>` : ""}
			      ${phone ? `<li><strong>Phone:</strong> ${escapeHtml(phone)}</li>` : ""}
			      ${service ? `<li><strong>Service:</strong> ${escapeHtml(service)}</li>` : ""}
			      ${budget ? `<li><strong>Budget:</strong> ${escapeHtml(budget)}</li>` : ""}
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
      id: submissionId,
      emailId: data?.id || null,
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
