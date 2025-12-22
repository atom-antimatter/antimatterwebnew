"use server";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

let _openai: OpenAI | null = null;

function getOpenAI() {
  if (!_openai) {
    const apiKey = process.env.THESYS_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("THESYS_API_KEY or OPENAI_API_KEY must be set for Atom Chat");
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
- If a user asks for something not in context, ask a short follow-up or say you don't have that detail and suggest verifying with vendor documentation
- Be explicit about trade-offs (platform lock-in vs ownership; speed vs control; ecosystem fit)
- Provide structured comparisons (bullets, small tables) when helpful
- Keep it concise unless the user asks for depth
- Never reveal secrets, API keys, or internal implementation details
- Maintain an enterprise, confident, helpful tone — not salesy fluff

FOCUS AREAS:
- Deployment models (SaaS, VPC, on-prem, hybrid)
- IP ownership (who owns the agent logic and data)
- Security and compliance (data residency, audit logs, policy controls)
- Technical capabilities (tool calling, voice, RAG, GenUI, multi-agent)
- Vendor lock-in vs portability
- Total cost of ownership (licensing, platform fees, managed service)`;

export async function POST(req: NextRequest) {
  try {
    const { messages, selectedVendors, selectedFilters } = await req.json();

    // Build vendor context
    const vendorContext = selectedVendors
      .map((v: any) => {
        return `${v.name}:
- Deployment: ${v.deployment}
- IP Ownership: ${v.ipOwnership}
- Best Fit: ${v.bestFit}
- Key Capabilities: ${Object.entries(v.capabilities)
          .filter(([_, value]) => value === true || value === "partial")
          .map(([key]) => key)
          .join(", ")}
- vs Atom: ${v.differentiatorVsAtom || "N/A"}`;
      })
      .join("\n\n");

    const contextMessage = `Vendor Context (directional, for comparison):

${vendorContext}

Selected Capabilities the user is filtering by: ${selectedFilters.join(", ") || "None"}

The user is comparing: ${selectedVendors.map((v: any) => v.name).join(", ")}`;

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
      max_tokens: 500,
    });

    return NextResponse.json({
      message: completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.",
    });
  } catch (error) {
    console.error("Atom Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

