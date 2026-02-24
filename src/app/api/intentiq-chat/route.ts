import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

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
}

const INTENTIQ_SYSTEM_PROMPT = `You are Atom IntentIQ, a buyer intent analysis system for Antimatter AI.

ABOUT ANTIMATTER AI:
- Antimatter AI builds enterprise AI systems
- Services: AI architecture, design, development, automation, agent systems
- Focus: Secure deployments (VPC, on-prem, edge)
- Experience in regulated industries
- Emphasis on human + AI collaboration
- Tagline: Building Solutions that Matter
- Atlanta-based, enterprise-focused

ABOUT ATOM PLATFORM:
- Atom Enterprise: model-agnostic enterprise deployment framework
- Atom Agentic: autonomous AI agents that execute workflows
- Atom Voice: AI voice agents
- Atom Search: generative AI search with structured retrieval
- Atom IntentIQ: buyer intelligence layer for pipeline scoring

YOUR TASK:
Analyze the conversation and return structured insights about buyer intent.

RESPONSE FORMAT:
You MUST return ONLY valid JSON in this EXACT format:

{
  "assistant_response": "Your conversational response to the user",
  "sentiment_score": 75,
  "intent_score": 85,
  "buyer_stage": "Evaluation",
  "topics": ["Security", "Compliance", "Deployment"],
  "urgency_level": "High",
  "recommended_next_actions": [
    "Schedule technical deep-dive",
    "Share security documentation",
    "Discuss pricing and timeline"
  ],
  "follow_up_email": "Subject: Following up on our Atom Enterprise discussion\\n\\nHi [Name],\\n\\nThank you for discussing your enterprise AI needs today...\\n\\nBest regards,\\n[Your Name]",
  "proposal_outline": "# Proposal Outline\\n\\n## Executive Summary\\nAntimatter AI will deploy Atom Enterprise...\\n\\n## Scope\\n- Phase 1: Discovery and architecture\\n- Phase 2: Pilot deployment\\n- Phase 3: Production rollout",
  "suggested_pricing_range": "$50K-$150K for initial deployment + $10K-$30K/month managed services"
}

SCORING GUIDELINES:
- sentiment_score (0-100): How positive/receptive the buyer is
- intent_score (0-100): How likely they are to purchase
- buyer_stage: Research | Evaluation | Shortlist | Decision
- urgency_level: Low | Medium | High
- topics: Extract 3-5 key discussion topics
- recommended_next_actions: 2-4 specific tactical next steps
- follow_up_email: Professional email they can copy/paste
- proposal_outline: Brief proposal structure with phases
- suggested_pricing_range: Realistic ranges with context

RULES:
- Always return valid JSON
- Be realistic about scoring
- Base intent on conversation signals (questions about pricing, timeline, security = high intent)
- Extract actual topics discussed
- Make emails and proposals professional and ready to use
- Pricing should reflect enterprise AI project scope`;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody;
    const { messages } = body;

    const systemMessage = {
      role: "system" as const,
      content: INTENTIQ_SYSTEM_PROMPT,
    };

    const chatMessages = [
      systemMessage,
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: chatMessages,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content || "{}";
    
    try {
      const parsed = JSON.parse(content);
      
      // Validate required fields
      const validated = {
        assistant_response: parsed.assistant_response || "I'm analyzing this conversation...",
        sentiment_score: Math.min(100, Math.max(0, parsed.sentiment_score || 50)),
        intent_score: Math.min(100, Math.max(0, parsed.intent_score || 50)),
        buyer_stage: ["Research", "Evaluation", "Shortlist", "Decision"].includes(parsed.buyer_stage) 
          ? parsed.buyer_stage 
          : "Research",
        topics: Array.isArray(parsed.topics) ? parsed.topics.slice(0, 10) : [],
        urgency_level: ["Low", "Medium", "High"].includes(parsed.urgency_level)
          ? parsed.urgency_level
          : "Medium",
        recommended_next_actions: Array.isArray(parsed.recommended_next_actions) 
          ? parsed.recommended_next_actions.slice(0, 6) 
          : [],
        follow_up_email: parsed.follow_up_email || "",
        proposal_outline: parsed.proposal_outline || "",
        suggested_pricing_range: parsed.suggested_pricing_range || "",
      };

      return NextResponse.json(validated);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response as JSON:", parseError);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("IntentIQ chat error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
