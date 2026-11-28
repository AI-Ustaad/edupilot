// __tests__/lib/cascade-delete-n28.test.ts
// N28 — deleting a student/staff member must not leave orphan records.
import { cascadeDeleteStudent, cascadeDeleteStaff } from "@/lib/deletion/cascade";

type SeedDoc = { id: string; data: Record<string, any> };

/** Minimal in-memory Firestore stand-in: tenant-only where() + get(). */
function makeFakeDb(seed: Record<string, SeedDoc[]>, failCollections: Set<string> = new Set()) {
  const store: Record<string, Map<string, Record<string, any>>> = {};
  for (const [name, docs] of Object.entries(seed)) {
    store[name] = new Map(docs.map((d) => [d.id, { ...d.data }]));
  }
  const deleted: string[] = [];
  const updated: Array<{ collection: string; id: string; patch: Record<string, unknown> }> = [];
  const db = {
    collection(name: string) {
      return {
        where(field: string, op: string, value: unknown) {
          return {
            async get() {
              if (failCollections.has(name)) throw new Error(`boom: ${name}`);
              const docs: any[] = [];
              for (const [id, data] of store[name] ?? new Map()) {
                if (field === "tenantId" && op === "==" && data.tenantId !== value) continue;
                docs.push({
                  id,
                  data: () => ({ ...data }),
                  ref: {
                    delete: async () => {
                      store[name]?.delete(id);
                      deleted.push(`${name}/${id}`);
                    },
                    update: async (patch: Record<string, unknown>) => {
                      const cur = store[name]?.get(id);
                      if (cur) Object.assign(cur, patch);
                      updated.push({ collection: name, id, patch });
                    },
                  },
                });
              }
              return { docs };
            },
          };
        },
      };
    },
    __store: store,
    __deleted: deleted,
    __updated: updated,
  };
  return db;
}

describe("N28 cascadeDeleteStudent", () => {
  it("deletes the student's fee, invoice, attendance, marks, behavior and leave records only", async () => {
    const db = makeFakeDb({
      fees: [
        { id: "fee-own", data: { tenantId: "tenant-a", studentId: "s1", status: "Pending" } },
        { id: "fee-other-student", data: { tenantId: "tenant-a", studentId: "s2" } },
        { id: "fee-other-tenant", data: { tenantId: "tenant-b", studentId: "s1" } },
      ],
      invoices: [
        { id: "inv-own", data: { tenantId: "tenant-a", studentId: "s1" } },
        { id: "inv-other", data: { tenantId: "tenant-a", studentId: "s2" } },
      ],
      attendance: [
        { id: "att-own", data: { tenantId: "tenant-a", studentId: "s1" } },
        { id: "att-other", data: { tenantId: "tenant-a", studentId: "s2" } },
      ],
      marks: [
        { id: "mark-own", data: { tenantId: "tenant-a", studentId: "s1", skills: { ProblemSolving: 5 } } },
        { id: "mark-other", data: { tenantId: "tenant-a", studentId: "s2" } },
      ],
      behavior_logs: [
        { id: "beh-own", data: { tenantId: "tenant-a", studentId: "s1" } },
        { id: "beh-other", data: { tenantId: "tenant-a", studentId: "s2" } },
      ],
      leave_requests: [
        { id: "leave-own", data: { tenantId: "tenant-a", studentId: "s1" } },
        { id: "leave-other", data: { tenantId: "tenant-a", teacherId: "stf-1" } },
      ],
    });

    const result = await cascadeDeleteStudent(db as any, "tenant-a", "s1");

    expect(result).toEqual(
      expect.objectContaining({
        fees: 1,
        invoices: 1,
        attendance: 1,
        marks: 1,
        behavior_logs: 1,
        leave_requests: 1,
      })
    );
    // The student's own docs are gone; everyone else's survive.
    for (const [collection, id] of [
      ["fees", "fee-own"],
      ["invoices", "inv-own"],
      ["attendance", "att-own"],
      ["marks", "mark-own"],
      ["behavior_logs", "beh-own"],
      ["leave_requests", "leave-own"],
    ] as const) {
      expect(db.__store[collection]?.has(id)).toBe(false);
    }
    expect(db.__store.fees?.has("fee-other-student")).toBe(true);
    expect(db.__store.fees?.has("fee-other-tenant")).toBe(true);
    expect(db.__store.invoices?.has("inv-other")).toBe(true);
    expect(db.__store.attendance?.has("att-other")).toBe(true);
    expect(db.__store.marks?.has("mark-other")).toBe(true);
    expect(db.__store.behavior_logs?.has("beh-other")).toBe(true);
    expect(db.__store.leave_requests?.has("leave-other")).toBe(true);
  });

  it("unlinks a shared guardian but deletes a guardian with no remaining children", async () => {
    const db = makeFakeDb({
      parents: [
        { id: "p-shared", data: { tenantId: "tenant-a", studentIds: ["s1", "s2"], name: "Shared Guardian" } },
        { id: "p-only", data: { tenantId: "tenant-a", studentIds: ["s1"], name: "Only Guardian" } },
        { id: "p-other", data: { tenantId: "tenant-a", studentIds: ["s2"], name: "Other Guardian" } },
      ],
    });

    const result = await cascadeDeleteStudent(db as any, "tenant-a", "s1");

    expect(result.parents).toBe(1);
    expect(result.parentsUnlinked).toBe(1);
    expect(db.__store.parents?.has("p-only")).toBe(false);
    expect(db.__store.parents?.get("p-shared")).toEqual(
      expect.objectContaining({ studentIds: ["s2"] })
    );
    expect(db.__store.parents?.has("p-other")).toBe(true);
  });

  it("returns zero counts and does not throw when there are no dependents", async () => {
    const db = makeFakeDb({});
    const result = await cascadeDeleteStudent(db as any, "tenant-a", "s1");
    expect(result).toEqual(
      expect.objectContaining({
        fees: 0,
        invoices: 0,
        attendance: 0,
        marks: 0,
        behavior_logs: 0,
        leave_requests: 0,
        parents: 0,
        parentsUnlinked: 0,
      })
    );
  });

  it("keeps cascading the other collections when one collection query fails", async () => {
    const db = makeFakeDb(
      {
        fees: [{ id: "fee-own", data: { tenantId: "tenant-a", studentId: "s1" } }],
        marks: [{ id: "mark-own", data: { tenantId: "tenant-a", studentId: "s1" } }],
      },
      new Set(["fees"])
    );
    const result = await cascadeDeleteStudent(db as any, "tenant-a", "s1");
    expect(result.fees).toBe(0);
    expect(result.marks).toBe(1);
    expect(db.__store.marks?.has("mark-own")).toBe(false);
    // The un-deletable fee record survives (and is visible in the count).
    expect(db.__store.fees?.has("fee-own")).toBe(true);
  });
});

describe("N28 cascadeDeleteStaff", () => {
  it("deletes leave, payroll, timetable and login records; clears section and substitute links", async () => {
    const db = makeFakeDb({
      leave_requests: [
        { id: "l-own", data: { tenantId: "tenant-a", teacherId: "stf-1" } },
        { id: "l-other", data: { tenantId: "tenant-a", teacherId: "stf-2" } },
        { id: "l-sub", data: { tenantId: "tenant-a", teacherId: "stf-2", substituteTeacherId: "stf-1" } },
      ],
      payroll: [
        { id: "pay-own", data: { tenantId: "tenant-a", staffId: "stf-1" } },
        { id: "pay-other", data: { tenantId: "tenant-a", staffId: "stf-2" } },
      ],
      timetable_entries: [
        { id: "t-name", data: { tenantId: "tenant-a", teacher: "Test Teacher" } },
        { id: "t-name-case", data: { tenantId: "tenant-a", teacher: "test teacher" } },
        { id: "t-id", data: { tenantId: "tenant-a", teacher: "Someone Else", teacherId: "stf-1" } },
        { id: "t-other", data: { tenantId: "tenant-a", teacher: "Other Teacher" } },
      ],
      sections: [
        { id: "sec-own", data: { tenantId: "tenant-a", classTeacherId: "stf-1", classTeacherName: "Test Teacher", incharge: "Test Teacher" } },
        { id: "sec-other", data: { tenantId: "tenant-a", classTeacherId: "stf-2", classTeacherName: "Other Teacher", incharge: "Other Teacher" } },
      ],
      users: [
        { id: "u-own", data: { tenantId: "tenant-a", staffId: "stf-1" } },
        { id: "u-other", data: { tenantId: "tenant-a", staffId: "stf-2" } },
      ],
    });

    const result = await cascadeDeleteStaff(db as any, "tenant-a", "stf-1", "Test Teacher");

    expect(result).toEqual(
      expect.objectContaining({
        leave_requests: 1,
        leave_substitute_cleared: 1,
        payroll: 1,
        timetable_entries: 3,
        sections_cleared: 1,
        users: 1,
      })
    );
    expect(db.__store.leave_requests?.has("l-own")).toBe(false);
    expect(db.__store.leave_requests?.has("l-other")).toBe(true);
    // The other teacher's leave survives, only the substitute link is cut.
    expect(db.__store.leave_requests?.get("l-sub")).toEqual(
      expect.objectContaining({ teacherId: "stf-2", substituteTeacherId: null })
    );
    expect(db.__store.payroll?.has("pay-own")).toBe(false);
    expect(db.__store.payroll?.has("pay-other")).toBe(true);
    expect(db.__store.timetable_entries?.has("t-name")).toBe(false);
    expect(db.__store.timetable_entries?.has("t-name-case")).toBe(false);
    expect(db.__store.timetable_entries?.has("t-id")).toBe(false);
    expect(db.__store.timetable_entries?.has("t-other")).toBe(true);
    // The section survives — only the link to the deleted teacher is cut.
    expect(db.__store.sections?.get("sec-own")).toEqual(
      expect.objectContaining({ classTeacherId: null, classTeacherName: "", incharge: "" })
    );
    expect(db.__store.sections?.get("sec-other")).toEqual(
      expect.objectContaining({ classTeacherId: "stf-2" })
    );
    expect(db.__store.users?.has("u-own")).toBe(false);
    expect(db.__store.users?.has("u-other")).toBe(true);
  });

  it("still cascades id-linked records when no full name is given (timetable name match skipped)", async () => {
    const db = makeFakeDb({
      leave_requests: [{ id: "l-own", data: { tenantId: "tenant-a", teacherId: "stf-1" } }],
      timetable_entries: [{ id: "t-name", data: { tenantId: "tenant-a", teacher: "Test Teacher" } }],
    });
    const result = await cascadeDeleteStaff(db as any, "tenant-a", "stf-1");
    expect(result.leave_requests).toBe(1);
    expect(result.timetable_entries).toBe(0);
    expect(db.__store.timetable_entries?.has("t-name")).toBe(true);
  });

  it("returns zero counts and does not throw when there are no dependents", async () => {
    const db = makeFakeDb({});
    const result = await cascadeDeleteStaff(db as any, "tenant-a", "stf-1", "Test Teacher");
    expect(result).toEqual(
      expect.objectContaining({
        leave_requests: 0,
        leave_substitute_cleared: 0,
        payroll: 0,
        timetable_entries: 0,
        sections_cleared: 0,
        users: 0,
      })
    );
  });
});
