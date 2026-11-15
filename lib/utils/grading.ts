/**
 * lib/utils/grading.ts
 *
 * Canonical Unified Grading Scale for EduPilot (BISE / PCTB standard).
 * Used across /exams, /marks, /result ledger, and Report Cards.
 *
 * Scale:
 * - >= 90%        : A+
 * - >= 80% & < 90%: A
 * - >= 70% & < 80%: B
 * - >= 60% & < 70%: C
 * - >= 50% & < 60%: D
 * - < 50%         : F
 */

export function calculateGrade(percentage: number | string | undefined | null): string {
  if (percentage === undefined || percentage === null) return "-";
  const p = Number(percentage);
  if (isNaN(p) || p < 0) return "-";

  if (p >= 90) return "A+";
  if (p >= 80) return "A";
  if (p >= 70) return "B";
  if (p >= 60) return "C";
  if (p >= 50) return "D";
  return "F";
}

export function getGradeBadgeClasses(grade: string): string {
  switch (grade) {
    case "A+":
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    case "A":
      return "bg-green-100 text-green-800 border-green-300";
    case "B":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "C":
      return "bg-amber-100 text-amber-800 border-amber-300";
    case "D":
      return "bg-orange-100 text-orange-800 border-orange-300";
    case "F":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

