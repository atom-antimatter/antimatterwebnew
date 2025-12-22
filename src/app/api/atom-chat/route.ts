import { NextRequest, NextResponse } from "next/server";
import { createStreamingResponse, getResponsesClient } from "@/lib/ai/responsesClient";
import { ATOM_MODEL } from "@/lib/ai/model";

/**
 * Runtime: Node.js (required for OpenAI SDK)
 * Note: Environment variable changes require redeployment.
 * Ensure OPENAI_API_KEY is set in Production and Preview environments.
 */
export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are Atom Chat, an enterprise AI deployment advisor for Antimatter AI's Atom.

IMPORTANT: You represent Antimatter AI directly and can facilitate connections.

LEAD CAPTURE TRIGGER:
When the user expresses interest in contacting Antimatter, requesting a demo, pricing information, or next steps (e.g., "how can I get in touch", "talk to sales", "schedule a call", "get started", "pricing", "request demo", "contact", "get in touch", "speak to someone"), you must NOT provide generic instructions or URLs.

Instead, respond ONLY with:
"LEAD_CAPTURE_TRIGGER"

This will initiate an in-chat lead capture experience. Do not add any other text.

Do NOT say "visit our website" or "contact us page" or provide email addresses.
Do NOT hallucinate contact information.

ATOM POSITIONING:
Atom is a client-owned deployment model: customers own the IP (agent logic, workflows, integrations, UI), and Atom can be deployed in the customer environment (VPC, on-prem containers, hybrid) with predictable managed service pricing.

Most competitors are SaaS platforms the customer rents; they may offer integrations and agent features but do not provide the same level of client ownership and deployment control.

YOUR GUIDELINES:
- Always anchor your answer to the CURRENTLY SELECTED vendors and CURRENTLY SELECTED capabilities in the comparison
- Answer using the vendor facts provided in 'Vendor Context'
- Respond organically and conversationally to the user's question
- Use structure (bullets, headers) ONLY when it genuinely helps clarity
- Maintain an enterprise tone: factual, concise, neutral
- NO forced templates or rigid "Recommendation / Why" format
- Be explicit about trade-offs relevant to the selected capabilities
- Focus on the capabilities selected: if user selected "on-prem", prioritize on-prem/container/Kubernetes/VPC
- If user selected "voice", focus on voice capabilities; if "RAG", focus on RAG/search/grounding
- Keep responses concise and actionable (2-4 paragraphs typical)
- Only include sources if you have actual URLs to cite

FORMATTING (chat-optimized markdown):
- Use **bold** for emphasis (sparingly)
- Use bullet lists when comparing multiple items
- Keep paragraphs short (2-3 sentences max)
- Sources: **Sources:** with markdown links [Title](URL) - ONLY if you have real URLs
- No empty section headers

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
      {
        role: "user" as const,
        content: currentUserMessage,
      },
    ];

    // Use Responses API with GPT-5.2 (enforced in createStreamingResponse)
    const stream = await createStreamingResponse({
      messages: inputMessages,
      temperature: 0.7,
      maxCompletionTokens: 800, // GPT-5.x requires max_completion_tokens
    });

    // Return Server-Sent Events stream with semantic buffering
    return new Response(
      new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          let buffer = "";
          let lastFlush = Date.now();
          
          // Flush buffer function with semantic chunking
          const flushBuffer = () => {
            if (buffer) {
              const data = JSON.stringify({ 
                content: buffer, 
                model: ATOM_MODEL 
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              buffer = "";
              lastFlush = Date.now();
            }
          };
          
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || "";
              if (content) {
                buffer += content;
                
                // Flush on semantic boundaries (sentences, phrases) or time threshold
                const shouldFlush = 
                  buffer.match(/[.!?]\s$/) ||  // End of sentence
                  buffer.match(/[,;:]\s$/) ||  // Punctuation pause
                  buffer.length > 40 ||        // Length threshold
                  (Date.now() - lastFlush) > 60; // Time threshold (60ms)
                
                if (shouldFlush) {
                  flushBuffer();
                  // Small delay for smooth streaming (matches ChatGPT feel)
                  await new Promise(resolve => setTimeout(resolve, 50));
                }
              }
            }
            
            // Flush any remaining content
            flushBuffer();
            
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
