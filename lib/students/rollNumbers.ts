// B23 — roll numbers are a single school-wide sequence (the students list
// sorts every student by roll number and the audit treats 1-46 as one
// series). Roll numbers were manual-only and optional, so a deleted
// student (or a blank entry) left a permanent gap (#45) and blank rolls
// rendered as "N/A". These helpers implement gap-filling assignment:
// the smallest positive roll number not already in use.

/**
 * Smallest positive integer roll number not present in `used`.
 * Non-numeric values, zero and negatives are ignored (they are not part
 * of the numeric sequence). Existing students are never renumbered —
 * this only picks the number the NEXT admission receives.
 */
export function findSmallestMissingRollNumber(
  used: Iterable<string | number | undefined | null>
): number {
  const taken = new Set<number>();
  for (const value of used) {
    if (value === undefined || value === null || value === "") continue;
    const n = typeof value === "number" ? value : Number(String(value).trim());
    if (Number.isInteger(n) && n > 0) taken.add(n);
  }
  let candidate = 1;
  while (taken.has(candidate)) candidate += 1;
  return candidate;
}
