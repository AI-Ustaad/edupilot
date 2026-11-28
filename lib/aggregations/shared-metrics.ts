/**
 * lib/aggregations/shared-metrics.ts
 *
 * Single Source of Truth for shared financial and attendance metrics.
 * Ensures /dashboard, /fees, /attendance, and /result agree 100%.
 */

export interface FeeSummary {
  totalRecords: number;
  totalCollected: number;
  totalPending: number;
  grossTotal: number;
}

/**
 * Resolves the collected / pending amounts of ONE fee record, using the same
 * rules as computeFeeSummary. Every consumer (Fees page, Dashboard,
 * Analytics) must use this helper so the same record always contributes the
 * same amounts everywhere (N26: the Dashboard used to re-derive these
 * per-student and disagreed with the Fees page).
 */
export function resolveFeeRecordAmounts(record: any): { collected: number; pending: number } {
  const status = (record.status || record.financial?.status || "").toString().toLowerCase().trim();
  const isPaid = status === "paid";

  // Resolve collected amount (verified cash)
  const rawPaid = Number(record.amountPaid ?? record.financial?.amountPaid ?? 0);
  const rawAssessed = Number(record.amount ?? record.financial?.amount ?? record.paymentDetails?.amount ?? 0);
  const assessed = rawAssessed > 0 ? rawAssessed : 5000;

  const collected = isPaid ? (rawPaid > 0 ? rawPaid : assessed) : Math.max(0, rawPaid);

  // Resolve pending amount
  const rawDue = Number(record.amountDue ?? record.financial?.amountDue ?? 0);
  const due = isPaid ? 0 : (rawDue > 0 ? rawDue : Math.max(0, assessed - collected));

  return {
    collected,
    pending: isPaid ? 0 : (due > 0 ? due : assessed),
  };
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
    const { collected, pending } = resolveFeeRecordAmounts(r);
    totalCollected += collected;
    totalPending += pending;
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

