import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { DiscoveryContext } from "@/components/channelPartners/PartnerDiscoveryWizard";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  messages: Message[];
  context: DiscoveryContext;
}

const PARTNER_SYSTEM_PROMPT = `You are a Channel Partner Sales Assistant for Antimatter AI's Atom platform.

CONTEXT:
Atom is a client-owned AI deployment platform where customers:
- Own the IP (agent logic, workflows, integrations, UI)
- Deploy in their own environment (VPC, on-prem, hybrid, air-gapped)
- Have full control with predictable managed service pricing
- Get enterprise-grade governance, audit logs, and traceability

YOUR ROLE:
Help channel partners sell Atom effectively by:
1. Positioning Atom against selected competitors
2. Creating battlecards with landmines, talk tracks, and objection handles
3. Drafting follow-up emails and proposals
4. Providing pricing guidance with ranges and assumptions
5. Suggesting qualification questions
6. Highlighting Antimatter's differentiators

GUIDELINES:
- Be factual and concise (enterprise tone)
- Focus on the customer priorities and deployment needs provided
- Don't fabricate certifications or capabilities
- When uncertain, acknowledge what's unknown
- Provide pricing ranges with clear assumptions (no hard commitments)
- Tie everything to the competitive context

FORMATTING:
- Use markdown with clear structure
- Bold key points sparingly
- Use bullet lists for comparisons
- Include relevant resources when appropriate

When generating comprehensive outputs (battlecard, email, proposal, pricing), structure your response as markdown that can be easily parsed and displayed in different tabs.`;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody;
    const { messages, context } = body;

    const contextSummary = `
DISCOVERY CONTEXT:
- Competitors: ${context.competitors.join(", ") || "None selected"}
- Customer Priorities: ${context.customerPriorities.join(", ") || "None selected"}
- Deployment Needs: ${context.deploymentNeeds.join(", ") || "None selected"}
- Use Case: ${context.useCase.category || "Not specified"} ${context.useCase.details ? `- ${context.useCase.details}` : ""}
- Buyer Persona: ${context.buyerPersona || "Not specified"}
`;

    const systemMessage = {
      role: "system" as const,
      content: PARTNER_SYSTEM_PROMPT + "\n\n" + contextSummary,
    };

    const chatMessages = [
      systemMessage,
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: chatMessages,
      temperature: 0.7,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              const data = JSON.stringify({ content });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Channel partner chat error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
