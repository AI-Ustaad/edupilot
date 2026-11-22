/**
 * lib/utils/markdown.ts
 *
 * Universal markdown stripping and AI response cleanup utility.
 * Safe to use in both Node.js server routes and React client components.
 */

export function stripMarkdown(text: unknown): string {
  if (text === null || text === undefined) return "";
  const str = typeof text === "string" ? text : String(text);
  if (!str.trim()) return "";

  return str
    .replace(/^\s*#+\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .trim();
}

export function cleanAiText(text: unknown): string {
  return stripMarkdown(text);
}
