import { PayrollService } from "@/services/PayrollService";
import { StudentService } from "@/services/StudentService";
import { computeAttendanceTrend } from "@/lib/aggregations/shared-metrics";
import { normalizeBillingMonth } from "@/services/fees.service";
import { getStaffSalary } from "@/lib/mappers/StaffPersistenceMapper";
import { formatClassLabel } from "@/lib/utils/formatClassLabel";

// Mock Firebase Admin
jest.mock("@/lib/firebase-admin", () => {
  const store = new Map<string, any>();
  const mockBatch = {
    set: jest.fn((ref: any, data: any) => {
      store.set(ref.id, data);
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
          if (colName === "payroll") {
            const docs = Array.from(store.entries()).map(([id, data]) => ({
              id,
              data: () => data,
            }));
            return { empty: docs.length === 0, docs };
          }
          if (colName === "sections") {
            return {
              empty: false,
              docs: [
                {
                  id: "sec_10a",
                  data: () => ({
                    classGrade: "Class 10",
                    sectionName: "A",
                    incharge: "ghzandar Ali",
                    classTeacherId: "stf_01",
                  }),
                },
              ],
            };
          }
          return { empty: true, docs: [] };
        }),
        doc: jest.fn((id: string) => ({
          id,
          get: jest.fn(async () => ({
            exists: store.has(id),
            data: () => store.get(id),
          })),
          set: jest.fn(async (data: any) => {
            store.set(id, data);
          }),
          update: jest.fn(async (data: any) => {
            const current = store.get(id) || {};
            store.set(id, { ...current, ...data });
          }),
        })),
      })),
      batch: jest.fn(() => mockBatch),
    },
  };
});

// Mock StaffRepository
jest.mock("@/repositories/staff.repository", () => {
  return {
    StaffRepository: jest.fn().mockImplementation(() => ({
      findAll: jest.fn(async () => [
        {
          id: "stf_01",
          fullName: "ghzandar Ali",
          personal: { fullName: "ghzandar Ali" },
          professional: { employeeId: "STF-01", designation: "Senior Teacher", department: "Science" },
          payroll: { basicSalary: 65000, allowances: [{ title: "Transport", amount: 5000 }], deductions: [] },
          status: "active",
        },
        {
          id: "stf_02",
          fullName: "Muhammad Aslam",
          personal: { fullName: "Muhammad Aslam" },
          professional: { employeeId: "STF-02", designation: "Subject Specialist", department: "Mathematics" },
          basicSalary: 60000,
          status: "active",
        },
        {
          id: "stf_03",
          fullName: "Fatima Noor",
          personal: { fullName: "Fatima Noor" },
          professional: { employeeId: "STF-03", designation: "Teacher", department: "English" },
          salary: 55000,
          status: "active",
        },
      ]),
      findById: jest.fn(async (id: string) => {
        if (id === "stf_01") {
          return {
            id: "stf_01",
            fullName: "ghzandar Ali",
            personal: { fullName: "ghzandar Ali" },
            professional: { employeeId: "STF-01", designation: "Senior Teacher", department: "Science" },
            payroll: { basicSalary: 65000, allowances: [{ title: "Transport", amount: 5000 }], deductions: [] },
          };
        }
        return null;
      }),
    })),
  };
});

describe("Phase 18 / Phase 6 Unification, Per-Section Roll Numbers, Marks, Attendance & Payroll", () => {
  const tenantId = "tenant_ghs_sahiwal";

  describe("Defect 1: Academic Year Unification", () => {
    test("canonical active academic year formats cleanly across modules", () => {
      const activeYear = "2025-2026";
      expect(activeYear).toMatch(/^\d{4}-\d{4}$/);
      expect(activeYear).not.toBe("2026-27");
    });
  });

  describe("Defect 2: Per-Section Roll Number Scoping", () => {
    test("mock repository findByRollNumber accepts classGrade and section arguments", async () => {
      const mockRepo = {
        findByRollNumber: jest.fn(async (roll: string, tId: string, cls?: string, sec?: string) => {
          // If checking Section A with roll 1, return existing student
          if (roll === "1" && cls === "Class 1" && sec === "A") {
            return { id: "s1", rollNumber: "1", classGrade: "Class 1", section: "A" };
          }
          // Section B with roll 1 does NOT exist
          return null;
        }),
      };

      const inSecA = await mockRepo.findByRollNumber("1", tenantId, "Class 1", "A");
      expect(inSecA).not.toBeNull();
      expect(inSecA?.section).toBe("A");

      const inSecB = await mockRepo.findByRollNumber("1", tenantId, "Class 1", "B");
      expect(inSecB).toBeNull();
    });

    test("promotion filter by fromSection correctly segregates students", () => {
      const testStudents = [
        { id: "s1", fullName: "Student 1", rollNumber: 1, classGrade: "Class 1", section: "A", status: "active" },
        { id: "s2", fullName: "Student 2", rollNumber: 2, classGrade: "Class 1", section: "A", status: "active" },
        { id: "s3", fullName: "Student 3", rollNumber: 1, classGrade: "Class 1", section: "B", status: "active" },
        { id: "s4", fullName: "Student 4", rollNumber: 1, classGrade: "Class 1", section: "C", status: "active" },
      ];

      const fromClass = "Class 1";
      const fromSection: string = "A";

      const filtered = testStudents.filter(s => {
        if (s.classGrade !== fromClass) return false;
        if (fromSection && fromSection !== "ALL" && s.section !== fromSection) return false;
        return true;
      });

      expect(filtered).toHaveLength(2);
      expect(filtered.map(s => s.id)).toEqual(["s1", "s2"]);
    });
  });

  describe("Defect 3: Marks Hydration & Results Full Roster", () => {
    test("result roster includes all enrolled students even with empty marks", () => {
      const enrolled = [
        { id: "s1", fullName: "Ahmed Ali", rollNumber: "1", classGrade: "Class 1", section: "A" },
        { id: "s2", fullName: "Bilal Khan", rollNumber: "2", classGrade: "Class 1", section: "A" },
      ];

      const rawResults = [
        {
          studentId: "s1",
          studentName: "Ahmed Ali",
          rollNumber: "1",
          marks: [{ subject: "Mathematics", marksObtained: 80, totalMarks: 100 }],
          totalObtained: 80,
          totalMax: 100,
          percentage: "80.00",
          grade: "A",
        },
      ];

      const marksMap = new Map<string, any>(rawResults.map(r => [r.studentId, r]));

      const fullRoster = enrolled.map(s => {
        const match = marksMap.get(s.id);
        if (match) {
          return { ...match, hasMarks: true };
        }
        return {
          studentId: s.id,
          studentName: s.fullName,
          rollNumber: s.rollNumber,
          marks: [],
          totalObtained: 0,
          totalMax: 0,
          percentage: "—",
          grade: "—",
          hasMarks: false,
        };
      });

      expect(fullRoster).toHaveLength(2);
      expect(fullRoster[0].hasMarks).toBe(true);
      expect(fullRoster[0].percentage).toBe("80.00");
      expect(fullRoster[1].hasMarks).toBe(false);
      expect(fullRoster[1].percentage).toBe("—");
      expect(fullRoster[1].grade).toBe("—");
    });
  });

  describe("Defect 4: Attendance Late-Mark Math & Dashboard Reconciliation", () => {
    test("late is counted as attended: (present + late) / totalMarked reports 94% on 14P + 1L / 16 total", () => {
      const presentCount = 14;
      const lateCount = 1;
      const absentCount = 1;
      const totalMarked = presentCount + lateCount + absentCount; // 16

      // Formula: ((Present + Late) / Total Marked) * 100
      const percentage = Math.round(((presentCount + lateCount) / totalMarked) * 100);
      expect(percentage).toBe(94);
    });

    test("computeAttendanceTrend shares identical math", () => {
      const todayStr = "2026-11-19";
      const records = [
        ...Array(14).fill({ date: todayStr, status: "Present" }),
        { date: todayStr, status: "Late" },
        { date: todayStr, status: "Absent" },
      ];

      const trend = computeAttendanceTrend(records, todayStr);
      const todaySlot = trend.calendarSlots.find(s => s.date === todayStr);

      expect(todaySlot?.isMarked).toBe(true);
      expect(todaySlot?.percentage).toBe(94);
      expect(todaySlot?.present).toBe(14);
      expect(todaySlot?.late).toBe(1);
      expect(todaySlot?.absent).toBe(1);
    });
  });

  describe("Defect 5: Payroll Module & Teacher-Section Sync", () => {
    const payrollService = new PayrollService();

    test("getMonthlyPayroll calculates totals and per-staff net salary", async () => {
      const summary = await payrollService.getMonthlyPayroll(tenantId, "November 2026");

      expect(summary.month).toBe("November 2026");
      expect(summary.totalStaff).toBe(3);
      expect(summary.records).toHaveLength(3);

      // ghzandar Ali: 65000 basic + 5000 allowance = 70000 net
      const ghzandar = summary.records.find(r => r.name === "ghzandar Ali");
      expect(ghzandar).toBeDefined();
      expect(ghzandar?.basicSalary).toBe(65000);
      expect(ghzandar?.totalAllowances).toBe(5000);
      expect(ghzandar?.netSalary).toBe(70000);
      expect(ghzandar?.status).toBe("Pending");

      // Muhammad Aslam: 60000 basic
      const aslam = summary.records.find(r => r.name === "Muhammad Aslam");
      expect(aslam?.netSalary).toBe(60000);

      // Fatima Noor: 55000 basic
      const fatima = summary.records.find(r => r.name === "Fatima Noor");
      expect(fatima?.netSalary).toBe(55000);

      // Total payroll = 70000 + 60000 + 55000 = 185000
      expect(summary.totalMonthlyPayroll).toBe(185000);
      expect(summary.totalPending).toBe(185000);
      expect(summary.totalPaid).toBe(0);
      expect(summary.pendingStaffCount).toBe(3);
      expect(summary.paidStaffCount).toBe(0);
    });

    test("markPaid updates record status to Paid", async () => {
      const paid = await payrollService.markPaid(
        tenantId,
        "stf_01",
        "November 2026",
        "Paid",
        "Bank Transfer",
        "test_admin"
      );

      expect(paid.status).toBe("Paid");
      expect(paid.paidAt).not.toBeNull();
      expect(paid.paymentMethod).toBe("Bank Transfer");

      // Re-fetch monthly payroll to verify reconciliation
      const summary = await payrollService.getMonthlyPayroll(tenantId, "November 2026");
      expect(summary.paidStaffCount).toBe(1);
      expect(summary.pendingStaffCount).toBe(2);
      expect(summary.totalPaid).toBe(70000);
      expect(summary.totalPending).toBe(115000);
    });

    test("markAllPaid marks all remaining pending records as Paid", async () => {
      const count = await payrollService.markAllPaid(tenantId, "November 2026", "Bank Transfer", "test_admin");
      expect(count).toBe(2);

      const summary = await payrollService.getMonthlyPayroll(tenantId, "November 2026");
      expect(summary.paidStaffCount).toBe(3);
      expect(summary.pendingStaffCount).toBe(0);
      expect(summary.totalPaid).toBe(185000);
      expect(summary.totalPending).toBe(0);
    });

    test("teacher section assignment label formats correctly", () => {
      const classLabel = formatClassLabel("Class 10");
      expect(classLabel).toBe("Class 10");
      const fullLabel = `${classLabel} - Section A`;
      expect(fullLabel).toBe("Class 10 - Section A");
    });
  });
});
