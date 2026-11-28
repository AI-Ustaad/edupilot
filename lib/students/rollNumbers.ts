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

// B29 — one shared ledger order: sort STRICTLY by roll number; records
// without a roll number go LAST (never interleaved by name).
// The old FeesService comparator fell back to a NAME comparison whenever
// either record lacked a roll number, which is intransitive: a roll-less
// record's position was decided by its name against rolled records, so
// "Test Student Alpha" (no roll) sat between rolls #14 and #15 and
// "TEST — Add Student" landed after #15. This comparator is a total
// order, so its output never depends on the input (Firestore) order.
export type RollSortable = {
  rollNumber?: string | number | null;
  classGrade?: string | null;
  section?: string | null;
  studentName?: string | null;
  fullName?: string | null;
};

/** Numeric roll number, or null when the record has none (blank, zero, non-numeric). */
export function parseRollNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/\D/g, ""));
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function compareLedgerRecords(a: RollSortable, b: RollSortable): number {
  const rollA = parseRollNumber(a.rollNumber);
  const rollB = parseRollNumber(b.rollNumber);
  if (rollA !== null && rollB !== null && rollA !== rollB) return rollA - rollB;
  if (rollA !== null) return -1; // a has a roll, b does not: a first
  if (rollB !== null) return 1; // b has a roll, a does not: b first
  // Both roll-less (or the same roll): class, then section, then name —
  // deterministic, and never decided by name against a rolled record.
  const classA = parseInt(String(a.classGrade || "").replace(/\D/g, ""), 10);
  const classB = parseInt(String(b.classGrade || "").replace(/\D/g, ""), 10);
  const numA = Number.isNaN(classA) ? 0 : classA;
  const numB = Number.isNaN(classB) ? 0 : classB;
  if (numA !== numB) return numA - numB;
  const secA = (a.section || "").trim().toUpperCase();
  const secB = (b.section || "").trim().toUpperCase();
  if (secA !== secB) return secA.localeCompare(secB);
  const nameA = (a.studentName || a.fullName || "").toLowerCase();
  const nameB = (b.studentName || b.fullName || "").toLowerCase();
  return nameA.localeCompare(nameB);
}
