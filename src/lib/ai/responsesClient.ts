import OpenAI from "openai";
import { ATOM_MODEL, validateAtomModel } from "./model";

let _openai: OpenAI | null = null;

/**
 * Get OpenAI client configured for Atom Chat
 * This is the ONLY way to access OpenAI in Atom Chat
 * 
 * NOTE: While we use chat.completions internally, this wrapper ensures:
 * - Model is locked to GPT-5.2
 * - All requests are validated
 * - Consistent streaming behavior
 */
export function getResponsesClient(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    // Validation: Fail fast with clear error
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY environment variable is not set. Configure in Vercel dashboard."
      );
    }
    
    // Validate key format - OpenAI keys start with "sk-"
    if (apiKey.startsWith("sk-th-")) {
      throw new Error(
        "Invalid API key: OPENAI_API_KEY should not start with 'sk-th-'. You may be using THESYS_API_KEY by mistake."
      );
    }
    
    if (!apiKey.startsWith("sk-")) {
      throw new Error(
        "Invalid OPENAI_API_KEY format. OpenAI keys should start with 'sk-'."
      );
    }
    
    _openai = new OpenAI({ apiKey });
  }
  
  return _openai;
}

/**
 * Create a streaming response for Atom Chat
 * ONLY function for making AI calls in Atom Chat
 * 
 * This wrapper ensures:
 * - GPT-5.2 is always used
 * - Streaming is enabled
 * - Proper error handling
 */
export async function createStreamingResponse(params: {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  temperature?: number;
  maxTokens?: number;
}) {
  const client = getResponsesClient();
  
  // CRITICAL: Validate model before every request
  validateAtomModel(ATOM_MODEL);
  
  console.log(`[Atom Chat] Creating streaming response with ${ATOM_MODEL}`);
  
  // Create streaming chat completion with locked model
  const stream = await client.chat.completions.create({
    model: ATOM_MODEL,
    messages: params.messages.map(m => ({
      role: m.role,
      content: m.content
    })),
    stream: true,
    temperature: params.temperature ?? 0.7,
    max_tokens: params.maxTokens ?? 800,
  });
  
  return stream;
}
