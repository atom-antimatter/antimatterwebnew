import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * Runtime: Node.js (required for OpenAI SDK)
 * Note: Environment variable changes require redeployment.
 * Ensure OPENAI_API_KEY is set in Production and Preview environments.
 */
export const runtime = "nodejs";

let _openai: OpenAI | null = null;

function getOpenAI() {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    // Validation: Fail fast with clear error
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set. Configure in Vercel dashboard.");
    }
    
    // Validate key format - OpenAI keys start with "sk-" (not "sk-th-" which is Thesys)
    if (apiKey.startsWith("sk-th-")) {
      throw new Error("Invalid API key: OPENAI_API_KEY should not start with 'sk-th-'. You may be using THESYS_API_KEY by mistake.");
    }
    
    if (!apiKey.startsWith("sk-")) {
      throw new Error("Invalid OPENAI_API_KEY format. OpenAI keys should start with 'sk-'.");
    }
    
    _openai = new OpenAI({
      apiKey,
    });
  }
  return _openai;
}

const SYSTEM_PROMPT = `You are Atom Chat, an enterprise AI deployment advisor for Antimatter AI's Atom.

Your job is to help users understand the comparison they are viewing on the Enterprise AI Vendor Matrix page.

ATOM POSITIONING:
Atom is a client-owned deployment model: customers own the IP (agent logic, workflows, integrations, UI), and Atom can be deployed in the customer environment (VPC, on-prem containers, hybrid) with predictable managed service pricing.

Most competitors are SaaS platforms the customer rents; they may offer integrations and agent features but do not provide the same level of client ownership and deployment control.

YOUR GUIDELINES:
- Always anchor your answer to the CURRENTLY SELECTED vendors and CURRENTLY SELECTED capabilities in the comparison
- Answer using the vendor facts provided in 'Vendor Context'
- Do NOT include a "Sources:" section unless you actually cite sources with URLs
- Never output empty section headers or "No live browsing used" statements
- Only add **Sources:** if you provide actual clickable links [Title](URL)
- Be explicit about trade-offs relevant to the selected capabilities
- Focus on the TOOLS selected: if user selected "on-prem", prioritize on-prem/container/Kubernetes/VPC
- If user selected "voice", focus on voice capabilities; if "RAG", focus on RAG/search/grounding
- Keep it concise and actionable

RESPONSE STRUCTURE (use this format):
1. **Recommendation** (1-2 sentences direct answer)
2. **Why** (2-4 bullets based on selected capabilities)
3. **What to validate** (2-3 procurement checkpoints)
4. **Sources** (only if browsing used)

FORMATTING (chat-optimized markdown):
- Use **bold** for emphasis and section labels (NOT ### headers)
- Use bullet lists (- item) for Why/Validate sections
- Keep paragraphs short (2-3 sentences max)
- Sources: **Sources:** with markdown links [Title](URL)
- No raw ### headers; use **Label:** instead

FOCUS ON SELECTED CAPABILITIES:
- If "onPrem" or "customerOwnsIP" selected: emphasize ownership, data residency, audit logs, air-gapped deployments
- If "voice" selected: focus on voice-to-voice, telephony, real-time streaming
- If "rag" selected: focus on enterprise search, citations, structured data connectors
- If "toolCalling" selected: focus on action execution, workflow automation, API integrations
- If "genUI" selected: focus on dynamic UI generation, custom experiences
- Always tie answers to the selected vendors being compared`;

export async function POST(req: NextRequest) {
  const requestId = req.headers.get("x-vercel-id") || `local-${Date.now()}`;
  
  try {
    const { messages, selectedVendors, selectedFilters } = await req.json();

    // Build vendor context for system instructions
    const vendorContext = selectedVendors
      .map((v: any) => {
        return `${v.name}:
- Deployment: ${v.deployment}
- IP Ownership: ${v.ipOwnership}
- Best Fit: ${v.bestFit}
- Key Capabilities: ${Object.entries(v.capabilities || {})
          .filter(([_, value]) => value === true || value === "partial")
          .map(([key]) => key)
          .join(", ")}
- vs Atom: ${v.differentiatorVsAtom || "N/A"}`;
      })
      .join("\n\n");

    const capabilitiesText = selectedFilters.join(", ") || "None";
    const vendorNames = selectedVendors.map((v: any) => v.name).join(", ");

    const contextMessage = `Vendor Context (directional, for comparison):

${vendorContext}

Selected Capabilities: ${capabilitiesText}
Comparing: ${vendorNames}`;

    // Get conversation history (excluding current user message)
    const conversationHistory = messages.slice(0, -1);
    const currentUserMessage = messages[messages.length - 1]?.content || "";

    // Build input messages for Responses API
    const inputMessages = [
      {
        role: "system" as const,
        content: `${SYSTEM_PROMPT}\n\n${contextMessage}`,
      },
      ...conversationHistory.map((m: Message) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // Use streaming for faster perceived performance
    const stream = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [
        ...inputMessages,
        {
          role: "user",
          content: currentUserMessage,
        },
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 600,
    });

    // Return Server-Sent Events stream
    return new Response(
      new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || "";
              if (content) {
                const data = JSON.stringify({ content, model: "GPT-4o" });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              }
            }
            
            // Send done signal
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
            controller.close();
          } catch (streamError) {
            console.error(`[Atom Chat] Stream error (request_id: ${requestId}):`, streamError);
            controller.error(streamError);
          }
        },
      }),
      {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Request-Id": requestId,
        },
      }
    );
  } catch (error: any) {
    console.error(`[Atom Chat] Error (request_id: ${requestId}):`, error);
    
    // Return specific error messages for debugging
    const errorMessage = error.message || "Failed to process chat request";
    const statusCode = error.status || 500;
    
    return NextResponse.json(
      { 
        error: errorMessage,
        request_id: requestId,
      },
      { status: statusCode }
    );
  }
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

