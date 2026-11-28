// __tests__/services/timetable-b15.test.ts
// B15 — weekly timetable must show ONLY the current staff roster; a deleted
// teacher (STF-002, deleted 26 Nov) must never appear in the grid.
//
// Root causes pinned here:
//  1. reconcileDefaultTimetable hard-coded "STF-002" in its teacher list, so
//     every reseed re-planted the deleted teacher in ~1 in 10 rows.
//  2. listEntries never checked stored rows against the roster, so the
//     pre-existing STF-002 rows (created before the N28 delete cascade
//     existed, which only runs at delete time) stayed in the grid forever.
// The N28 cascade (PR #40) removes a teacher's rows when they are deleted
// going forward; it cannot fix either of these. These tests fail on the
// unfixed service (verified via git stash of services/timetable.service.ts).
import { TimetableService } from "@/services/timetable.service";

const ROSTER_10 = [
  "Ghzandar Ali",
  "Fahad Siddiqui",
  "Hamza Nawaz",
  "Hassan Hussain",
  "Hamza Khan",
  "Bilal Sheikh",
  "Ali Ansari",
  "Usman Haider",
  "Iqra Qureshi",
  "Muneeb Ahmed",
];

function makeTimetableRepo(initial: any[] = []) {
  let rows: any[] = initial.map((e, i) => ({ id: e.id || `tt_${i}`, ...e }));
  let counter = rows.length;
  return {
    findAll: jest.fn(async () => rows.map((r) => ({ ...r }))),
    create: jest.fn(async (data: any) => {
      const id = `tt_${counter++}`;
      rows.push({ id, ...data });
      return id;
    }),
    delete: jest.fn(async (id: string) => {
      rows = rows.filter((r) => r.id !== id);
    }),
  };
}

function makeStaffRepo(
  members: any[],
  opts?: { throwOnFindAll?: boolean }
) {
  return {
    findAll: jest.fn(async () => {
      if (opts?.throwOnFindAll) throw new Error("firestore down");
      return members;
    }),
  };
}

const rosterMembers = (names: string[]) =>
  names.map((fullName, i) => ({ id: `stf_${i}`, fullName, tenantId: "t1" }));

const norm = (v: unknown) => String(v || "").trim().toLowerCase();

describe("B15 — weekly timetable built only from the current roster", () => {
  it("seed plants only roster names — never STF-002", async () => {
    const repo = makeTimetableRepo([]);
    const service = new TimetableService(
      repo as any,
      makeStaffRepo(rosterMembers(ROSTER_10)) as any
    );

    const entries = await service.listEntries("t1");

    expect(entries.length).toBeGreaterThan(0);
    const academic = entries.filter((e: any) => e.subject !== "Break / Recess");
    expect(academic.length).toBeGreaterThan(0);
    for (const e of academic) {
      expect(ROSTER_10.map(norm)).toContain(norm(e.teacher));
    }
    expect(entries.some((e: any) => e.teacher === "STF-002")).toBe(false);
    const breaks = entries.filter((e: any) => e.subject === "Break / Recess");
    expect(breaks.length).toBeGreaterThan(0);
    expect(breaks.every((e: any) => e.teacher === "Duty Staff")).toBe(true);
  });

  it("heals the audit's orphan rows: STF-002 disappears from the grid", async () => {
    const repo = makeTimetableRepo([
      { day: "Monday", period: "1", subject: "English", classGrade: "Class 1", section: "A", teacher: "Ghzandar Ali" },
      { day: "Monday", period: "2", subject: "Urdu", classGrade: "Class 1", section: "A", teacher: "STF-002" },
      { day: "Monday", period: "3", subject: "Mathematics", classGrade: "Class 1", section: "A", teacher: "STF-002" },
      { day: "Monday", period: "4", subject: "Break / Recess", classGrade: "Class 1", section: "A", teacher: "Duty Staff" },
      { day: "Tuesday", period: "1", subject: "English", classGrade: "Class 1", section: "A", teacher: "STF-002" },
    ]);
    const service = new TimetableService(
      repo as any,
      makeStaffRepo(rosterMembers(ROSTER_10)) as any
    );

    const entries = await service.listEntries("t1");

    expect(repo.delete).toHaveBeenCalled();
    expect(entries.some((e: any) => e.teacher === "STF-002")).toBe(false);
    const academic = entries.filter((e: any) => e.subject !== "Break / Recess");
    for (const e of academic) {
      expect(ROSTER_10.map(norm)).toContain(norm(e.teacher));
    }
  });

  it("does not wipe a clean, roster-only grid", async () => {
    const clean = [
      { day: "Monday", period: "1", subject: "English", classGrade: "Class 1", section: "A", teacher: "Ghzandar Ali" },
      { day: "Monday", period: "2", subject: "Urdu", classGrade: "Class 1", section: "A", teacher: "Iqra Qureshi" },
      { day: "Monday", period: "4", subject: "Break / Recess", classGrade: "Class 1", section: "A", teacher: "Duty Staff" },
    ];
    const repo = makeTimetableRepo(clean);
    const service = new TimetableService(
      repo as any,
      makeStaffRepo(rosterMembers(ROSTER_10)) as any
    );

    const entries = await service.listEntries("t1");

    expect(entries).toHaveLength(clean.length);
    expect(repo.delete).not.toHaveBeenCalled();
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("roster unavailable: fallback seed uses real names only, never STF-002", async () => {
    const repo = makeTimetableRepo([]);
    const service = new TimetableService(
      repo as any,
      makeStaffRepo([], { throwOnFindAll: true }) as any
    );

    const entries = await service.listEntries("t1");

    expect(entries.length).toBeGreaterThan(0);
    expect(entries.some((e: any) => e.teacher === "STF-002")).toBe(false);
    const academic = entries.filter((e: any) => e.subject !== "Break / Recess");
    for (const e of academic) {
      expect([
        "ghzandar ali", "fahad siddiqui", "hamza nawaz", "hassan hussain",
        "hamza khan", "bilal sheikh", "ali ansari", "usman haider", "iqra qureshi",
      ]).toContain(norm(e.teacher));
    }
  });

  it("seeded grid has zero teacher conflicts across class-sections", async () => {
    const repo = makeTimetableRepo([]);
    const service = new TimetableService(
      repo as any,
      makeStaffRepo(rosterMembers(ROSTER_10)) as any
    );

    const entries = await service.listEntries("t1");
    const academic = entries.filter((e: any) => e.subject !== "Break / Recess");
    const bySlot = new Map<string, string[]>();
    for (const e of academic) {
      const key = `${e.day}|${e.period}`;
      bySlot.set(key, [...(bySlot.get(key) || []), e.teacher]);
    }
    for (const [slot, teachers] of bySlot) {
      expect(new Set(teachers.map(norm)).size).toBe(teachers.length);
    }
  });

  it("deleted / archived staff are never seeded", async () => {
    const repo = makeTimetableRepo([]);
    const members = [
      ...rosterMembers(ROSTER_10),
      { id: "stf_gone", fullName: "Test Teacher Alpha", tenantId: "t1", deleted: true },
      { id: "stf_old", fullName: "Old Teacher", tenantId: "t1", status: "archived" },
    ];
    const service = new TimetableService(repo as any, makeStaffRepo(members) as any);

    const entries = await service.listEntries("t1");

    expect(entries.some((e: any) => e.teacher === "Test Teacher Alpha")).toBe(false);
    expect(entries.some((e: any) => e.teacher === "Old Teacher")).toBe(false);
  });

  it("dummy-teacher rows still heal when the roster is unavailable", async () => {
    const repo = makeTimetableRepo([
      { day: "Monday", period: "1", subject: "English", classGrade: "Class 1", section: "A", teacher: "Test Teacher Alpha" },
      { day: "Monday", period: "2", subject: "Urdu", classGrade: "Class 1", section: "A", teacher: "Ghzandar Ali" },
    ]);
    const service = new TimetableService(
      repo as any,
      makeStaffRepo([], { throwOnFindAll: true }) as any
    );

    const entries = await service.listEntries("t1");

    expect(repo.delete).toHaveBeenCalled();
    expect(entries.some((e: any) => e.teacher === "Test Teacher Alpha")).toBe(false);
    expect(entries.some((e: any) => e.teacher === "STF-002")).toBe(false);
  });
});
