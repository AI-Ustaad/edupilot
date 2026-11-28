/**
 * Approved-leave helpers for staff attendance (N24).
 *
 * The staff-attendance page used to mark EVERY active staff member Present
 * on "Mark All Present" because it never looked at leave data at all — so a
 * staff member with an approved leave (e.g. Iqra Qureshi, 26 Nov) was marked
 * Present. These pure helpers connect approved leaves to attendance:
 * staff on an approved leave covering the selected date are marked On Leave,
 * never Present.
 */

export type AttendanceStatus = "present" | "absent" | "late" | "leave" | "not_marked";

export interface LeaveLike {
  teacherId?: string;
  staffId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: unknown;
}

export interface StaffLike {
  staffId?: string;
  id?: string;
  [key: string]: unknown;
}

export interface AttendanceEntry {
  status: AttendanceStatus;
  remarks: string;
}

/**
 * Normalise a stored date to its "YYYY-MM-DD" day part, or null when the
 * value is missing/malformed. Leave dates are stored as "YYYY-MM-DD"
 * strings, but ISO datetimes ("2026-11-26T00:00:00.000Z") are tolerated.
 */
export function normalizeDay(value?: string | null): string | null {
  if (value === undefined || value === null) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const day = raw.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
}

/** Inclusive range check: is `date` inside [startDate, endDate]? A missing endDate means a single-day leave. */
export function isDateWithinLeave(date: string, startDate?: string | null, endDate?: string | null): boolean {
  const day = normalizeDay(date);
  const start = normalizeDay(startDate);
  if (!day || !start) return false;
  const end = normalizeDay(endDate) || start;
  // ISO date strings sort lexicographically, so string comparison is exact.
  return day >= start && day <= end;
}

/**
 * Staff ids with an APPROVED leave covering `date`. Pending/rejected leaves
 * never count, and a leave with no usable dates never counts.
 */
export function getStaffOnApprovedLeave(leaves: LeaveLike[] | null | undefined, date: string): Set<string> {
  const ids = new Set<string>();
  for (const leave of leaves ?? []) {
    if (String(leave.status || "").toLowerCase() !== "approved") continue;
    const id = leave.teacherId || leave.staffId;
    if (!id) continue;
    if (isDateWithinLeave(date, leave.startDate, leave.endDate)) {
      ids.add(String(id));
    }
  }
  return ids;
}

/**
 * "Mark All Present" with approved leave respected: staff on approved leave
 * are marked On Leave, everyone else Present. Existing remarks are kept.
 * Returns the new entries map plus how many staff were marked On Leave.
 */
export function applyMarkAllPresent(
  activeStaff: StaffLike[],
  entries: Record<string, AttendanceEntry>,
  onLeaveStaffIds: Set<string>
): { entries: Record<string, AttendanceEntry>; onLeaveCount: number } {
  const updated: Record<string, AttendanceEntry> = { ...entries };
  let onLeaveCount = 0;
  for (const staff of activeStaff) {
    const sid = staff.staffId || staff.id;
    if (!sid) continue;
    if (onLeaveStaffIds.has(String(sid))) {
      updated[sid] = { status: "leave", remarks: updated[sid]?.remarks || "" };
      onLeaveCount++;
    } else {
      updated[sid] = { status: "present", remarks: updated[sid]?.remarks || "" };
    }
  }
  return { entries: updated, onLeaveCount };
}
