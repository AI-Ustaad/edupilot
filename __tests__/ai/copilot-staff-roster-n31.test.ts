// N31 — Principal Copilot briefing must ground staff claims on the LIVE roster.
// The 26 Nov audit found the briefing still saying "10 specialized staff members
// assigned sequential employee IDs STF-001 through STF-010" after STF-002
// (Test Teacher Alpha) was deleted. The roster is no longer sequential, so the
// briefing must list the actual IDs and never assert a sequence it cannot see.

jest.mock("@/lib/firebase-admin", () => {
  const { createMockAdminDb } = require("../utils/firestore-mock");
  // Audit fixture: 10 staff, STF-002 deleted, TEST-001 added in its place.
  const staffFixture = [
    { employeeId: "STF-001", fullName: "Ghzandar Ali", designation: "SST" },
    { employeeId: "STF-003", fullName: "Saima Bano", designation: "SST" },
    { employeeId: "STF-004", fullName: "Teacher Four", designation: "SST" },
    { employeeId: "STF-005", fullName: "Teacher Five", designation: "SST" },
    { employeeId: "STF-006", fullName: "Teacher Six", designation: "SST" },
    { employeeId: "STF-007", fullName: "Teacher Seven", designation: "SST" },
    { employeeId: "STF-008", fullName: "Teacher Eight", designation: "SST" },
    { employeeId: "STF-009", fullName: "Teacher Nine", designation: "SST" },
    { employeeId: "STF-010", fullName: "Teacher Ten", designation: "SST" },
    { employeeId: "TEST-001", fullName: "Test Staff Audit", designation: "SST" },
  ].map((s, i) => ({
    id: `staff-doc-${i + 1}`,
    data: () => ({ tenantId: "tenant_ghs_sahiwal", personnelNo: s.employeeId, ...s }),
    ref: { id: `staff-doc-${i + 1}` },
  }));
  return {
    adminDb: createMockAdminDb({ staff: staffFixture as any, students: [], tenants: [] }),
    adminAuth: {
      createUser: jest.fn(),
      setCustomUserClaims: jest.fn(),
      verifySessionCookie: jest.fn(),
      verifyIdToken: jest.fn(),
    },
    adminStorage: {},
    dbTimestamp: new Date().toISOString(),
  };
});

import {
  summarizeStaffRoster,
  describeStaffIds,
  staffIdOf,
  getTenantContextSnapshot,
} from "@/lib/ai/tenant-snapshot";
import { PrincipalAgent } from "@/lib/ai/strategies/PrincipalAgent";
import { TeacherAgent } from "@/lib/ai/strategies/TeacherAgent";

const auditRoster = [
  { employeeId: "STF-001", fullName: "Ghzandar Ali", designation: "SST" },
  { employeeId: "STF-003", fullName: "Saima Bano", designation: "SST" },
  { employeeId: "STF-004", fullName: "Teacher Four", designation: "SST" },
  { employeeId: "STF-005", fullName: "Teacher Five", designation: "SST" },
  { employeeId: "STF-006", fullName: "Teacher Six", designation: "SST" },
  { employeeId: "STF-007", fullName: "Teacher Seven", designation: "SST" },
  { employeeId: "STF-008", fullName: "Teacher Eight", designation: "SST" },
  { employeeId: "STF-009", fullName: "Teacher Nine", designation: "SST" },
  { employeeId: "STF-010", fullName: "Teacher Ten", designation: "SST" },
  { employeeId: "TEST-001", fullName: "Test Staff Audit", designation: "SST" },
];

const sequentialRoster = Array.from({ length: 10 }, (_, i) => ({
  employeeId: `STF-${String(i + 1).padStart(3, "0")}`,
  fullName: `Teacher ${i + 1}`,
  designation: "SST",
}));

describe("N31 — Copilot staff roster is grounded on live data", () => {
  it("audit fixture: 10 staff but NO sequential-IDs claim, no STF-002, TEST-001 listed", () => {
    const summary = summarizeStaffRoster(auditRoster);
    expect(summary.count).toBe(10);
    expect(summary.summary).not.toContain("STF-001 through STF-010");
    expect(summary.summary).not.toContain("STF-002");
    expect(summary.summary).not.toContain("Muhammad Tariq");
    expect(summary.summary).toContain("TEST-001");
    expect(summary.summary).toContain("Ghzandar Ali (STF-001");
    expect(summary.summary).toContain("Saima Bano (STF-003");
    expect(summary.ids).toEqual([
      "STF-001", "STF-003", "STF-004", "STF-005", "STF-006",
      "STF-007", "STF-008", "STF-009", "STF-010", "TEST-001",
    ]);
  });

  it("sequential roster: keeps the 'STF-001 through STF-010' phrasing when it is true", () => {
    const summary = summarizeStaffRoster(sequentialRoster);
    expect(summary.count).toBe(10);
    expect(summary.idPhrase).toBe("(Sequential IDs STF-001 through STF-010)");
  });

  it("empty roster: asserts no count and no IDs", () => {
    const summary = summarizeStaffRoster([]);
    expect(summary.count).toBe(0);
    expect(summary.summary).toContain("none on file");
    expect(summary.summary).not.toContain("STF-");
  });

  it("describeStaffIds: gapped run lists IDs, non-STF IDs are listed verbatim", () => {
    expect(describeStaffIds(["STF-001", "STF-003", "STF-004"])).toBe(
      "(Employee IDs: STF-001, STF-003, STF-004)"
    );
    expect(describeStaffIds(["STF-001", "STF-002", "STF-003"])).toBe(
      "(Sequential IDs STF-001 through STF-003)"
    );
    expect(describeStaffIds(["TEST-001", "STF-001"])).toBe(
      "(Employee IDs: TEST-001, STF-001)"
    );
  });

  it("staffIdOf: employeeId wins, personnelNo is the fallback, missing is explicit", () => {
    expect(staffIdOf({ employeeId: "STF-001", personnelNo: "P-9" })).toBe("STF-001");
    expect(staffIdOf({ personnelNo: "STF-004" })).toBe("STF-004");
    expect(staffIdOf({ fullName: "No Id" })).toBe("no ID on file");
  });

  it("live snapshot: gapped roster, no sequential claim, no deleted STF-002", async () => {
    const snapshot = await getTenantContextSnapshot("tenant_ghs_sahiwal");
    expect(snapshot).not.toContain("STF-001 through STF-010");
    expect(snapshot).not.toContain("STF-002");
    expect(snapshot).not.toContain("Muhammad Tariq");
    expect(snapshot).toContain("Active Staff Members: 10 (Employee IDs:");
    expect(snapshot).toContain("TEST-001");
    expect(snapshot).toContain("Ghzandar Ali (STF-001");
  });

  it("PrincipalAgent prompt: no hardcoded staff claim, defers to the live snapshot", () => {
    const prompt = new PrincipalAgent().buildSystemPrompt({
      tenantId: "tenant_ghs_sahiwal",
      userRole: "admin",
      query: "briefing",
      tenantSnapshot: "SNAPSHOT",
    } as any);
    // The guideline names the phrase only to forbid it — the old assertive
    // line ("Total staff: 10 active members (STF-001 through STF-010)") is gone.
    expect(prompt).not.toContain("Total staff: 10 active members");
    expect(prompt).not.toContain("Total staff: 10");
    expect(prompt).toContain("never claim sequential IDs");
    expect(prompt).toContain("live snapshot");
  });

  it("TeacherAgent prompt: no hardcoded staff claim, defers to the live snapshot", () => {
    const prompt = new TeacherAgent().buildSystemPrompt({
      tenantId: "tenant_ghs_sahiwal",
      userRole: "teacher",
      query: "how many staff?",
      tenantSnapshot: "SNAPSHOT",
    } as any);
    // The guideline names the phrase only to forbid it — the old assertive
    // line ("Total staff is 10 (assigned sequential IDs ...)") is gone.
    expect(prompt).not.toContain("Total staff is 10 (assigned sequential IDs");
    expect(prompt).not.toContain("Total staff is 10");
    expect(prompt).toContain("never claim sequential IDs");
    expect(prompt).toContain("live snapshot");
  });
});
