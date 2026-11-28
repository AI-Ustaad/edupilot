import { StaffService } from "@/services/StaffService";
import { PayrollService } from "@/services/PayrollService";
import { AcademicYearService } from "@/services/academic-year.service";
import { MarksService } from "@/services/marks.service";
import { SectionRepository } from "@/repositories/section.repository";
import { AnalyticsService } from "@/services/analytics.service";
import { getStaffSalary } from "@/lib/mappers/StaffPersistenceMapper";

// Mock Firebase Admin
jest.mock("@/lib/firebase-admin", () => {
  const store = new Map<string, any>();
  const mockBatch = {
    set: jest.fn((ref: any, data: any) => {
      store.set(ref.id || ref.path, data);
    }),
    delete: jest.fn((ref: any) => {
      store.delete(ref.id || ref.path);
    }),
    commit: jest.fn(async () => {}),
  };

  return {
    adminDb: {
      collection: jest.fn((colName: string) => ({
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn(async () => {
          if (colName === "staff") {
            return {
              empty: false,
              docs: [
                { id: "stf_01", data: () => ({ id: "stf_01", fullName: "ghzandar Ali", employeeId: "TT-001", basicSalary: 0, status: "active", tenantId: "tenant_ghs_sahiwal" }) },
                { id: "stf_02", data: () => ({ id: "stf_02", fullName: "Muhammad Aslam", employeeId: "TT-002", basicSalary: 50000, status: "active", tenantId: "tenant_ghs_sahiwal" }) },
                { id: "stf_03", data: () => ({ id: "stf_03", fullName: "Fatima Noor", employeeId: "TT-003", basicSalary: 45000, status: "active", tenantId: "tenant_ghs_sahiwal" }) },
                { id: "stf_04", data: () => ({ id: "stf_04", fullName: "Test Teacher Alpha", employeeId: "TT-004", basicSalary: 0, status: "active", tenantId: "tenant_ghs_sahiwal" }) },
                { id: "stf_05", data: () => ({ id: "stf_05", fullName: "Zahid Iqbal", employeeId: "TT-005", basicSalary: 45000, status: "active", tenantId: "tenant_ghs_sahiwal" }) },
                { id: "stf_06", data: () => ({ id: "stf_06", fullName: "Nasreen Akhtar", employeeId: "TT-006", basicSalary: 45000, status: "active", tenantId: "tenant_ghs_sahiwal" }) },
                { id: "stf_07", data: () => ({ id: "stf_07", fullName: "Rashid Mahmood", employeeId: "TT-007", basicSalary: 45000, status: "active", tenantId: "tenant_ghs_sahiwal" }) },
                { id: "stf_08", data: () => ({ id: "stf_08", fullName: "Khadija Bibi", employeeId: "TT-008", basicSalary: 45000, status: "active", tenantId: "tenant_ghs_sahiwal" }) },
                { id: "stf_09", data: () => ({ id: "stf_09", fullName: "Tariq Jamil", employeeId: "TT-009", basicSalary: 40000, status: "active", tenantId: "tenant_ghs_sahiwal" }) },
                { id: "stf_10", data: () => ({ id: "stf_10", fullName: "Saima Bano", employeeId: "TT-010", basicSalary: 35000, status: "active", tenantId: "tenant_ghs_sahiwal" }) },
              ],
            };
          }
          if (colName === "students") {
            const stuDocs = Array.from({ length: 50 }, (_, i) => ({
              id: `stu_${i + 1}`,
              data: () => ({
                id: `stu_${i + 1}`,
                fullName: i === 0 ? "Ahmed Shah" : i === 1 ? "Ayaan Shah" : `Student ${i + 1}`,
                rollNumber: i + 1,
                classGrade: i < 15 ? "Class 1" : i < 30 ? "Class 2" : "Class 10",
                section: i < 15 ? "A" : "A",
                tenantId: "tenant_ghs_sahiwal",
                deleted: false,
              }),
            }));
            return { empty: false, docs: stuDocs };
          }
          if (colName === "fees") {
            return {
              empty: false,
              docs: [
                { id: "fee_01", data: () => ({ id: "fee_01", studentId: "stu_1", tenantId: "tenant_ghs_sahiwal", status: "paid", amount: 5000, amountPaid: 5000, month: "November 2026" }) },
              ],
            };
          }
          if (colName === "attendance") {
            const attDocs = Array.from({ length: 50 }, (_, i) => ({
              id: `att_${i + 1}`,
              data: () => ({
                id: `att_${i + 1}`,
                tenantId: "tenant_ghs_sahiwal",
                date: "2026-11-19",
                status: i < 47 ? "present" : "absent",
              }),
            }));
            return { empty: false, docs: attDocs };
          }
          if (colName === "payroll") {
            return { empty: true, docs: [] };
          }
          if (colName === "sections") {
            return {
              empty: false,
              docs: [
                {
                  id: "sec_1a",
                  ref: { id: "sec_1a" },
                  data: () => ({ classGrade: "Class 1", sectionName: "A", incharge: "Unassigned", tenantId: "tenant_ghs_sahiwal" }),
                },
                {
                  id: "sec_1b",
                  ref: { id: "sec_1b" },
                  data: () => ({ classGrade: "Class 1", sectionName: "B", incharge: "Unassigned", tenantId: "tenant_ghs_sahiwal" }),
                },
                {
                  id: "sec_10a",
                  ref: { id: "sec_10a" },
                  data: () => ({ classGrade: "Class 10", sectionName: "A", incharge: "Unassigned", tenantId: "tenant_ghs_sahiwal" }),
                },
              ],
            };
          }
          return { empty: true, docs: [] };
        }),
        doc: jest.fn((id: string) => ({
          id,
          get: jest.fn(async () => ({ exists: store.has(id), data: () => store.get(id) })),
          set: jest.fn(async (data: any) => { store.set(id, data); }),
          update: jest.fn(async (data: any) => {
            const cur = store.get(id) || {};
            store.set(id, { ...cur, ...data });
          }),
        })),
      })),
      batch: jest.fn(() => mockBatch),
    },
    dbTimestamp: "2026-11-20T00:00:00Z",
  };
});

describe("Phase 18 Batch 1 Post-Hotfix Remediation QA Verification", () => {
  const tenantId = "tenant_ghs_sahiwal";

  describe("1. A2 (P0): Employee ID Migration & Zero Salary Fix", () => {
    it("should reconcile TT-xxx and hash IDs into sequential STF-001 through STF-010", async () => {
      const mockRawDocs = [
        { id: "s1", fullName: "ghzandar Ali", employeeId: "TT-001", basicSalary: 0 },
        { id: "s2", fullName: "Muhammad Aslam", employeeId: "TT-002", basicSalary: 50000 },
        { id: "s3", fullName: "Fatima Noor", employeeId: "TT-003", basicSalary: 45000 },
        { id: "s4", fullName: "Test Teacher Alpha", employeeId: "TT-004", basicSalary: 0 },
        { id: "s5", fullName: "Zahid Iqbal", employeeId: "TT-005", basicSalary: 45000 },
        { id: "s6", fullName: "Nasreen Akhtar", employeeId: "TT-006", basicSalary: 45000 },
        { id: "s7", fullName: "Rashid Mahmood", employeeId: "TT-007", basicSalary: 45000 },
        { id: "s8", fullName: "Khadija Bibi", employeeId: "TT-008", basicSalary: 45000 },
        { id: "s9", fullName: "Tariq Jamil", employeeId: "TT-009", basicSalary: 40000 },
        { id: "s10", fullName: "Saima Bano", employeeId: "TT-010", basicSalary: 40000 },
      ];

      const mockRepo: any = {
        findAll: jest.fn().mockResolvedValue(mockRawDocs),
        update: jest.fn().mockResolvedValue(undefined),
      };

      const staffService = new StaffService(mockRepo);
      const reconciled = staffService.reconcileStaffEntities(mockRawDocs, tenantId) as any[];

      expect(reconciled).toHaveLength(10);
      const ids = reconciled.map(s => s.employeeId);

      // Verify strict sequential STF-001 through STF-010 with zero TT-xxx or hash IDs
      expect(ids).toEqual([
        "STF-001",
        "STF-002",
        "STF-003",
        "STF-004",
        "STF-005",
        "STF-006",
        "STF-007",
        "STF-008",
        "STF-009",
        "STF-010",
      ]);

      // Verify ghzandar Ali is STF-001 with 50,000 salary
      const ghzandar = reconciled.find(s => s.fullName === "Ghzandar Ali");
      expect(ghzandar?.employeeId).toBe("STF-001");
      expect(ghzandar?.basicSalary).toBe(50000);

      // Verify Test Teacher Alpha has positive non-zero salary (45,000)
      const alpha = reconciled.find(s => s.fullName === "Test Teacher Alpha");
      expect(alpha?.basicSalary).toBe(45000);
      expect(getStaffSalary(alpha)).toBe(45000);

      // Verify all 10 staff have positive non-zero salaries
      reconciled.forEach(s => {
        expect(Number(s.basicSalary)).toBeGreaterThan(0);
      });

      // Verify total salary accurately sums to Rs. 450,000
      const totalSalary = reconciled.reduce((sum, s) => sum + Number(s.basicSalary || 0), 0);
      expect(totalSalary).toBe(450000);
    });

    it("should ensure getNextEmployeeId yields STF-011 when STF-010 is present", async () => {
      const mockRawDocs = Array.from({ length: 10 }, (_, i) => ({
        id: `s${i + 1}`,
        employeeId: `STF-${String(i + 1).padStart(3, "0")}`,
      }));
      const mockRepo: any = {
        findAll: jest.fn().mockResolvedValue(mockRawDocs),
      };
      const staffService = new StaffService(mockRepo);
      const nextId = await staffService.getNextEmployeeId(tenantId);
      expect(nextId).toBe("STF-011");
    });
  });

  describe("2. B1 & B2 (P0): Academic Year 2026-2027 & Unified /exams Marks Read Path", () => {
    it("should return 2026-2027 as current and mark 2025-2026 as Completed", async () => {
      const mockRepo: any = {
        findAllByTenant: jest.fn().mockResolvedValue([
          { id: "ay_1", name: "2025-2026", startDate: "2025-04-01", endDate: "2026-03-31", isCurrent: true, tenantId },
          { id: "ay_2", name: "2026-2027", startDate: "2026-04-01", endDate: "2027-03-31", isCurrent: false, tenantId },
        ]),
      };
      const ayService = new AcademicYearService(mockRepo);
      const years = await ayService.findAll(tenantId);
      const current = years.find(y => y.isCurrent);
      expect(current?.name).toBe("2026-2027");

      const completed = years.find(y => y.name === "2025-2026");
      expect(completed?.isCurrent).toBe(false);
      expect((completed as any)?.status).toBe("Completed");
    });

    it("should self-heal and return Class 1 Section A 1st Term marks for Ahmed Shah & Ayaan Shah", async () => {
      const mockMarksRepo: any = {
        findWithFilters: jest.fn().mockResolvedValue([]),
        upsert: jest.fn().mockResolvedValue(undefined),
      };
      const mockStudentRepo: any = {
        findAll: jest.fn().mockResolvedValue([
          { id: "stu_1", fullName: "Ahmed Shah", rollNumber: 1, classGrade: "Class 1", section: "A", deleted: false },
          { id: "stu_2", fullName: "Ayaan Shah", rollNumber: 2, classGrade: "Class 1", section: "A", deleted: false },
        ]),
      };

      const marksService = new MarksService(mockMarksRepo, mockStudentRepo);
      const marks = await marksService.listMarks(tenantId, { classGrade: "Class 1", section: "A", term: "1st Term" });

      // Upsert was called for English & Mathematics for both Ahmed and Ayaan (4 records)
      expect(mockMarksRepo.upsert).toHaveBeenCalledTimes(4);
    });
  });

  describe("3. B4 (P0): Section Teacher Assignments", () => {
    it("should assign valid class teachers across sections and eliminate unassigned state", async () => {
      const secRepo = new SectionRepository();
      const sections = await secRepo.reconcileSectionMatrix(tenantId);
      expect(sections.length).toBeGreaterThan(0);

      // Verify Class 1-A, 1-B, 10-A have teachers assigned
      const sec1A = sections.find(s => s.classGrade === "Class 1" && s.sectionName === "A");
      expect(sec1A?.incharge).not.toBe("Unassigned");
      expect(sec1A?.classTeacherName).toBeDefined();

      const sec10A = sections.find(s => s.classGrade === "Class 10" && s.sectionName === "A");
      expect(sec10A?.incharge).not.toBe("Unassigned");
    });
  });

  describe("4. B3 & Part E (P0): Dashboard Attendance Agreement & Analytics Reconciliation", () => {
    it("should return unified analytics metrics: 50 students, 10 staff, 5000 revenue, 60 active users", async () => {
      const analyticsService = new AnalyticsService();
      const data = await analyticsService.getTenantAnalytics(tenantId);

      expect(data.totalStudents).toBe(50);
      expect(data.totalStaff).toBe(10);
      expect(data.totalRevenue).toBe(5000);
      expect(data.activeUsers).toBe(60);
      expect(Array.isArray(data.trend)).toBe(true);
      expect(data.trend?.length).toBeGreaterThan(0);
    });
  });
});
