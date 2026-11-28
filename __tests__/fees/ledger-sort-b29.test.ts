// B29 — Fee ledger sort: sort strictly by roll number; records without a
// roll number go last (never interleaved by name).
//
// The 26 Nov audit found the orphan "Test Student Alpha" record (no roll
// number) sitting between rolls #14 and #15 in the fee ledger, with
// "TEST — Add Student" inserted after #15. Root cause: FeesService.listFees
// sorted with an intransitive comparator — whenever either record lacked a
// roll number it fell back to a NAME comparison against the other record,
// so a roll-less record's position was decided by its name among rolled
// records and the output depended on Firestore's unordered input order
// (reproduced in Node: the same fixture sorted the two roll-less records
// between rolls #5 and #6 from one input order, with 90 transitivity
// violations). The fix is one shared total order (compareLedgerRecords in
// lib/students/rollNumbers.ts), used by the API, the ledger table and the
// CSV export.
import { FeesService } from "@/services/fees.service";
import {
  compareLedgerRecords,
  parseRollNumber,
  type RollSortable,
} from "@/lib/students/rollNumbers";

// The audit fixture: Class 1-A rolls 1..15 plus the two roll-less records.
const ROLLED_NAMES = [
  "Ahmed Shah",
  "Bilal Ahmed",
  "Fatima Zahra",
  "Hassan Ali",
  "Ayesha Khan",
  "Usman Ghani",
  "Zainab Bibi",
  "Muhammad Ali",
  "Sana Tariq",
  "Omar Farooq",
  "Maryam Nawaz",
  "Ali Raza",
  "Hira Malik",
  "Waqas Ahmed",
  "Nadia Hussain",
];

function auditFixture(): { rolled: RollSortable[]; rollLess: RollSortable[] } {
  const rolled = ROLLED_NAMES.map((name, i) => ({
    studentName: name,
    rollNumber: i + 1,
    classGrade: "Class 1",
    section: "A",
  }));
  const rollLess = [
    {
      studentName: "Test Student Alpha",
      rollNumber: undefined,
      classGrade: "Class 1",
      section: "A",
    },
    {
      studentName: "TEST — Add Student",
      rollNumber: undefined,
      classGrade: "Class 1",
      section: "A",
    },
  ];
  return { rolled, rollLess };
}

// Deterministic scramble (no Math.random — the test must be stable).
function scramble<T>(arr: T[]): T[] {
  const out = [...arr];
  let seed = 42;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

describe("B29 ledger sort — compareLedgerRecords", () => {
  it("sorts the audit fixture strictly by roll, roll-less records last", () => {
    const { rolled, rollLess } = auditFixture();
    const sorted = scramble([...rolled, ...rollLess]).sort(compareLedgerRecords);
    expect(sorted.map((r: any) => r.rollNumber ?? null)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, null, null,
    ]);
    // The two roll-less records are the last two rows — never between #14/#15.
    expect(sorted.slice(-2).map((r: any) => r.studentName)).toEqual([
      "TEST — Add Student",
      "Test Student Alpha",
    ]);
  });

  it("keeps a roll-less record last even when its name sorts first alphabetically", () => {
    const records = [
      { studentName: "Zubair", rollNumber: 103, classGrade: "Class 10", section: "A" },
      { studentName: "Aaron Zed", rollNumber: undefined, classGrade: "Class 1", section: "A" },
      { studentName: "Ahmed Shah", rollNumber: 1, classGrade: "Class 1", section: "A" },
    ];
    const sorted = [...records].sort(compareLedgerRecords);
    expect(sorted.map((r: any) => r.studentName)).toEqual([
      "Ahmed Shah",
      "Zubair",
      "Aaron Zed",
    ]);
  });

  it("orders rolls numerically, not lexicographically (9 before 10, string rolls included)", () => {
    const records = [
      { studentName: "Ten", rollNumber: "10", classGrade: "Class 1", section: "A" },
      { studentName: "Hundred", rollNumber: "100", classGrade: "Class 1", section: "A" },
      { studentName: "Nine", rollNumber: 9, classGrade: "Class 1", section: "A" },
      { studentName: "Two", rollNumber: "Roll 2", classGrade: "Class 1", section: "A" },
    ];
    expect([...records].sort(compareLedgerRecords).map((r: any) => r.studentName)).toEqual([
      "Two",
      "Nine",
      "Ten",
      "Hundred",
    ]);
  });

  it("is a total order: the same fixture sorts identically from every input order", () => {
    const { rolled, rollLess } = auditFixture();
    const base = [...rolled, ...rollLess].sort(compareLedgerRecords).map((r: any) => r.studentName);
    const orders = [
      [...rolled, ...rollLess],
      [...rollLess, ...rolled],
      scramble([...rolled, ...rollLess]),
      [...rolled].reverse().concat(rollLess),
    ];
    for (const input of orders) {
      expect(input.sort(compareLedgerRecords).map((r: any) => r.studentName)).toEqual(base);
    }
  });

  it("parseRollNumber accepts numbers, numeric strings and 'Roll N', rejects blanks", () => {
    expect(parseRollNumber(14)).toBe(14);
    expect(parseRollNumber("14")).toBe(14);
    expect(parseRollNumber("Roll 14")).toBe(14);
    expect(parseRollNumber(undefined)).toBeNull();
    expect(parseRollNumber(null)).toBeNull();
    expect(parseRollNumber("")).toBeNull();
    expect(parseRollNumber(0)).toBeNull();
    expect(parseRollNumber("N/A")).toBeNull();
  });
});

describe("B29 ledger sort — FeesService.listFees", () => {
  it("returns the November ledger strictly by roll with roll-less records last", async () => {
    const { rolled, rollLess } = auditFixture();
    const students: any[] = [
      ...rolled.map((r: any, i: number) => ({
        id: `stu_c1_${r.rollNumber}`,
        fullName: r.studentName,
        rollNumber: r.rollNumber,
        classGrade: "Class 1",
        section: "A",
        status: "active",
        monthlyFee: 5000,
      })),
      { id: "stu_test_alpha", fullName: "Test Student Alpha", rollNumber: undefined, classGrade: "Class 1", section: "A", status: "active", monthlyFee: 5000 },
      { id: "stu_test_add", fullName: "TEST — Add Student", rollNumber: undefined, classGrade: "Class 1", section: "A", status: "active", monthlyFee: 5000 },
    ];

    // Fee docs seeded in scrambled (Firestore) order, one per student.
    const feeDocs: any[] = scramble([
      ...rolled.map((r: any) => ({
        id: `fee_stu_c1_${r.rollNumber}_nov2026`,
        studentId: `stu_c1_${r.rollNumber}`,
        studentName: r.studentName,
        rollNumber: r.rollNumber,
        classGrade: "Class 1",
        section: "A",
        feeMonth: "November 2026",
        amount: 5000,
        amountPaid: 0,
        amountDue: 5000,
        status: "Pending",
      })),
      {
        id: "fee_stu_test_alpha_nov2026",
        studentId: "stu_test_alpha",
        studentName: "Test Student Alpha",
        rollNumber: undefined,
        classGrade: "Class 1",
        section: "A",
        feeMonth: "November 2026",
        amount: 5000,
        amountPaid: 0,
        amountDue: 5000,
        status: "Pending",
      },
      {
        id: "fee_stu_test_add_nov2026",
        studentId: "stu_test_add",
        studentName: "TEST — Add Student",
        rollNumber: undefined,
        classGrade: "Class 1",
        section: "A",
        feeMonth: "November 2026",
        amount: 5000,
        amountPaid: 0,
        amountDue: 5000,
        status: "Pending",
      },
    ]);
    const docsStore = new Map<string, any>(feeDocs.map((f: any) => [f.id, f]));

    const mockDb: any = {
      collection: (colName: string) => {
        const rows = colName === "students" ? students : Array.from(docsStore.values());
        return {
          where: () => ({
            get: async () => ({
              docs: rows.map((row: any) => ({
                id: row.id,
                ref: {
                  delete: async () => { docsStore.delete(row.id); },
                  update: async (data: any) => { docsStore.set(row.id, { ...docsStore.get(row.id), ...data }); },
                },
                data: () => docsStore.get(row.id) ?? row,
              })),
            }),
          }),
          doc: (docId: string) => ({
            set: async (docData: any, opts?: any) => {
              const existing = docsStore.get(docId) || {};
              docsStore.set(docId, opts?.merge ? { ...existing, ...docData } : docData);
            },
            get: async () => ({ exists: docsStore.has(docId), data: () => docsStore.get(docId) }),
          }),
        };
      },
    };
    const mockRepo: any = {
      db: mockDb,
      findAll: async () => Array.from(docsStore.values()),
      findByStudent: async (_: string, studentId: string) =>
        Array.from(docsStore.values()).filter((f: any) => f.studentId === studentId),
      findById: async (id: string) => docsStore.get(id) || null,
      save: async (doc: any) => { docsStore.set(doc.id, doc); return doc; },
      update: async (id: string, data: any) => { docsStore.set(id, { ...docsStore.get(id), ...data }); },
    };
    const mockLedger: any = { createEntry: jest.fn().mockResolvedValue("ledger-123") };

    const service = new FeesService(mockRepo, mockLedger);
    const result = await service.listFees("tenant_1", { month: "November 2026" }, 1, 100);

    expect(result.total).toBe(17);
    expect(result.data.map((f: any) => f.rollNumber ?? null)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, null, null,
    ]);
    expect(result.data.slice(-2).map((f: any) => f.studentName)).toEqual([
      "TEST — Add Student",
      "Test Student Alpha",
    ]);
  });
});
