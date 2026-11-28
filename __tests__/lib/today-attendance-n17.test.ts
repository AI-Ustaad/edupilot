/**
 * N17 — "TODAY ATTENDANCE 100%" with 15P / 0A / 0L / 35U.
 *
 * The dashboard percentage was computed over marked pupils only
 * ((present + late) / totalMarked), so 15 marked-present out of 50 enrolled
 * students showed 100%. It must be computed over ALL enrolled students:
 * (present + late) / totalStudents — 15 of 50 is 30%, never 100%.
 */
import * as fs from "fs";
import * as path from "path";
import { computeTodayAttendancePercent } from "@/lib/aggregations/shared-metrics";

describe("N17 — computeTodayAttendancePercent", () => {
  it("audit fixture: 15P / 0A / 0L / 35U of 50 enrolled students is 30%, not 100%", () => {
    expect(computeTodayAttendancePercent(15, 0, 50)).toBe(30);
  });

  it("24 Nov fixture: 1 of 50 marked present is 2%, not 100%", () => {
    expect(computeTodayAttendancePercent(1, 0, 50)).toBe(2);
  });

  it("fully marked day with everyone present is 100%", () => {
    expect(computeTodayAttendancePercent(50, 0, 50)).toBe(100);
  });

  it("late counts as attended", () => {
    expect(computeTodayAttendancePercent(10, 5, 50)).toBe(30);
  });

  it("absent pupils do not count as attended", () => {
    // 15 present + 10 absent + 25 unmarked of 50 => 30%
    expect(computeTodayAttendancePercent(15, 0, 50)).toBe(30);
  });

  it("nothing marked yet is 0%, not 100%", () => {
    expect(computeTodayAttendancePercent(0, 0, 50)).toBe(0);
  });

  it("zero enrolled students is 0%, never NaN", () => {
    expect(computeTodayAttendancePercent(0, 0, 0)).toBe(0);
    expect(Number.isNaN(computeTodayAttendancePercent(5, 0, 0))).toBe(false);
  });

  it("rounds to the nearest whole percent", () => {
    // 1 of 3 => 33%
    expect(computeTodayAttendancePercent(1, 0, 3)).toBe(33);
  });
});

describe("N17 — wiring: both today-percentage sites use the shared helper", () => {
  const read = (rel: string) =>
    fs.readFileSync(path.join(process.cwd(), rel), "utf-8");

  it("dashboard service computes the today percentage over all enrolled students", () => {
    const src = read("services/dashboard.service.ts");
    expect(src).toContain("computeTodayAttendancePercent");
    // The old marked-only denominator must be gone from the today percentage.
    expect(src).not.toContain("/ totalMarked");
  });

  it("dashboard page computes the today percentage over all enrolled students", () => {
    const src = read("app/(protected)/dashboard/page.tsx");
    expect(src).toContain("computeTodayAttendancePercent");
    expect(src).not.toContain("/ totalMarked");
    // The marked count is shown alongside the percentage.
    expect(src).toContain("marked");
  });
});
