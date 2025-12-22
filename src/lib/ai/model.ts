/**
 * CRITICAL: Single Source of Truth for Atom Chat AI Model
 * 
 * DO NOT modify this without updating all dependent systems.
 * All Atom Chat AI requests MUST use this exact model string.
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
 * Runtime safeguard - throws if ChatCompletion API is used
 * This should never be called - we only use Responses API
 */
export function preventChatCompletions(): void {
  throw new Error(
    "❌ Atom Chat violation: chat.completions is forbidden. Use client.responses.create() only."
  );
}

export type AtomModelType = typeof ATOM_MODEL;

