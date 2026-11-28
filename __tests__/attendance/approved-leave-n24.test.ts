/**
 * N24 — staff attendance must respect approved leave.
 * Regression tests for the audit finding: Iqra Qureshi, whose leave for
 * 26 Nov was approved, was marked Present by "Mark All Present".
 */
import {
  applyMarkAllPresent,
  getStaffOnApprovedLeave,
  isDateWithinLeave,
  normalizeDay,
} from "@/lib/attendance/approved-leave";

describe("normalizeDay", () => {
  it("passes a plain YYYY-MM-DD date through", () => {
    expect(normalizeDay("2026-11-26")).toBe("2026-11-26");
  });

  it("takes the day part of an ISO datetime", () => {
    expect(normalizeDay("2026-11-26T00:00:00.000Z")).toBe("2026-11-26");
  });

  it("returns null for missing or malformed values", () => {
    expect(normalizeDay(undefined)).toBeNull();
    expect(normalizeDay("")).toBeNull();
    expect(normalizeDay("26-11-2026")).toBeNull();
    expect(normalizeDay("not a date")).toBeNull();
  });
});

describe("isDateWithinLeave", () => {
  it("is inclusive on both ends of a range", () => {
    expect(isDateWithinLeave("2026-11-25", "2026-11-25", "2026-11-27")).toBe(true);
    expect(isDateWithinLeave("2026-11-27", "2026-11-25", "2026-11-27")).toBe(true);
    expect(isDateWithinLeave("2026-11-26", "2026-11-25", "2026-11-27")).toBe(true);
  });

  it("is false outside the range", () => {
    expect(isDateWithinLeave("2026-11-24", "2026-11-25", "2026-11-27")).toBe(false);
    expect(isDateWithinLeave("2026-11-28", "2026-11-25", "2026-11-27")).toBe(false);
  });

  it("treats a missing endDate as a single-day leave", () => {
    expect(isDateWithinLeave("2026-11-26", "2026-11-26")).toBe(true);
    expect(isDateWithinLeave("2026-11-27", "2026-11-26")).toBe(false);
  });

  it("is false when the leave has no usable start date", () => {
    expect(isDateWithinLeave("2026-11-26", undefined, "2026-11-27")).toBe(false);
    expect(isDateWithinLeave("2026-11-26", "garbage", "2026-11-27")).toBe(false);
  });
});

describe("getStaffOnApprovedLeave", () => {
  const approved = {
    teacherId: "STF-001",
    status: "approved",
    startDate: "2026-11-26",
    endDate: "2026-11-26",
  };

  it("includes staff with an approved leave covering the date (audit fixture)", () => {
    const ids = getStaffOnApprovedLeave([approved], "2026-11-26");
    expect(ids.has("STF-001")).toBe(true);
  });

  it("excludes pending and rejected leaves", () => {
    const leaves = [
      { ...approved, teacherId: "STF-002", status: "pending" },
      { ...approved, teacherId: "STF-003", status: "rejected" },
    ];
    const ids = getStaffOnApprovedLeave(leaves, "2026-11-26");
    expect(ids.size).toBe(0);
  });

  it("excludes approved leaves that do not cover the date", () => {
    const ids = getStaffOnApprovedLeave([approved], "2026-11-27");
    expect(ids.size).toBe(0);
  });

  it("matches status case-insensitively and falls back to staffId", () => {
    const ids = getStaffOnApprovedLeave(
      [{ staffId: "STF-009", status: "Approved", startDate: "2026-11-26", endDate: "2026-11-28" }],
      "2026-11-27"
    );
    expect(ids.has("STF-009")).toBe(true);
  });

  it("skips leaves with no staff id and tolerates null input", () => {
    expect(getStaffOnApprovedLeave([{ ...approved, teacherId: undefined }], "2026-11-26").size).toBe(0);
    expect(getStaffOnApprovedLeave(null, "2026-11-26").size).toBe(0);
    expect(getStaffOnApprovedLeave(undefined, "2026-11-26").size).toBe(0);
  });
});

describe("applyMarkAllPresent", () => {
  const staff = [
    { staffId: "STF-001", fullName: "Iqra Qureshi" },
    { staffId: "STF-004", fullName: "Hamza Nawaz" },
  ];

  it("marks approved-leave staff On Leave, never Present (audit accept criteria)", () => {
    const { entries, onLeaveCount } = applyMarkAllPresent(staff, {}, new Set(["STF-001"]));
    expect(entries["STF-001"].status).toBe("leave");
    expect(entries["STF-004"].status).toBe("present");
    expect(onLeaveCount).toBe(1);
  });

  it("marks everyone Present when nobody is on leave", () => {
    const { entries, onLeaveCount } = applyMarkAllPresent(staff, {}, new Set());
    expect(entries["STF-001"].status).toBe("present");
    expect(entries["STF-004"].status).toBe("present");
    expect(onLeaveCount).toBe(0);
  });

  it("keeps existing remarks when overriding a status", () => {
    const { entries } = applyMarkAllPresent(
      staff,
      { "STF-001": { status: "present", remarks: "came in early" } },
      new Set(["STF-001"])
    );
    expect(entries["STF-001"]).toEqual({ status: "leave", remarks: "came in early" });
  });

  it("skips staff with no id and leaves unrelated entries alone", () => {
    const { entries } = applyMarkAllPresent(
      [...staff, { fullName: "No Id" }],
      { "STF-999": { status: "absent", remarks: "" } },
      new Set(["STF-001"])
    );
    expect(entries["STF-999"].status).toBe("absent");
    expect(Object.keys(entries)).not.toContain("undefined");
  });
});
