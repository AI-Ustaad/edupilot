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

/**
 * Canonical 11 subjects for Pakistan PCTB / SNC school curriculum.
 */
export const CANONICAL_SUBJECTS = [
  "English",
  "Urdu",
  "Mathematics",
  "General Science",
  "Social Studies",
  "Computer Science",
  "Islamiyat",
  "Physics",
  "Chemistry",
  "Biology",
  "Pakistan Studies"
];

/**
 * Standardize subject names (e.g. Science -> General Science, Islamiat -> Islamiyat, Math -> Mathematics).
 */
export function canonicalizeSubject(raw: string | undefined | null): string {
  if (!raw) return "";
  const s = String(raw).trim();
  const lower = s.toLowerCase();

  if (lower === "science" || lower === "general science" || lower === "gen science" || lower === "gen. science") {
    return "General Science";
  }
  if (lower === "islamiat" || lower === "islamiyat" || lower === "islamiayat" || lower === "islamic studies") {
    return "Islamiyat";
  }
  if (lower === "math" || lower === "mathematics" || lower === "maths") {
    return "Mathematics";
  }
  if (lower === "pakistan studies" || lower === "pak studies" || lower === "pak study") {
    return "Pakistan Studies";
  }
  if (lower === "social studies" || lower === "social study" || lower === "s.st") {
    return "Social Studies";
  }
  if (lower === "computer science" || lower === "computer") {
    return "Computer Science";
  }

  const match = CANONICAL_SUBJECTS.find(c => c.toLowerCase() === lower);
  return match || s;
}

/**
 * Deduplicate and canonicalize subject list so ONLY the 11 canonical subjects appear without duplicates.
 */
export function deduplicateSubjects(list?: string[] | null): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  // Seed canonical 11 subjects
  for (const sub of CANONICAL_SUBJECTS) {
    const key = sub.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(sub);
    }
  }

  // If list has any non-canonical custom subject, append if unique
  if (Array.isArray(list)) {
    for (const item of list) {
      if (!item) continue;
      const canonical = canonicalizeSubject(item);
      const key = canonical.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(canonical);
      }
    }
  }

  return result;
}

/**
 * Canonical Exam Term Normalization.
 * Standardizes to: "Final Exams", "1st Term", "2nd Term".
 * Defaults legacy or missing terms to "Final Exams".
 */
export function normalizeTerm(raw?: string | null): string {
  const t = (raw || "").trim().toLowerCase();
  if (!t || t.includes("final")) return "Final Exams";
  if (t.includes("1st") || t.includes("first")) return "1st Term";
  if (t.includes("2nd") || t.includes("second")) return "2nd Term";
  return raw?.trim() || "Final Exams";
}


