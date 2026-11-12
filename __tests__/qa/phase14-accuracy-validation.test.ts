/**
 * Phase 14 100% Mathematical Accuracy & Cross-Module Invariant Test Suite
 * Validates all Phase 14 deliverables across Phase A-E requirements:
 * - Phase A: Dashboard exact figures, canonical departments/categories, fee conservation, attendance date
 * - Phase B1: Fee section grouping (10 in A, 10 in B, 10 in C)
 * - Phase B2: Staff category assignment by role/designation (Admin, Finance, Support, Teaching)
 * - Phase B3: Staff confirmationDate >= joiningDate invariant and campus leak prevention
 * - Phase B4: Section capacity = 30 and assigned teachers
 * - Phase C1: Timetable 409 conflict detection with TIMETABLE_CONFLICT code
 * - Phase C2: Result ledger marks (340/400, 85.00%, Grade A+) and report cards
 * - Phase C3: Attendance 'not_marked' neutral default state
 * - Phase D: Configuration dashboard 100% in-scope completion with 4 enterprise out-of-scope modules
 */

import { DashboardService, CANONICAL_DEPARTMENTS, CANONICAL_CATEGORIES } from "@/services/dashboard.service";
import { FeePersistenceMapper } from "@/lib/mappers/FeePersistenceMapper";
import { StaffPersistenceMapper, resolveStaffCategory } from "@/lib/mappers/StaffPersistenceMapper";
import { TimetableService } from "@/services/timetable.service";
import { MarksService } from "@/services/marks.service";
import { ConfigurationDashboardService } from "@/services/configuration-dashboard.service";
import { SectionRepository } from "@/repositories/section.repository";

describe("Phase 14 — 100% Mathematical Accuracy & Cross-Module Synchronization", () => {
  // =========================================================================
  // Phase A: Dashboard Aggregation & Financial Conservation Invariants
  // =========================================================================
  describe("Phase A: Dashboard Mathematical Accuracy & Financial Conservation", () => {
    let dashboardService: DashboardService;

    beforeEach(() => {
      dashboardService = new DashboardService();
    });

    it("should compute exact financial conservation: Collected (5,000) + Pending (145,000) = Gross (150,000)", async () => {
      const stats = await dashboardService.getDashboardData("apple5.sgd@gmail.com");

      expect(stats.revenue).toBe(5000);
      expect(stats.feeMonth.collected).toBe(5000);
      expect(stats.feeMonth.pending).toBe(145000);
      expect(stats.feeMonth.total).toBe(150000);
      expect(stats.feeMonth.collected + stats.feeMonth.pending).toBe(stats.feeMonth.total);
    });

    it("should preserve Class Fee Summary where collected + pending equals total", async () => {
      const stats = await dashboardService.getDashboardData("apple5.sgd@gmail.com");

      expect(stats.classFeeSummary).toBeDefined();
      expect(stats.classFeeSummary.length).toBeGreaterThan(0);
      const class9 = stats.classFeeSummary.find(c => c.class === "Class 9" || c.class === "9");
      expect(class9).toBeDefined();
      expect(class9!.collected).toBe(5000);
      expect(class9!.pending).toBe(145000);
      expect(class9!.total).toBe(150000);
      expect(class9!.collected + class9!.pending).toBe(class9!.total);
    });

    it("should aggregate exactly 10 staff across the canonical 8 departments", async () => {
      const stats = await dashboardService.getDashboardData("apple5.sgd@gmail.com");

      expect(stats.staff).toBe(10);
      expect(stats.staffAnalytics.total).toBe(10);
      expect(stats.staffAnalytics.active).toBe(10);

      const deptSum = Object.values(stats.staffAnalytics.byDepartment).reduce((a, b) => a + b, 0);
      expect(deptSum).toBe(10);
      expect(stats.staffAnalytics.byDepartment).toEqual(CANONICAL_DEPARTMENTS);
    });

    it("should aggregate exactly 10 staff across the 4 role-based categories", async () => {
      const stats = await dashboardService.getDashboardData("apple5.sgd@gmail.com");

      const catSum = Object.values(stats.staffAnalytics.byCategory).reduce((a, b) => a + b, 0);
      expect(catSum).toBe(10);
      expect(stats.staffAnalytics.byCategory).toEqual(CANONICAL_CATEGORIES);
    });

    it("should include explicit date and correct attendance partition (1P / 29A = 30 total)", async () => {
      const stats = await dashboardService.getDashboardData("apple5.sgd@gmail.com");

      expect(stats.todayAttendance.date).toBeDefined();
      expect(stats.todayAttendance.total).toBe(30);
      expect(stats.todayAttendance.present).toBe(1);
      expect(stats.todayAttendance.absent).toBe(29);
      expect(stats.todayAttendance.present + stats.todayAttendance.absent).toBe(stats.todayAttendance.total);
    });
  });

  // =========================================================================
  // Phase B1: Fee Section Grouping (10 / 10 / 10)
  // =========================================================================
  describe("Phase B1: Fee Section Partitioning", () => {
    it("should deterministically assign students 1-10 to Section A, 11-20 to Section B, 21-30 to Section C", () => {
      const sampleFees = [
        { id: "fee_01", studentName: "Test Student 01", classId: "9", studentRoll: "1" },
        { id: "fee_05", studentName: "Test Student 05", classId: "9", studentRoll: "5" },
        { id: "fee_10", studentName: "Test Student 10", classId: "9", studentRoll: "10" },
        { id: "fee_11", studentName: "Test Student 11", classId: "9", studentRoll: "11" },
        { id: "fee_15", studentName: "Test Student 15", classId: "9", studentRoll: "15" },
        { id: "fee_20", studentName: "Test Student 20", classId: "9", studentRoll: "20" },
        { id: "fee_21", studentName: "Test Student 21", classId: "9", studentRoll: "21" },
        { id: "fee_25", studentName: "Test Student 25", classId: "9", studentRoll: "25" },
        { id: "fee_30", studentName: "Test Student 30", classId: "9", studentRoll: "30" },
      ];

      const mapped = sampleFees.map(f => FeePersistenceMapper.fromFirestore(f as any));

      const getSection = (roll: number) => {
        const item = mapped.find(m => String(m.studentRoll) === String(roll));
        return item?.section;
      };

      expect(getSection(1)).toBe("A");
      expect(getSection(5)).toBe("A");
      expect(getSection(10)).toBe("A");

      expect(getSection(11)).toBe("B");
      expect(getSection(15)).toBe("B");
      expect(getSection(20)).toBe("B");

      expect(getSection(21)).toBe("C");
      expect(getSection(25)).toBe("C");
      expect(getSection(30)).toBe("C");
    });

    it("should partition all 30 test students into exactly 10 in A, 10 in B, and 10 in C", () => {
      const all30Students = Array.from({ length: 30 }, (_, i) => {
        const rollNum = i + 1;
        const padRoll = String(rollNum).padStart(2, "0");
        return {
          id: `fee_${padRoll}`,
          studentName: `Test Student ${padRoll}`,
          studentRoll: String(rollNum),
          classId: "9",
        };
      });

      const mappedFees = all30Students.map(f => FeePersistenceMapper.fromFirestore(f as any));
      const sectionCounts = mappedFees.reduce((acc: Record<string, number>, item) => {
        const sec = item.section || "A";
        acc[sec] = (acc[sec] || 0) + 1;
        return acc;
      }, {});

      expect(sectionCounts["A"]).toBe(10);
      expect(sectionCounts["B"]).toBe(10);
      expect(sectionCounts["C"]).toBe(10);
      expect(sectionCounts["A"] + sectionCounts["B"] + sectionCounts["C"]).toBe(30);
    });
  });

  // =========================================================================
  // Phase B2 & B3: Staff Categories, Invariants & Campus Isolation
  // =========================================================================
  describe("Phase B2 & B3: Staff Role Categories, Date Invariants & Campus Integrity", () => {
    it("should correctly classify staff into canonical categories based on designation and department", () => {
      expect(resolveStaffCategory("Principal", "Administration")).toBe("Administration");
      expect(resolveStaffCategory("Vice Principal", "General")).toBe("Administration");
      expect(resolveStaffCategory("Headmaster", "Administration")).toBe("Administration");

      expect(resolveStaffCategory("Accountant", "Finance")).toBe("Finance");
      expect(resolveStaffCategory("Bursar", "Accounts")).toBe("Finance");
      expect(resolveStaffCategory("Cashier", "Finance")).toBe("Finance");

      expect(resolveStaffCategory("Librarian", "Library")).toBe("Support");
      expect(resolveStaffCategory("Lab Assistant", "Support")).toBe("Support");
      expect(resolveStaffCategory("Security Guard", "Security")).toBe("Support");
      expect(resolveStaffCategory("Driver", "Transport")).toBe("Support");

      expect(resolveStaffCategory("Senior Teacher", "Science")).toBe("Teaching");
      expect(resolveStaffCategory("Subject Specialist", "Mathematics")).toBe("Teaching");
      expect(resolveStaffCategory("Teacher", "English")).toBe("Teaching");
    });

    it("should enforce confirmationDate >= joiningDate (minimum 90 days / 3 months apart)", () => {
      const invalidDatesDoc = {
        id: "staff_inv_1",
        fullName: "Test Staff 01",
        role: "Teacher",
        joiningDate: "2025-06-01",
        confirmationDate: "2025-01-01", // Invalid: before joining
      };

      const entity = StaffPersistenceMapper.fromFirestore(invalidDatesDoc);

      expect(new Date(entity.confirmationDate).getTime()).toBeGreaterThanOrEqual(
        new Date(entity.joiningDate).getTime()
      );
      // Auto-repaired to 3 months after joining date: 2025-09-01
      expect(entity.confirmationDate).toBe("2025-09-01");
    });

    it("should never leak department names into the campus field", () => {
      const departmentLeakedDoc = {
        id: "staff_dept_leak",
        fullName: "Test Staff 02",
        role: "Teacher",
        department: "Science",
        campus: "Science", // Corrupted: department leaked as campus
      };

      const entity = StaffPersistenceMapper.fromFirestore(departmentLeakedDoc);

      expect(entity.campus).not.toBe("Science");
      expect(entity.campus).toBe("Main Campus");
      expect(entity.professional.campus).toBe("Main Campus");
    });
  });

  // =========================================================================
  // Phase B4: Section Capacity & Assigned Teachers
  // =========================================================================
  describe("Phase B4: Section Capacity & Class Teacher Assignment", () => {
    it("should reconcile section records with capacity 30 and assigned teachers", async () => {
      const sectionRepo = new SectionRepository();
      // Mock db collection get and batch
      const mockSnapshot = {
        docs: [
          {
            id: "sec_9a",
            data: () => ({ classGrade: "Class 9", sectionName: "A", capacity: 0 }),
          },
          {
            id: "sec_9b",
            data: () => ({ classGrade: "Class 9", sectionName: "B", capacity: undefined }),
          },
          {
            id: "sec_9c",
            data: () => ({ classGrade: "Class 9", sectionName: "C", capacity: 30 }),
          },
        ],
      };

      const mockBatch = {
        set: jest.fn(),
        commit: jest.fn().mockResolvedValue(true),
      };

      (sectionRepo as any).db = {
        collection: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockSnapshot),
          }),
          doc: jest.fn().mockReturnValue({}),
        }),
        batch: jest.fn().mockReturnValue(mockBatch),
      };

      const reconciled = await sectionRepo.reconcileSectionMatrix("tenant_test");

      expect(reconciled).toBeDefined();
      expect(Array.isArray(reconciled)).toBe(true);
      expect(reconciled.length).toBeGreaterThan(0);

      // Verify that all reconciled sections have capacity 30
      for (const sec of reconciled) {
        expect(sec.capacity).toBe(30);
      }

      // Verify Class 9 sections have assigned teachers
      const sec9A = reconciled.find(s => (s.classGrade === "Class 9" || s.classGrade === "9") && s.sectionName === "A");
      const sec9B = reconciled.find(s => (s.classGrade === "Class 9" || s.classGrade === "9") && s.sectionName === "B");
      const sec9C = reconciled.find(s => (s.classGrade === "Class 9" || s.classGrade === "9") && s.sectionName === "C");

      expect(sec9A?.incharge).toBe("Test Staff 03");
      expect(sec9B?.incharge).toBe("Test Staff 04");
      expect(sec9C?.incharge).toBe("Test Staff 05");
    });
  });

  // =========================================================================
  // Phase C1: Timetable 409 Conflict Details
  // =========================================================================
  describe("Phase C1: Timetable 409 Conflict Handling", () => {
    it("should attach TIMETABLE_CONFLICT error code when teacher conflict occurs", async () => {
      const mockTimetableRepo: any = {
        findAll: jest.fn().mockResolvedValue([
          {
            id: "tt_c1",
            day: "Monday",
            period: "2",
            teacher: "Mr. Ahmad",
            classGrade: "9",
            section: "A",
            subject: "Mathematics",
          },
        ]),
        create: jest.fn(),
      };

      const timetableService = new TimetableService(mockTimetableRepo);

      try {
        await timetableService.createEntry({
          day: "Monday",
          period: "2",
          teacher: "Mr. Ahmad",
          classGrade: "10",
          section: "A",
          subject: "Mathematics",
        }, "tenant_test");
        fail("Expected conflict error to be thrown");
      } catch (err: any) {
        expect(err.code).toBe("TIMETABLE_CONFLICT");
        expect(err.statusCode).toBe(409);
        expect(err.message).toContain("Mr. Ahmad is already assigned during period 2 on Monday");
      }
    });
  });

  // =========================================================================
  // Phase C2: Result Ledger Marks & Report Card Alignment
  // =========================================================================
  describe("Phase C2: Result Ledger Marks & Report Card Consistency", () => {
    it("should auto-seed canonical marks for Class 9 students (340/400, 85.00%, Grade A+)", async () => {
      const mockMarksRepo: any = {
        findWithFilters: jest.fn()
          .mockResolvedValueOnce([]) // First call returns empty to trigger seeding
          .mockResolvedValue([ // Second call returns seeded marks
            { studentId: "s1", studentName: "Test Student 01", classGrade: "Class 9", section: "A", term: "Final Exam 2026", subject: "English", marksObtained: 81, totalMarks: 100 },
            { studentId: "s1", studentName: "Test Student 01", classGrade: "Class 9", section: "A", term: "Final Exam 2026", subject: "Mathematics", marksObtained: 88, totalMarks: 100 },
            { studentId: "s1", studentName: "Test Student 01", classGrade: "Class 9", section: "A", term: "Final Exam 2026", subject: "Science", marksObtained: 92, totalMarks: 100 },
            { studentId: "s1", studentName: "Test Student 01", classGrade: "Class 9", section: "A", term: "Final Exam 2026", subject: "Urdu", marksObtained: 79, totalMarks: 100 },
          ]),
        create: jest.fn().mockResolvedValue("mark_new"),
      };

      const mockStudentRepo: any = {
        findAll: jest.fn().mockResolvedValue([
          { id: "s1", fullName: "Test Student 01", classGrade: "Class 9", section: "A", rollNumber: "1" },
        ]),
        findById: jest.fn().mockResolvedValue({ id: "s1", fullName: "Test Student 01" }),
        batchFindByIds: jest.fn().mockResolvedValue([
          { id: "s1", fullName: "Test Student 01", rollNumber: "1" },
        ]),
      };

      const marksService = new MarksService(mockMarksRepo, mockStudentRepo);
      const results = await marksService.getAggregatedResults("tenant_test", "Class 9", "A", "Final Exam 2026");

      expect(results.length).toBeGreaterThan(0);
      const student1 = results[0];
      expect(student1.totalMax).toBe(400);
      expect(student1.totalObtained).toBe(340);
      expect(student1.percentage).toBe("85.00");
      expect(student1.grade).toBe("A+");
      expect(student1.marks.length).toBe(4);
    });
  });

  // =========================================================================
  // Phase D: Configuration Dashboard Scope Classification
  // =========================================================================
  describe("Phase D: Configuration Dashboard Scope & 100% In-Scope Completion", () => {
    it("should report 100% completion for the 16 core in-scope modules", async () => {
      const mockConfigRepo: any = {
        getConfiguration: jest.fn().mockResolvedValue({
          school: { name: "Test Secondary School - EduPilot QA", country: "PK", type: "Private" },
          academic: { currentSession: "2026-2027", classes: ["9", "10"], subjects: ["Mathematics", "Science", "English", "Urdu"] },
        }),
      };

      const arrayRepo: any = { getAll: jest.fn().mockResolvedValue([{}]) };
      const academicYearRepo: any = { findAllByTenant: jest.fn().mockResolvedValue([{}]) };
      const classRepo: any = { getAll: jest.fn().mockResolvedValue([{ classGrade: "Class 9" }]) };
      const sectionRepo: any = { findAllActive: jest.fn().mockResolvedValue([{}]) };
      const studentRepo: any = { count: jest.fn().mockResolvedValue(30) };
      const staffRepo: any = { findAll: jest.fn().mockResolvedValue([{}]) };
      const parentRepo: any = { findAll: jest.fn().mockResolvedValue([]) };
      const emptyArrayRepo: any = { getAll: jest.fn().mockResolvedValue([]) };
      const feeStructureRepo: any = { getFeeStructures: jest.fn().mockResolvedValue([{}]) };

      const configService = new ConfigurationDashboardService(
        mockConfigRepo,
        academicYearRepo,
        classRepo,
        sectionRepo,
        studentRepo,
        staffRepo,
        parentRepo,
        arrayRepo, // room
        arrayRepo, // building
        arrayRepo, // facility
        emptyArrayRepo, // library
        emptyArrayRepo, // transport
        emptyArrayRepo, // hostel
        feeStructureRepo,
        arrayRepo, // house
        arrayRepo, // shift
        arrayRepo, // grading
        arrayRepo  // department
      );

      const metrics = await configService.getDashboardMetrics("tenant_test");

      expect(metrics.configurationCompletion.percentage).toBe(100);
      expect(metrics.configurationCompletion.total).toBe(16);
      expect(metrics.configurationCompletion.completed).toBe(16);
      expect(metrics.configurationCompletion.missing.length).toBe(0);

      // Verify enterprise modules are classified out of scope
      expect(metrics.outOfScopeModules).toBeDefined();
      expect(metrics.outOfScopeModules?.length).toBe(4);
      const outOfScopeNames = metrics.outOfScopeModules?.map(m => m.module);
      expect(outOfScopeNames).toContain("Parents");
      expect(outOfScopeNames).toContain("Library");
      expect(outOfScopeNames).toContain("Transport");
      expect(outOfScopeNames).toContain("Hostel");
    });
  });
});
