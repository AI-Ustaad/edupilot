// services/timetable.service.ts
import { TimetableRepository } from "@/repositories/timetable.repository";
import { StaffRepository } from "@/repositories/staff.repository";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";
import { CreateTimetableEntrySchema } from "@/validators/timetable";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";
import { invalidateCache } from "@/lib/cache";
import type { ITimetableRepository } from "@/interfaces/ITimetableRepository";
import type { IStaffRepository } from "@/interfaces/IStaffRepository";
import type { TimetableEntry } from "@/types/timetable";
import type { ITimetableService } from "@/interfaces/ITimetableService";

// B15 — fallback seed teachers: the real names the old hardcoded list used.
// "STF-002" (a deleted staff member's employee ID, not a teacher name) is
// deliberately NOT here: the old list planted it in ~1 in 10 seeded rows, so
// every reseed re-created the deleted teacher in the grid.
const FALLBACK_TEACHERS = [
  "Ghzandar Ali", "Fahad Siddiqui", "Hamza Nawaz", "Hassan Hussain", "Hamza Khan",
  "Bilal Sheikh", "Ali Ansari", "Usman Haider", "Iqra Qureshi",
];

function normalizeTeacherName(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

/** Break / Recess rows are staffed by "Duty Staff", never a subject teacher. */
function isBreakRow(entry: { subject?: unknown; teacher?: unknown }): boolean {
  const subject = normalizeTeacherName(entry.subject);
  return (
    subject === "break / recess" ||
    subject === "break" ||
    normalizeTeacherName(entry.teacher) === "duty staff"
  );
}

export class TimetableService implements ITimetableService {
  private audit: AuditService;
  private validation: ValidationService;

  constructor(
    private repo: ITimetableRepository = new TimetableRepository(),
    private staffRepo: IStaffRepository = new StaffRepository()
  ) {
    this.audit = new AuditService();
    this.validation = new ValidationService();
  }

  /**
   * B15 — current staff roster names for one tenant. Deleted / archived
   * staff are excluded (findAll does not filter them). Never throws: a
   * roster load failure yields [] and callers fall back to the old
   * self-heal / hardcoded real names instead of wiping the grid.
   * Name shape follows the N23 precedent (top-level fullName first, with
   * personal.fullName / name as fallbacks).
   */
  private async loadRosterNames(tenantId: string): Promise<string[]> {
    try {
      const staff = await this.staffRepo.findAll(tenantId);
      const seen = new Set<string>();
      const names: string[] = [];
      for (const member of staff || []) {
        const m: any = member as any;
        if (m?.deleted || m?.status === "archived") continue;
        const name = String(m?.fullName || m?.personal?.fullName || m?.name || "").trim();
        if (!name) continue;
        const key = normalizeTeacherName(name);
        if (seen.has(key)) continue;
        seen.add(key);
        names.push(name);
      }
      return names;
    } catch {
      return [];
    }
  }

  async reconcileDefaultTimetable(tenantId: string, rosterNames?: string[]): Promise<void> {
    const activeClassSections = [
      { classGrade: "Class 1", section: "A" },
      { classGrade: "Class 1", section: "B" },
      { classGrade: "Class 1", section: "C" },
      { classGrade: "Class 2", section: "A" },
      { classGrade: "Class 9", section: "A" },
      { classGrade: "Class 10", section: "A" },
    ];
    const subjects = [
      "English", "Urdu", "Mathematics", "General Science", "Social Studies",
      "Computer Science", "Islamiyat", "Physics", "Chemistry", "Biology", "Pakistan Studies"
    ];
    // B15: seed ONLY from the current staff roster. The old hardcoded list
    // ended with "STF-002", so every reseed re-planted the deleted teacher
    // in the grid — the N28 delete cascade removes rows at delete time but
    // can never stop the seeder re-creating them. The live roster wins when
    // available; the fallback is known real names only.
    const passed = (rosterNames || []).filter((n) => typeof n === "string" && n.trim().length > 0);
    const loaded = passed.length > 0 ? [] : await this.loadRosterNames(tenantId);
    const teachers = passed.length > 0 ? passed : loaded.length > 0 ? loaded : FALLBACK_TEACHERS;
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    for (let dayIdx = 0; dayIdx < days.length; dayIdx++) {
      const day = days[dayIdx];
      for (let p = 1; p <= 8; p++) {
        const isBreak = p === 4;
        for (let clsIdx = 0; clsIdx < activeClassSections.length; clsIdx++) {
          const clsSec = activeClassSections[clsIdx];
          if (isBreak) {
            await this.repo.create({
              tenantId,
              day,
              period: `${p}`,
              subject: "Break / Recess",
              classGrade: clsSec.classGrade,
              class: clsSec.classGrade,
              section: clsSec.section,
              teacher: "Duty Staff",
              createdAt: new Date(),
            } as any, tenantId);
          } else {
            const academicIdx = p > 4 ? p - 2 : p - 1;
            const subIdx = (academicIdx + dayIdx * 2 + clsIdx * 3) % subjects.length;
            const teachIdx = (dayIdx * 3 + p * 2 + clsIdx) % teachers.length;
            await this.repo.create({
              tenantId,
              day,
              period: `${p}`,
              subject: subjects[subIdx],
              classGrade: clsSec.classGrade,
              class: clsSec.classGrade,
              section: clsSec.section,
              teacher: teachers[teachIdx],
              createdAt: new Date(),
            } as any, tenantId);
          }
        }
      }
    }
  }

  async listEntries(tenantId: string): Promise<(TimetableEntry & { id: string })[]> {
    let list = await this.repo.findAll(tenantId);
    // B15: the grid must show ONLY the current roster. Any stored row naming
    // a deleted / non-roster teacher (e.g. STF-002, deleted 26 Nov before the
    // N28 delete cascade existed, so the cascade can never reach its rows)
    // is healed by wiping + reseeding from the live roster — the same
    // self-heal this function already applied to dummy-teacher rows.
    // Break rows staffed by "Duty Staff" are never orphans.
    const roster = await this.loadRosterNames(tenantId);
    const rosterSet = new Set(roster.map((n) => normalizeTeacherName(n)));
    const hasOrphanTeacher = (rows: (TimetableEntry & { id: string })[]): boolean => {
      if (rosterSet.size > 0) {
        return rows.some(
          (e: any) => !isBreakRow(e) && !rosterSet.has(normalizeTeacherName(e.teacher))
        );
      }
      // Roster unavailable: keep the old self-heal (dummy names / missing
      // Ghzandar). The Ghzandar check is safe here only because the
      // fallback seed still contains him; with a known roster it is dropped
      // — otherwise deleting Ghzandar would reseed on every read, since no
      // roster-driven seed could ever contain him again.
      const DUMMY_TEACHERS = new Set([
        "Muhammad Aslam", "Fatima Noor", "Test Teacher Alpha", "Zahid Iqbal",
        "Nasreen Akhtar", "Rashid Mahmood", "Khadija Bibi", "Tariq Jamil", "Saima Bano"
      ]);
      const hasDummyTeacher = rows.some((e: any) => DUMMY_TEACHERS.has(e.teacher));
      const hasGhzandar = rows.some((e: any) => e.teacher === "Ghzandar Ali");
      return hasDummyTeacher || !hasGhzandar;
    };

    if (!list || list.length === 0 || hasOrphanTeacher(list || [])) {
      if (list && list.length > 0) {
        for (const e of list) {
          this.repo.delete(e.id, tenantId).catch(() => {});
        }
      }
      await this.reconcileDefaultTimetable(tenantId, roster);
      list = await this.repo.findAll(tenantId);
    }
    return list;
  }

  async createEntry(data: unknown, tenantId: string, userId?: string): Promise<string> {
    const validation = this.validation.validate(CreateTimetableEntrySchema, data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors?.map(e => e.message).join(", ")}`);
    }
    const parsed = validation.data;

    // Conflict Detection: Teacher OR Class/Section already booked for day + period
    const existingEntries = await this.repo.findAll(tenantId);
    const normDay = (parsed.day || "").trim().toLowerCase();
    const normPeriod = (parsed.period || "").trim().toLowerCase();
    const normTeacher = (parsed.teacher || "").trim().toLowerCase();
    const normClass = (parsed.classGrade || "").trim().toLowerCase();
    const normSection = (parsed.section || "A").trim().toLowerCase();

    const conflict = existingEntries.find((e: any) => {
      if ((e.day || "").trim().toLowerCase() !== normDay) return false;
      if ((e.period || "").trim().toLowerCase() !== normPeriod) return false;

      const sameTeacher = Boolean(normTeacher && (e.teacher || "").trim().toLowerCase() === normTeacher);
      const sameClassSection = Boolean(
        (e.classGrade || "").trim().toLowerCase() === normClass &&
        (e.section || "A").trim().toLowerCase() === normSection
      );

      return sameTeacher || sameClassSection;
    });

    if (conflict) {
      const isTeacherConflict = Boolean(normTeacher && (conflict.teacher || "").trim().toLowerCase() === normTeacher);
      const message = isTeacherConflict
        ? `Conflict: Teacher ${parsed.teacher} is already assigned during period ${parsed.period} on ${parsed.day}.`
        : `Conflict: Class ${parsed.classGrade} (${parsed.section || "A"}) already has ${conflict.subject || "a class"} scheduled during period ${parsed.period} on ${parsed.day}.`;
      const err: any = new Error(message);
      err.statusCode = 409;
      err.status = 409;
      err.code = "TIMETABLE_CONFLICT";
      throw err;
    }

    const entryData = {
      ...parsed,
      tenantId,
      createdAt: new Date(),
    };

    const id = await this.repo.create(entryData as any, tenantId);

    if (userId) {
      await this.audit.log({
        action: "timetable.created",
        userId,
        tenantId,
        entityId: id,
        entityType: "timetable",
        metadata: { day: parsed.day, period: parsed.period, subject: parsed.subject },
      });
    }

    await invalidateCache(`dashboard:${tenantId}`);

    await eventBus.publish(EVENTS.TIMETABLE_CREATED, {
      tenantId,
      timetableId: id,
      day: parsed.day,
      period: parsed.period,
      subject: parsed.subject,
      createdBy: userId,
    }, tenantId);

    return id;
  }

  async deleteEntry(id: string, tenantId: string, userId?: string): Promise<void> {
    const entry = await this.repo.findById(id, tenantId);
    if (!entry) throw new Error("Timetable entry not found");

    await this.repo.delete(id, tenantId);

    if (userId) {
      await this.audit.log({
        action: "timetable.deleted",
        userId,
        tenantId,
        entityId: id,
        entityType: "timetable",
      });
    }

    await invalidateCache(`dashboard:${tenantId}`);

    await eventBus.publish(EVENTS.TIMETABLE_DELETED, {
      tenantId,
      timetableId: id,
      deletedBy: userId,
    }, tenantId);
  }
}
