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
- Answer using ONLY the vendor facts provided in the 'Vendor Context' you receive
- If a user asks for something not in context, use web search to find current information from vendor websites
- Be explicit about trade-offs (platform lock-in vs ownership; speed vs control; ecosystem fit)
- Provide structured comparisons using markdown formatting
- Keep it concise unless the user asks for depth
- Never reveal secrets, API keys, or internal implementation details
- Maintain an enterprise, confident, helpful tone — not salesy fluff

FORMATTING:
- Use **bold** for emphasis instead of headers
- Use bullet lists (- item) for comparisons
- Keep paragraphs short and scannable
- If citing sources, include them at the end in a **Sources:** section with markdown links: [Title](URL)
- Avoid using ### headers; use **Section Label:** instead for cleaner chat display

FOCUS AREAS:
- Deployment models (SaaS, VPC, on-prem, hybrid)
- IP ownership (who owns the agent logic and data)
- Security and compliance (data residency, audit logs, policy controls)
- Technical capabilities (tool calling, voice, RAG, GenUI, multi-agent)
- Vendor lock-in vs portability
- Total cost of ownership (licensing, platform fees, managed service)`;

export async function POST(req: NextRequest) {
  const requestId = req.headers.get("x-vercel-id") || `local-${Date.now()}`;
  
  try {
    const { messages, selectedVendors, selectedFilters } = await req.json();

    // Build vendor context
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

    // Note: Web search would require OpenAI's experimental API or external search integration
    // For now, using standard chat completions with expanded context
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "system", content: contextMessage },
        ...messages.map((m: Message) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    return NextResponse.json({
      message: completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.",
      request_id: requestId,
    });
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

