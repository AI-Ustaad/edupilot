/**
 * lib/utils/formatClassLabel.ts
 *
 * Single source of truth for class label formatting.
 * Eliminates duplicate prefixes such as "Class Class 7", "Class Grade 10", "Grade 10", "Class9", etc.
 */
export function formatClassLabel(raw: string | number | undefined | null): string {
  if (raw === undefined || raw === null) return "";
  const str = String(raw).trim();
  if (!str) return "";

  // Strip compound section suffix if accidentally included (e.g. "Class 10 - Section A" or "CLASS 10 - SECTION A")
  let classPart = str;
  if (classPart.includes(" - ") || classPart.toUpperCase().includes("SECTION")) {
    const split = classPart.split(/-\s*section/i)[0].split(/\s+section\s+/i)[0].trim();
    if (split) classPart = split;
  }

  // Strip all leading "class", "grade", or compound prefixes (case-insensitive, optional whitespace)
  // e.g. "Class Grade 10", "Grade 10", "Class Class 9", "classgrade 8"
  const cleaned = classPart
    .replace(/^((class|grade)\s*)+/gi, "")
    .trim();

  // If the string was just "Class" or "Grade", return "Class"
  if (!cleaned) return "Class";

  return `Class ${cleaned}`;
}

export function cleanSectionName(raw: string | undefined | null): string {
  if (!raw) return "A";
  const str = String(raw).trim().replace(/^(section\s*)+/gi, "").trim().toUpperCase();
  // If compound string e.g. "Class 10 - Section A", take the last letter
  const match = str.match(/[A-Z]$/);
  if (match) return match[0];
  return str || "A";
}

/**
 * Deduplicate and sort class items in natural numeric order (Class 1, Class 2, ... Class 10).
 */
export function extractUniqueClasses(items: any[] | undefined | null): string[] {
  if (!items || !Array.isArray(items)) return [];
  const set = new Set<string>();
  for (const item of items) {
    const raw = typeof item === "string"
      ? item
      : (item?.classGrade || item?.className || item?.name || item?.class || "");
    const formatted = formatClassLabel(raw);
    if (formatted) {
      set.add(formatted);
    }
  }

  return Array.from(set).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ""), 10);
    const numB = parseInt(b.replace(/\D/g, ""), 10);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
  });
}
