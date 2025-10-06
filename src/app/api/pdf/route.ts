import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return renderPdf(request);
}

export async function PUT(request: Request) { // backwards compatibility
  return renderPdf(request);
}

async function renderPdf(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { html } = body as { html?: string };
    if (!html) {
      return NextResponse.json({ error: "Missing html" }, { status: 400 });
    }

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    try {
      const page = await browser.newPage();
      const documentHtml = `<!doctype html><html><head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          @page { margin: 18mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Inter, Helvetica, Arial, sans-serif; color: #0B0B12; line-height: 1.65; }
          h1 { font-size: 22px; margin: 0 0 8px; }
          h2 { font-size: 18px; margin: 18px 0 8px; }
          h3 { font-size: 15px; margin: 12px 0 6px; }
          p { margin: 8px 0; }
          ul { margin: 8px 0 8px 18px; }
          li { margin: 4px 0; }
          .header { display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px; }
          .badge { font-size: 11px; color: #666; }
        </style>
      </head><body>
        <div class="header">
          <div class="badge">Antimatter AI • antimatterai.com</div>
        </div>
        <main>${html}</main>
      </body></html>`;

      await page.setContent(documentHtml, { waitUntil: "networkidle0" });
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: false,
        margin: { top: "18mm", bottom: "18mm", left: "16mm", right: "16mm" },
      });
      await page.close();
      await browser.close();

      const arrayBuffer = pdfBuffer.buffer.slice(
        pdfBuffer.byteOffset,
        pdfBuffer.byteOffset + pdfBuffer.byteLength
      );
      return new Response(arrayBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=Antimatter-AI-Website-Audit.pdf",
          "Cache-Control": "no-store",
        },
      });
    } catch (e) {
      await browser.close();
      throw e;
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "PDF error" }, { status: 500 });
  }
}


