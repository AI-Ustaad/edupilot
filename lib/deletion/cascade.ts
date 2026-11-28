// lib/deletion/cascade.ts
// N28 — cascade-delete orphans.
//
// Root cause: StudentService.delete / StaffService.delete removed only the
// person's own document. Every dependent record kept referencing them:
// a deleted student's fee record, guardian link, leave, attendance and
// academic records stayed live; a deleted staff member stayed on as teacher
// in timetable rows, in leave requests and in payroll. The STAFF_DELETED
// subscriber's "cleanup cascade" only invalidated the dashboard cache.
//
// These helpers delete (or unlink/clear) every dependent record of a deleted
// person, and are called from the service delete paths so every caller
// (UI delete dialog, admin delete route) gets the cascade.
//
// Design notes:
// - Tenant-only queries + filtering in JS. Composite (tenantId + link-field)
//   queries need Firestore composite indexes that do not exist for most of
//   these pairs (the same trap as B27's quota guard, which failed open) —
//   a tenant-only single-field query needs no index and always runs.
// - Each collection step is individually guarded: a failing step logs a
//   warning and returns 0, never aborting the remaining steps and never
//   failing the person delete itself. The returned counts say what was
//   actually removed, so a silent no-op is impossible to miss.
// - Skills live inside marks documents (marksService.recordSkill upserts a
//   `skills` field on the marks record), so deleting marks removes skills.
// - Timetable entries store the teacher as a free-text name
//   (TimetableEntry.teacher), so the staff cascade matches the stored name
//   case-insensitively (and teacherId when present).
import { logger } from "@/lib/logger/logger";

export interface CascadeDeleteResult {
  [collection: string]: number;
}

interface CascadeDocRef {
  delete(): Promise<unknown>;
  update(data: Record<string, unknown>): Promise<unknown>;
}

interface CascadeDocSnapshot {
  id: string;
  data(): Record<string, any>;
  ref: CascadeDocRef;
}

interface CascadeQuery {
  get(): Promise<{ docs: CascadeDocSnapshot[] }>;
}

interface CascadeCollection {
  where(field: string, op: string, value: unknown): CascadeQuery;
}

/** Minimal Firestore surface the cascade needs (adminDb satisfies it). */
export interface CascadeDb {
  collection(name: string): CascadeCollection;
}

function normalizeName(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

/** All docs of one collection for one tenant (single-field query: no composite index needed). */
async function listTenantDocs(
  db: CascadeDb,
  collection: string,
  tenantId: string
): Promise<CascadeDocSnapshot[]> {
  try {
    const snap = await db.collection(collection).where("tenantId", "==", tenantId).get();
    return snap?.docs ?? [];
  } catch (err) {
    logger.warn("[CascadeDelete] Could not list tenant docs", {
      metadata: { collection, tenantId, err },
    });
    return [];
  }
}

/** Delete every tenant doc in `collection` whose data matches `predicate`. Returns how many were deleted. */
async function deleteMatchingDocs(
  db: CascadeDb,
  collection: string,
  tenantId: string,
  predicate: (data: Record<string, any>) => boolean
): Promise<number> {
  const docs = await listTenantDocs(db, collection, tenantId);
  let removed = 0;
  for (const doc of docs) {
    let data: Record<string, any>;
    try {
      data = doc.data() || {};
    } catch {
      continue;
    }
    if (!predicate(data)) continue;
    try {
      await doc.ref.delete();
      removed += 1;
    } catch (err) {
      logger.warn("[CascadeDelete] Could not delete dependent doc", {
        metadata: { collection, docId: doc.id, tenantId, err },
      });
    }
  }
  return removed;
}

/** Update every tenant doc in `collection` whose data matches `predicate`. Returns how many were updated. */
async function updateMatchingDocs(
  db: CascadeDb,
  collection: string,
  tenantId: string,
  predicate: (data: Record<string, any>) => boolean,
  patch: (data: Record<string, any>) => Record<string, unknown>
): Promise<number> {
  const docs = await listTenantDocs(db, collection, tenantId);
  let updated = 0;
  for (const doc of docs) {
    let data: Record<string, any>;
    try {
      data = doc.data() || {};
    } catch {
      continue;
    }
    if (!predicate(data)) continue;
    try {
      await doc.ref.update(patch(data));
      updated += 1;
    } catch (err) {
      logger.warn("[CascadeDelete] Could not update dependent doc", {
        metadata: { collection, docId: doc.id, tenantId, err },
      });
    }
  }
  return updated;
}

/**
 * Cascade for a deleted student. Removes the student's fee, invoice,
 * attendance, marks (skills live inside marks docs), behavior and leave
 * records, and unlinks the student from guardian records — deleting a
 * guardian record only when the student was its last linked child.
 */
export async function cascadeDeleteStudent(
  db: CascadeDb,
  tenantId: string,
  studentId: string
): Promise<CascadeDeleteResult> {
  const removed: CascadeDeleteResult = {};

  // Hard-delete dependent records keyed by studentId.
  const linked: Array<[string, string]> = [
    ["fees", "studentId"],
    ["invoices", "studentId"],
    ["attendance", "studentId"],
    ["marks", "studentId"],
    ["behavior_logs", "studentId"],
    // Defensive: leave requests are staff-typed today, but the doc shape
    // allows extra fields and the audit lists student leave requests among
    // the orphans — remove any that reference the student.
    ["leave_requests", "studentId"],
  ];
  for (const [collection, field] of linked) {
    removed[collection] = await deleteMatchingDocs(db, collection, tenantId, (d) => d[field] === studentId);
  }

  // Guardian link: parent docs carry studentIds: string[]. Unlink the
  // student; delete the parent record only when no child remains, so a
  // guardian shared by siblings survives for the other children.
  const parents = await listTenantDocs(db, "parents", tenantId);
  let unlinked = 0;
  let parentsRemoved = 0;
  for (const doc of parents) {
    let data: Record<string, any>;
    try {
      data = doc.data() || {};
    } catch {
      continue;
    }
    const studentIds = Array.isArray(data.studentIds) ? data.studentIds : [];
    if (!studentIds.includes(studentId)) continue;
    const remaining = studentIds.filter((id: unknown) => id !== studentId);
    try {
      if (remaining.length === 0) {
        await doc.ref.delete();
        parentsRemoved += 1;
      } else {
        await doc.ref.update({ studentIds: remaining, updatedAt: new Date().toISOString() });
        unlinked += 1;
      }
    } catch (err) {
      logger.warn("[CascadeDelete] Could not unlink guardian", {
        metadata: { docId: doc.id, tenantId, err },
      });
    }
  }
  removed.parents = parentsRemoved;
  removed.parentsUnlinked = unlinked;

  return removed;
}

/**
 * Cascade for a deleted staff member. Removes the staff member's leave
 * requests, payroll records and timetable assignments, clears the
 * class-teacher link on sections they taught, clears them as a substitute
 * on other teachers' leaves, and removes their linked login account.
 * The section itself is kept — only the link to the deleted person is cut.
 */
export async function cascadeDeleteStaff(
  db: CascadeDb,
  tenantId: string,
  staffId: string,
  staffFullName?: string
): Promise<CascadeDeleteResult> {
  const removed: CascadeDeleteResult = {};

  removed.leave_requests = await deleteMatchingDocs(
    db,
    "leave_requests",
    tenantId,
    (d) => d.teacherId === staffId
  );

  // A leave owned by another teacher must survive — only the substitute
  // reference to the deleted person is cleared.
  removed.leave_substitute_cleared = await updateMatchingDocs(
    db,
    "leave_requests",
    tenantId,
    (d) => d.substituteTeacherId === staffId,
    () => ({ substituteTeacherId: null, updatedAt: new Date().toISOString() })
  );

  removed.payroll = await deleteMatchingDocs(db, "payroll", tenantId, (d) => d.staffId === staffId);

  // Timetable entries store the teacher as a free-text name; match it
  // case-insensitively (and teacherId when a doc carries one).
  const name = normalizeName(staffFullName);
  removed.timetable_entries = name
    ? await deleteMatchingDocs(
        db,
        "timetable_entries",
        tenantId,
        (d) => d.teacherId === staffId || normalizeName(d.teacher) === name
      )
    : 0;

  removed.sections_cleared = await updateMatchingDocs(
    db,
    "sections",
    tenantId,
    (d) => d.classTeacherId === staffId,
    () => ({
      classTeacherId: null,
      classTeacherName: "",
      incharge: "",
      updatedAt: new Date().toISOString(),
    })
  );

  // Linked login account: a deleted staff member must not keep a sign-in.
  removed.users = await deleteMatchingDocs(db, "users", tenantId, (d) => d.staffId === staffId);

  return removed;
}
