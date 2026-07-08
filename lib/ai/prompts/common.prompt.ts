// lib/ai/prompts/common.prompt.ts
export const JSON_INSTRUCTION = `
Return ONLY valid JSON. No markdown. No explanation. No code block. No comments. No notes.
Use empty string "" for any field where the value is not found or not applicable.`;

export const SYSTEM_BASE_INSTRUCTION =
  "You are a strict document data extraction system. Extract fields accurately. Never make up data.";
