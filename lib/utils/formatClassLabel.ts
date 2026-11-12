/**
 * lib/utils/formatClassLabel.ts
 *
 * Single source of truth for class label formatting.
 * Eliminates duplicate prefixes such as "Class Class 7", "Class Class 2", "Class9" (missing space), etc.
 */
export function formatClassLabel(raw: string | number | undefined | null): string {
  if (raw === undefined || raw === null) return "";
  const str = String(raw).trim();
  if (!str) return "";

  // If already starts with "Class ", check for duplicate prefixes like "Class Class 9"
  // Strip all leading "class" occurrences (case-insensitive, optional whitespace)
  const cleaned = str.replace(/^(class\s*)+/gi, "").trim();

  // If the string was just "Class", return "Class"
  if (!cleaned) return "Class";

  // Check if it's already a compound label like "9 - Section A"
  return `Class ${cleaned}`;
}

export function cleanSectionName(raw: string | undefined | null): string {
  if (!raw) return "A";
  const str = String(raw).trim().replace(/^(section\s*)+/gi, "").trim().toUpperCase();
  return str || "A";
}
