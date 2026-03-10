import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface Message { role: "user" | "assistant"; content: string }

const ICC_SYSTEM_PROMPT = `You are an ICC AI Code Search Assistant prototype. You help ICC members discover relevant codebooks, sections, and proposal-related guidance using ICC's publicly available code structure.

BEHAVIOR:
- Answer questions about ICC code families, proposal lifecycle, and code content discovery.
- Always cite which codebook, chapter, or section your answer references (e.g. "IBC Section 907", "IECC Chapter 4").
- Format citations as **[Source: IBC Section 907]** at the end of relevant paragraphs.
- If the question is ambiguous, ask a clarifying question instead of guessing.
- Keep initial answers concise (2-3 sentences), then offer to expand.
- When asked about proposals, reference the ICC proposal lifecycle stages: submission, review, modification, committee action, public comment, hearing, final action.

CONSTRAINTS:
- You are a read-only assistant. You cannot modify proposals or code text.
- Answers are for research and discovery only, not authoritative code interpretation.
- Add a brief disclaimer when providing code-related guidance: "This is for research purposes. Official ICC publications govern all compliance determinations."

CODE FAMILIES YOU KNOW ABOUT:
IBC (International Building Code), IRC (International Residential Code), IECC (International Energy Conservation Code), IFC (International Fire Code), IMC (International Mechanical Code), IPC (International Plumbing Code), IEBC (International Existing Building Code), ISPSC (International Swimming Pool and Spa Code).

FORMAT:
- Use markdown with clear structure
- Bold key terms
- Use bullet lists for multiple items
- Include citation tags in **[Source: ...]** format`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = (await request.json()) as { messages: Message[] };

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: ICC_SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.4,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          console.error("[icc-chat] stream error:", err);
          controller.error(err);
        }
      },
    });

    return new NextResponse(readable, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  } catch (err) {
    console.error("[icc-chat] error:", err);
    return NextResponse.json({ error: "Failed to process" }, { status: 500 });
  }
}
