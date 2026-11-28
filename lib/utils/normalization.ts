export function normalizeNaturalKey(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export function sectionNaturalKey(tenantId: string, classGrade: string, sectionName: string): string {
  return `${normalizeNaturalKey(tenantId)}::${normalizeNaturalKey(classGrade)}::${normalizeNaturalKey(sectionName)}`;
}

export function sectionDocId(tenantId: string, classGrade: string, sectionName: string): string {
  return `${normalizeNaturalKey(tenantId)}__${normalizeNaturalKey(classGrade)}__${normalizeNaturalKey(sectionName)}`;
}

export function departmentNaturalKey(tenantId: string, name: string): string {
  return `${normalizeNaturalKey(tenantId)}::${normalizeNaturalKey(name)}`;
}

/**
 * Title-case a person's name for storage and display (B22).
 * "ghzandar Ali" -> "Ghzandar Ali". Trims and collapses internal whitespace.
 * Only all-lowercase or all-uppercase words are re-cased; intentionally
 * mixed-case words are left untouched ("Ph.D" stays "Ph.D", "McDonald"
 * stays "McDonald"). Capitalisation applies after hyphens/apostrophes too
 * ("abdul-rehman" -> "Abdul-Rehman", "o'brien" -> "O'Brien").
 * Nullish/blank input -> "".
 */
export function normalizePersonName(value: string | null | undefined): string {
  const cleaned = (value ?? "").trim().replace(/\s+/g, " ");
  if (!cleaned) return "";
  return cleaned
    .split(" ")
    .map((word) => {
      const letters = word.replace(/[^\p{L}]/gu, "");
      if (!letters) return word;
      const isAllUpper = letters === letters.toUpperCase() && letters !== letters.toLowerCase();
      const isAllLower = letters === letters.toLowerCase() && letters !== letters.toUpperCase();
      if (!isAllUpper && !isAllLower) return word;
      return word
        .toLowerCase()
        .replace(/(^|[-'])(\p{L})/gu, (_match: string, prefix: string, ch: string) => prefix + ch.toUpperCase());
    })
    .join(" ");
}
