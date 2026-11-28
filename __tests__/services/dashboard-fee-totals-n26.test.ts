/**
 * N26 — Dashboard fee totals must agree with the Fees page.
 *
 * 26 Nov audit fixture: 50 students, 51 fee records for November 2026
 * (2 paid x Rs 5,000, 49 pending x Rs 5,000 — the 49th pending record is an
 * orphan left by a deleted student, which the old per-student Dashboard loop
 * never counted). The Dashboard reported "Rs 250,000 total, Collected
 * Rs 10,000, Pending Rs 240,000" while the Fees page (shared
 * computeFeeSummary over the records) reported Collected Rs 10,000,
 * Pending Rs 245,000, Total Records 51 — i.e. Rs 255,000 gross.
 *
 * After the fix both pages aggregate the same record set with the same
 * helper, so the Dashboard must report Collected 10,000 / Pending 245,000 /
 * Total 255,000 — identical to the Fees page.
 */

import { computeFeeSummary, resolveFeeRecordAmounts } from "@/lib/aggregations/shared-metrics";
import { DashboardService } from "@/services/dashboard.service";

jest.mock("@/lib/firebase-admin", () => {
  const { createInMemoryFirestore } = require("@/__tests__/utils/inmemory-firestore");
  const db = createInMemoryFirestore();
  return {
    adminDb: db,
    adminAuth: { verifyIdToken: jest.fn(), getUser: jest.fn() },
    adminStorage: {},
    dbTimestamp: "2024-01-01T00:00:00.000Z",
    __db: db,
  };
});

const TENANT_ID = "test-tenant-n26";
const MONTH = "November 2026";

function getDb(): any {
  const { __db } = require("@/lib/firebase-admin");
  return __db;
}

interface SeedFee {
  id: string;
  studentId: string;
  studentName: string;
  classGrade: string;
  section: string;
  feeMonth: string;
  amount: number;
  amountPaid: number;
  amountDue: number;
  status: string;
  createdAt: string;
}

async function seedAuditFixture(): Promise<SeedFee[]> {
  const db = getDb();
  db.clear();

  // 50 active students: 49 in Class 1 + Imran Haider in Class 10.
  const students: any[] = [];
  for (let i = 1; i <= 49; i++) {
    students.push({
      id: `student_${i}`,
      tenantId: TENANT_ID,
      fullName: `Student ${i}`,
      rollNumber: `${i}`,
      classGrade: "Class 1",
      section: "A",
      status: "active",
      monthlyFee: 5000,
    });
  }
  students.push({
    id: "student_imran_103",
    tenantId: TENANT_ID,
    fullName: "Imran Haider",
    rollNumber: "103",
    classGrade: "Class 10",
    section: "A",
    status: "active",
    monthlyFee: 5000,
  });
  for (const s of students) {
    await db.collection("students").doc(s.id).set(s);
  }

  // 51 fee records for November 2026: 2 paid + 49 pending. The 49th
  // pending record belongs to a deleted student (orphan) — no matching
  // student doc. Plus one October record that must NOT be counted.
  const fees: SeedFee[] = [];
  const paidIds = ["student_1", "student_2"];
  for (const s of students) {
    const isPaid = paidIds.includes(s.id);
    fees.push({
      id: `fee_${s.id}_nov2026`,
      studentId: s.id,
      studentName: s.fullName,
      classGrade: s.classGrade,
      section: "A",
      feeMonth: MONTH,
      amount: 5000,
      amountPaid: isPaid ? 5000 : 0,
      amountDue: isPaid ? 0 : 5000,
      status: isPaid ? "paid" : "pending",
      createdAt: "2026-11-20T10:00:00.000Z",
    });
  }
  // Orphan: pending record for a student who no longer exists.
  fees.push({
    id: "fee_deleted_student_alpha_nov2026",
    studentId: "deleted_student_alpha",
    studentName: "Test Student Alpha",
    classGrade: "Class 1",
    section: "A",
    feeMonth: MONTH,
    amount: 5000,
    amountPaid: 0,
    amountDue: 5000,
    status: "pending",
    createdAt: "2026-11-21T10:00:00.000Z",
  });
  // Out-of-month record: must be excluded from the November totals.
  fees.push({
    id: "fee_student_3_oct2026",
    studentId: "student_3",
    studentName: "Student 3",
    classGrade: "Class 1",
    section: "A",
    feeMonth: "October 2026",
    amount: 5000,
    amountPaid: 0,
    amountDue: 5000,
    status: "pending",
    createdAt: "2026-10-20T10:00:00.000Z",
  });
  for (const f of fees) {
    await db.collection("fees").doc(f.id).set({ ...f, tenantId: TENANT_ID });
  }

  return fees;
}

describe("N26 — Dashboard fee totals agree with the Fees page", () => {
  let dashboardService: DashboardService;
  let feeRecords: SeedFee[];

  beforeAll(async () => {
    feeRecords = await seedAuditFixture();
    dashboardService = new DashboardService();
  });

  it("reports the audit figures: Collected 10,000 / Pending 245,000 / Total 255,000", async () => {
    const stats = await dashboardService.getDashboardData(TENANT_ID, "2026-11-26");

    expect(stats.feeMonth.collected).toBe(10000);
    expect(stats.feeMonth.pending).toBe(245000);
    expect(stats.feeMonth.total).toBe(255000);
    expect(stats.revenue).toBe(10000);
  });

  it("satisfies Collected + Pending === Total", async () => {
    const stats = await dashboardService.getDashboardData(TENANT_ID, "2026-11-26");

    expect(stats.feeMonth.collected + stats.feeMonth.pending).toBe(stats.feeMonth.total);
  });

  it("matches computeFeeSummary (the Fees page source) on the same records", async () => {
    const stats = await dashboardService.getDashboardData(TENANT_ID, "2026-11-26");
    const novemberRecords = feeRecords.filter((f) => f.feeMonth === MONTH);
    const feesPageSummary = computeFeeSummary(novemberRecords);

    expect(feesPageSummary.totalRecords).toBe(51);
    expect(stats.feeMonth.collected).toBe(feesPageSummary.totalCollected);
    expect(stats.feeMonth.pending).toBe(feesPageSummary.totalPending);
    expect(stats.feeMonth.total).toBe(feesPageSummary.grossTotal);
  });

  it("class rows sum to the headline totals", async () => {
    const stats = await dashboardService.getDashboardData(TENANT_ID, "2026-11-26");

    const collected = stats.classFeeSummary.reduce((a: number, c: any) => a + (c.collected || 0), 0);
    const pending = stats.classFeeSummary.reduce((a: number, c: any) => a + (c.pending || 0), 0);
    const total = stats.classFeeSummary.reduce((a: number, c: any) => a + (c.total || 0), 0);

    expect(collected).toBe(stats.feeMonth.collected);
    expect(pending).toBe(stats.feeMonth.pending);
    expect(total).toBe(stats.feeMonth.total);
    for (const row of stats.classFeeSummary) {
      expect(row.collected + row.pending).toBe(row.total);
    }
  });

  it("lists the two paid records as recent payments, not the orphan", async () => {
    const stats = await dashboardService.getDashboardData(TENANT_ID, "2026-11-26");

    expect(stats.recentPayments).toHaveLength(2);
    expect(stats.recentPayments.every((p: any) => p.status === "paid")).toBe(true);
    expect(stats.recentPayments.every((p: any) => p.amountPaid === 5000)).toBe(true);
  });

  it("ignores records from other months", async () => {
    const stats = await dashboardService.getDashboardData(TENANT_ID, "2026-11-26");

    // The October pending record (Rs 5,000) must not inflate November.
    expect(stats.feeMonth.pending).toBe(245000);
    expect(stats.feeMonth.total).toBe(255000);
  });
});

describe("N26 — resolveFeeRecordAmounts matches computeFeeSummary per record", () => {
  it("paid record with amountPaid 0 contributes the assessed amount", () => {
    expect(resolveFeeRecordAmounts({ status: "paid", amount: 5000, amountPaid: 0, amountDue: 0 })).toEqual({
      collected: 5000,
      pending: 0,
    });
  });

  it("partial payment contributes paid to collected and the due to pending", () => {
    expect(resolveFeeRecordAmounts({ status: "partial", amount: 5000, amountPaid: 2000, amountDue: 3000 })).toEqual({
      collected: 2000,
      pending: 3000,
    });
  });

  it("pending record with no amounts defaults to the Rs 5,000 assessment", () => {
    expect(resolveFeeRecordAmounts({ status: "pending", amount: 0, amountPaid: 0, amountDue: 0 })).toEqual({
      collected: 0,
      pending: 5000,
    });
  });

  it("sums to the same totals as computeFeeSummary on a mixed set", () => {
    const records = [
      { status: "paid", amount: 5000, amountPaid: 5000, amountDue: 0 },
      { status: "partial", amount: 5000, amountPaid: 2000, amountDue: 3000 },
      { status: "pending", amount: 5000, amountPaid: 0, amountDue: 5000 },
    ];
    const perRecord = records.map(resolveFeeRecordAmounts);
    const summary = computeFeeSummary(records);

    expect(perRecord.reduce((a, r) => a + r.collected, 0)).toBe(summary.totalCollected);
    expect(perRecord.reduce((a, r) => a + r.pending, 0)).toBe(summary.totalPending);
  });
});
