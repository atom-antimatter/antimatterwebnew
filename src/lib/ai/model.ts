/**
 * CRITICAL: Single Source of Truth for Atom Chat AI Model
 * 
 * DO NOT modify this without updating all dependent systems.
 * All Atom Chat AI requests MUST use this exact model string.
 * 
 * IMPORTANT: GPT-5.x models require max_completion_tokens, NOT max_tokens
 */

export const ATOM_MODEL = "gpt-5.2" as const;

/**
 * Runtime safeguard - throws if wrong model is used
 * Call this before every AI request
 */
export function validateAtomModel(model: string): void {
  if (model !== ATOM_MODEL) {
    throw new Error(
      `❌ Atom Chat violation: Only ${ATOM_MODEL} is allowed. Attempted to use: ${model}`
    );
  }
}

/**
 * Check if model is GPT-5.x family (requires max_completion_tokens)
 */
export function isGPT5Model(model: string): boolean {
  return model.startsWith("gpt-5");
}

/**
 * Runtime safeguard - throws if ChatCompletion API is used
 * This should never be called - we only use Responses API
 */
export function preventChatCompletions(): void {
  throw new Error(
    "❌ Atom Chat violation: chat.completions is forbidden. Use client.responses.create() only."
  );
}

export type AtomModelType = typeof ATOM_MODEL;

