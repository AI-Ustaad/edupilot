/**
 * lib/aggregations/shared-metrics.ts
 *
 * Single Source of Truth for shared financial and attendance metrics.
 * Ensures /dashboard, /fees, /attendance, and /result agree 100%.
 */

import { normalizeTerm, canonicalizeSubject } from "@/lib/utils/formatClassLabel";

/**
 * N25 — collapse duplicate mark rows to one row per subject per exam.
 *
 * Student 360 "Recent Marks" renders MarksRepository.findByStudent() verbatim,
 * and the collection can hold the same logical mark under more than one doc id:
 * saveSkills() creates a fresh random-id doc whenever no existing mark matches,
 * and normalizeTerm() passes unrecognised term spellings through verbatim, so
 * the same exam saved under two spellings lands in two deterministic doc ids.
 * The Marks/Exams pages never show this because they filter strictly by one
 * normalized term; the 360 aggregate has no term filter, so every duplicate
 * surfaces there (Ahmed Shah: English 88 and Mathematics 92 each twice).
 *
 * Key: normalized term + canonical subject. When several rows share a key the
 * most recently updated one wins (updatedAt, then createdAt); ties keep the
 * first-seen row. Rows without a subject cannot be proven to duplicate another
 * row, so each is kept. First-seen order is preserved.
 */
function markTimestamp(value: unknown): number {
  if (value == null) return Number.NEGATIVE_INFINITY;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
  }
  if (typeof value === "object") {
    const obj = value as any;
    if (typeof obj.toDate === "function") {
      try {
        return obj.toDate().getTime();
      } catch {
        return Number.NEGATIVE_INFINITY;
      }
    }
    if (typeof obj._seconds === "number") return obj._seconds * 1000;
  }
  return Number.NEGATIVE_INFINITY;
}

export function dedupeMarksBySubjectAndTerm<T extends Record<string, any>>(marks: T[]): T[] {
  if (!Array.isArray(marks)) return [];
  const winners = new Map<string, { record: T; recency: number; firstIndex: number }>();
  marks.forEach((mark, index) => {
    if (!mark) return;
    const subject = canonicalizeSubject(mark.subject).toLowerCase();
    const key = subject
      ? `${normalizeTerm(mark.term || mark.examType)}|||${subject}`
      : `__unidentified__${index}`;
    const recency = Math.max(markTimestamp(mark.updatedAt), markTimestamp(mark.createdAt));
    const existing = winners.get(key);
    if (!existing) {
      winners.set(key, { record: mark, recency, firstIndex: index });
    } else if (recency > existing.recency) {
      winners.set(key, { record: mark, recency, firstIndex: existing.firstIndex });
    }
  });
  return [...winners.values()]
    .sort((a, b) => a.firstIndex - b.firstIndex)
    .map((entry) => entry.record);
}

export interface FeeSummary {
  totalRecords: number;
  totalCollected: number;
  totalPending: number;
  grossTotal: number;
}

/**
 * Computes exact financial conservation invariants for a set of fee records.
 * Collected + Pending === Gross
 */
export function computeFeeSummary(records: any[]): FeeSummary {
  if (!Array.isArray(records) || records.length === 0) {
    return {
      totalRecords: 0,
      totalCollected: 0,
      totalPending: 0,
      grossTotal: 0,
    };
  }

  let totalCollected = 0;
  let totalPending = 0;

  for (const r of records) {
    const status = (r.status || r.financial?.status || "").toString().toLowerCase().trim();
    const isPaid = status === "paid";
    
    // Resolve collected amount (verified cash)
    const rawPaid = Number(r.amountPaid ?? r.financial?.amountPaid ?? 0);
    const rawAssessed = Number(r.amount ?? r.financial?.amount ?? r.paymentDetails?.amount ?? 0);
    const assessed = rawAssessed > 0 ? rawAssessed : 5000;

    const collected = isPaid ? (rawPaid > 0 ? rawPaid : assessed) : Math.max(0, rawPaid);

    // Resolve pending amount
    const rawDue = Number(r.amountDue ?? r.financial?.amountDue ?? 0);
    const due = isPaid ? 0 : (rawDue > 0 ? rawDue : Math.max(0, assessed - collected));

    totalCollected += collected;
    totalPending += (isPaid ? 0 : (due > 0 ? due : assessed));
  }

  return {
    totalRecords: records.length,
    totalCollected,
    totalPending,
    grossTotal: totalCollected + totalPending,
  };
}

export interface MarkedDayTrendPoint {
  date: string;
  day: string;
  label: string;
  percentage: number;
  percent: number;
  present: number;
  absent: number;
  late: number;
  totalMarked: number;
  marked: boolean;
  isMarked: boolean;
}

export interface CalendarDaySlot {
  date: string;
  day: string;
  label: string;
  percentage: number | null;
  percent: number | null;
  present: number;
  absent: number;
  late: number;
  totalMarked: number;
  marked: boolean;
  isMarked: boolean;
}

export interface AttendanceTrendResult {
  markedTrendSeries: MarkedDayTrendPoint[];
  calendarSlots: CalendarDaySlot[];
  attendanceStats: {
    avg: number;
    highest: number;
    lowest: number;
    markedDaysCount: number;
  };
}

/**
 * Computes weekly attendance trend following Option A (Honest Semantics):
 * - Unmarked days (totalMarked === 0) are "no data", NEVER 0% attendance.
 * - markedTrendSeries contains ONLY days where attendance was actually marked (totalMarked > 0).
 * - average, highest, lowest, and markedDaysCount are computed DIRECTLY from markedTrendSeries.
 */
export function computeAttendanceTrend(
  allAttendanceRecords: any[],
  endDateStr?: string
): AttendanceTrendResult {
  const endDate = endDateStr ? new Date(endDateStr) : new Date();
  const calendarSlots: CalendarDaySlot[] = [];
  const markedTrendSeries: MarkedDayTrendPoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabel = dateStr.slice(5); // "MM-DD"

    const dayRecords = (allAttendanceRecords || []).filter((a: any) => a.date === dateStr);
    const totalMarked = dayRecords.length;
    const isMarked = totalMarked > 0;

    let present = 0;
    let late = 0;
    let absent = 0;

    if (isMarked) {
      for (const rec of dayRecords) {
        const s = String(rec.status || "").toLowerCase().trim();
        if (s === "present") present++;
        else if (s === "late") late++;
        else if (s === "absent") absent++;
        else present++;
      }
    }

    const pct = isMarked
      ? Math.round(((present + late) / totalMarked) * 100)
      : null;

    const slot: CalendarDaySlot = {
      date: dateStr,
      day: dayLabel,
      label: dayLabel,
      percentage: pct,
      percent: pct,
      present,
      absent,
      late,
      totalMarked,
      marked: isMarked,
      isMarked,
    };

    calendarSlots.push(slot);

    if (isMarked && pct !== null) {
      markedTrendSeries.push({
        date: dateStr,
        day: dayLabel,
        label: dayLabel,
        percentage: pct,
        percent: pct,
        present,
        absent,
        late,
        totalMarked,
        marked: true,
        isMarked: true,
      });
    }
  }

  let avg = 0;
  let highest = 0;
  let lowest = 0;

  if (markedTrendSeries.length > 0) {
    const percentages = markedTrendSeries.map((m) => m.percentage);
    const sum = percentages.reduce((acc, p) => acc + p, 0);
    avg = Math.round(sum / percentages.length);
    highest = Math.max(...percentages);
    lowest = Math.min(...percentages);
  }

  return {
    markedTrendSeries,
    calendarSlots,
    attendanceStats: {
      avg,
      highest,
      lowest,
      markedDaysCount: markedTrendSeries.length,
    },
  };
}

