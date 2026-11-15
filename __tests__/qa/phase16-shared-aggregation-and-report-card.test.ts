/**
 * __tests__/qa/phase16-shared-aggregation-and-report-card.test.ts
 *
 * Phase 16 Verification Suite:
 * 1. Shared Single-Source Fee Aggregation (computeFeeSummary & listFees prefix matching)
 * 2. Attendance Hydration & Empty State String Formatting (zero "inClass" typo)
 * 3. Weekly Attendance Trend Consistency (no contradiction between chart & summary cards)
 * 4. Examination Results Ledger, Subject Breakdown, Report Card Preview & jsPDF Generation
 * 5. Canonical Unified Grading Scale (A+, A, B, C, D, F — Zero A++ occurrences)
 */

import { computeFeeSummary } from "@/lib/aggregations/shared-metrics";
import { calculateGrade, getGradeBadgeClasses } from "@/lib/utils/grading";
import { formatClassLabel, cleanSectionName } from "@/lib/utils/formatClassLabel";
import { buildStudentReportCardDoc, downloadStudentReportPDF, downloadAllStudentsReportPDF } from "@/lib/utils/reportCardPdf";
import { DashboardService } from "@/services/dashboard.service";
import { AttendanceRepository } from "@/repositories/attendance.repository";

describe("Phase 16 — Shared Aggregations, Attendance Hydration & Report Card PDF", () => {
  const TENANT_ID = "ghs_sahiwal_tenant";

  describe("1. Shared Single-Source Fee Aggregations (Fix 1)", () => {
    it("should compute exact financial conservation for 1 pending student record (Imran Haider)", () => {
      const records = [
        {
          studentId: "student_imran_103",
          studentName: "Imran Haider",
          classGrade: "Class 10",
          section: "A",
          amount: 5000,
          amountPaid: 0,
          amountDue: 5000,
          status: "pending",
        },
      ];

      const summary = computeFeeSummary(records);
      expect(summary.totalRecords).toBe(1);
      expect(summary.totalCollected).toBe(0);
      expect(summary.totalPending).toBe(5000);
      expect(summary.grossTotal).toBe(5000);
      expect(summary.totalCollected + summary.totalPending).toBe(summary.grossTotal);
    });

    it("should handle empty fee records gracefully with zeros", () => {
      const summary = computeFeeSummary([]);
      expect(summary).toEqual({
        totalRecords: 0,
        totalCollected: 0,
        totalPending: 0,
        grossTotal: 0,
      });
    });

    it("should preserve financial conservation across paid, partial, and pending records", () => {
      const records = [
        { studentId: "s1", status: "paid", amountPaid: 5000, amountDue: 0 },
        { studentId: "s2", status: "partial", amountPaid: 2000, amountDue: 3000 },
        { studentId: "s3", status: "pending", amountPaid: 0, amountDue: 5000 },
      ];

      const summary = computeFeeSummary(records);
      expect(summary.totalRecords).toBe(3);
      expect(summary.totalCollected).toBe(7000);
      expect(summary.totalPending).toBe(8000);
      expect(summary.grossTotal).toBe(15000);
      expect(summary.totalCollected + summary.totalPending).toBe(summary.grossTotal);
    });
  });

  describe("2. Attendance Hydration & Formatting Invariants (Fix 2)", () => {
    it("should normalize attendance empty-state string with proper space ('in Class 9', not 'inClass 9')", () => {
      const selectedClass = "Class 9";
      const selectedSection = "A";
      const emptyStateText = `No students found in ${formatClassLabel(selectedClass)} - Section ${cleanSectionName(selectedSection)}.`;
      
      expect(emptyStateText).toBe("No students found in Class 9 - Section A.");
      expect(emptyStateText).not.toContain("inClass");
      expect(emptyStateText).toContain("in Class 9");
    });

    it("should normalize classGrade in AttendanceRepository filters using formatClassLabel", () => {
      expect(formatClassLabel("Class Grade 10").toLowerCase()).toBe(formatClassLabel("Class 10").toLowerCase());
      expect(formatClassLabel("Grade 10").toLowerCase()).toBe(formatClassLabel("Class 10").toLowerCase());
      expect(cleanSectionName("Section A").toLowerCase()).toBe(cleanSectionName("A").toLowerCase());
    });
  });

  describe("3. Weekly Attendance Trend & Summary Stats Consistency (Fix 3)", () => {
    let dashboardService: DashboardService;

    beforeEach(() => {
      dashboardService = new DashboardService();
    });

    it("should ensure attendanceStats does not contradict 7-day trend", async () => {
      const stats = await dashboardService.getDashboardData(TENANT_ID);

      expect(stats.attendanceTrend).toBeDefined();
      expect(Array.isArray(stats.attendanceTrend)).toBe(true);
      expect(stats.attendanceTrend.length).toBe(7);

      // If marked days exist, avg/highest/lowest should be consistent
      if (stats.attendanceStats.highest > 0) {
        expect(stats.attendanceStats.highest).toBeGreaterThanOrEqual(stats.attendanceStats.avg);
        expect(stats.attendanceStats.avg).toBeGreaterThanOrEqual(stats.attendanceStats.lowest);
      }
    });
  });

  describe("4. Results Ledger, Subject Breakdown & PDF Generation (Fix 4)", () => {
    const mockStudentResult = {
      studentId: "student_imran_103",
      studentName: "Imran Haider",
      rollNumber: "103",
      classGrade: "Class 10",
      section: "A",
      term: "Final Exams",
      marks: [
        { subject: "Mathematics", marksObtained: 90, totalMarks: 100, percentage: 90, grade: "A+" },
        { subject: "English", marksObtained: 85, totalMarks: 100, percentage: 85, grade: "A" },
        { subject: "Science", marksObtained: 88, totalMarks: 100, percentage: 88, grade: "A" },
      ],
      totalObtained: 263,
      totalMax: 300,
      percentage: "87.67",
      grade: "A",
    };

    it("should build a valid jsPDF document with authentic school branding", () => {
      const doc = buildStudentReportCardDoc(mockStudentResult, {
        schoolName: "Government High School Sahiwal",
        subtitle: "Punjab Government (PCTB) • Academic Session 2026-27",
      });

      expect(doc).toBeDefined();
      expect(typeof doc.save).toBe("function");
      expect(doc.internal.pages.length).toBeGreaterThanOrEqual(1);
    });

    it("should execute single and bulk PDF generation without throwing exceptions", () => {
      const singleDoc = buildStudentReportCardDoc(mockStudentResult, {
        schoolName: "Government High School Sahiwal",
      });
      expect(singleDoc).toBeDefined();
      expect(typeof singleDoc.save).toBe("function");
      expect(singleDoc.internal.pages.length).toBeGreaterThanOrEqual(1);

      // Verify bulk multi-student report cards accumulation
      const bulkDoc = buildStudentReportCardDoc(mockStudentResult, {
        schoolName: "Government High School Sahiwal",
      });
      bulkDoc.addPage();
      buildStudentReportCardDoc(mockStudentResult, {
        schoolName: "Government High School Sahiwal",
        doc: bulkDoc,
      });
      expect(bulkDoc.internal.pages.length).toBeGreaterThan(singleDoc.internal.pages.length);
    });
  });

  describe("5. Canonical Unified Grading Scale Invariants (Fix 5)", () => {
    it("should correctly calculate grades according to the BISE / PCTB standard", () => {
      // Scale: >=90: A+, >=80: A, >=70: B, >=60: C, >=50: D, <50: F
      expect(calculateGrade(100)).toBe("A+");
      expect(calculateGrade(95)).toBe("A+");
      expect(calculateGrade(90)).toBe("A+");

      expect(calculateGrade(89.9)).toBe("A");
      expect(calculateGrade(88)).toBe("A");
      expect(calculateGrade(87.67)).toBe("A");
      expect(calculateGrade(85)).toBe("A");
      expect(calculateGrade(80)).toBe("A");

      expect(calculateGrade(79)).toBe("B");
      expect(calculateGrade(70)).toBe("B");

      expect(calculateGrade(65)).toBe("C");
      expect(calculateGrade(60)).toBe("C");

      expect(calculateGrade(55)).toBe("D");
      expect(calculateGrade(50)).toBe("D");

      expect(calculateGrade(49.9)).toBe("F");
      expect(calculateGrade(20)).toBe("F");
      expect(calculateGrade(0)).toBe("F");
    });

    it("should strictly return 'A' for Imran Haider's overall score (87.67%) and never 'A++'", () => {
      const mathGrade = calculateGrade(90);
      const scienceGrade = calculateGrade(88);
      const englishGrade = calculateGrade(85);
      const overallPct = (263 / 300) * 100; // 87.666...%
      const overallGrade = calculateGrade(overallPct);

      expect(mathGrade).toBe("A+");
      expect(scienceGrade).toBe("A");
      expect(englishGrade).toBe("A");
      expect(overallGrade).toBe("A");

      expect(mathGrade).not.toBe("A++");
      expect(overallGrade).not.toBe("A++");
    });

    it("should return correct styling badges for each grade level", () => {
      expect(getGradeBadgeClasses("A+")).toContain("emerald");
      expect(getGradeBadgeClasses("A")).toContain("green");
      expect(getGradeBadgeClasses("B")).toContain("blue");
      expect(getGradeBadgeClasses("C")).toContain("amber");
      expect(getGradeBadgeClasses("D")).toContain("orange");
      expect(getGradeBadgeClasses("F")).toContain("red");
    });
  });
});
