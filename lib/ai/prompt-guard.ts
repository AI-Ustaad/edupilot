// lib/ai/prompt-guard.ts
// 🛡️ Prompt Injection Protection for AI Routes

export interface SanitizedInput {
  content: string;
  isValid: boolean;
  reason?: string;
}

// ==========================================
// 1. DANGEROUS PATTERNS (Prompt Injection Attempts)
// ==========================================
const INJECTION_PATTERNS: RegExp[] = [
  /ignore previous instructions/i,
  /forget everything/i,
  /you are now/i,
  /system prompt/i,
  /reveal your (instructions|prompt|rules)/i,
  /act as (if|a)/i,
  /pretend (you are|to be)/i,
  /new (instructions|rules)/i,
  /override (previous|your)/i,
  /disregard (all|previous)/i,
  /show me (all|every) (students|data|records)/i,
  /list (all|every) (students|users|schools)/i,
  /export (all|everything)/i,
  /give me access to/i,
  /bypass (security|auth|permission)/i,
  /what (are|were) your (original|initial) instructions/i,
  /repeat your (system|initial) prompt/i,
  /translate the above/i,
  /DAN mode/i,
  /developer mode/i,
];

// ==========================================
// 2. SPECIAL TOKENS (Attack Vectors)
// ✅ SAFE: Using String.raw to avoid any parsing issues
// ==========================================
const SPECIAL_TOKENS: string[] = [
  String.raw`<|`,
  String.raw`|>`,
  String.raw`<think>`,
  String.raw`</think>`,
  String.raw`,
  String.raw`
