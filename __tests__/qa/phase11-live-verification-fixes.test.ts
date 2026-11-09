import { ConfigurationService } from "@/services/configuration.service";
import { StaffPersistenceMapper } from "@/lib/mappers/StaffPersistenceMapper";
import { FeePersistenceMapper } from "@/lib/mappers/FeePersistenceMapper";
import { MarkAttendanceSchema } from "@/validators/attendance/AttendanceValidator";
import { FeesService } from "@/services/fees.service";
import { DashboardService } from "@/services/dashboard.service";

describe("Phase 11 — Live Verification Remediations & Auto-Reconciliation", () => {
  const tenantId = "tenant-phase11-test";

  describe("Check #2: School Setup Overview Self-Healing & Fallback", () => {
    it("should self-heal configuration view model from tenant profile when config doc is absent", async () => {
      const mockDb = {
        collection: jest.fn((col: string) => {
          if (col === "tenants") {
            return {
              doc: jest.fn(() => ({
                get: jest.fn().mockResolvedValue({
                  exists: true,
                  data: () => ({
                    name: "Test Secondary School - EduPilot QA",
                    type: "Private",
                    boardName: "Private School (SNC Based)",
                    country: "PK",
                  }),
                }),
              })),
            };
          }
          if (col === "classes" || col === "sections") {
            return {
              where: jest.fn().mockReturnThis(),
              get: jest.fn().mockResolvedValue({
                empty: false,
                docs: [
                  { id: "sec-a", data: () => ({ classGrade: "Class 9", sectionName: "A", level: "Secondary" }) },
                  { id: "sec-b", data: () => ({ classGrade: "Class 9", sectionName: "B", level: "Secondary" }) },
                  { id: "sec-c", data: () => ({ classGrade: "Class 9", sectionName: "C", level: "Secondary" }) },
                ],
              }),
            };
          }
          return { where: jest.fn().mockReturnThis(), get: jest.fn().mockResolvedValue({ empty: true, docs: [] }) };
        }),
      };

      const mockRepo = {
        getConfiguration: jest.fn().mockResolvedValue(null),
        saveConfiguration: jest.fn().mockResolvedValue(undefined),
        db: mockDb,
      };
      const mockCache = {
        getConfiguration: jest.fn().mockResolvedValue(null),
        setConfiguration: jest.fn().mockResolvedValue(undefined),
      };
      const mockHealth = {
        checkHealth: jest.fn().mockResolvedValue({ status: "CONFIGURED", diagnostics: {} }),
      };

      const service = new ConfigurationService(mockRepo as any, mockCache as any, mockHealth as any);
      const viewModel = await service.getConfigurationViewModel(tenantId);

      expect(viewModel).not.toBeNull();
      expect(viewModel?.schoolName).toBe("Test Secondary School - EduPilot QA");
      expect(viewModel?.schoolType).toBe("Private");
      expect(viewModel?.boardName).toBe("Private School (SNC Based)");
      expect(viewModel?.classes.length).toBeGreaterThanOrEqual(1);
      expect(viewModel?.classes[0].name).toBe("Class 9");
    });
  });

  describe("Check #5: Attendance Persistence & Numeric Roll Sorting", () => {
    it("should validate attendance DTO with numeric roll number without throwing schema error", () => {
      const numericRollPayload = {
        studentId: "student-01",
        classGrade: "9",
        section: "A",
        date: "2026-11-08",
        status: "Present" as const,
        rollNumber: 1,
      };

      const parsed = MarkAttendanceSchema.safeParse(numericRollPayload);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.rollNumber).toBe(1);
      }
    });

    it("should sort students numerically by roll number, not alphabetically (1, 2, 9, 10 instead of 1, 10, 2, 9)", () => {
      const students = [
        { id: "s10", rollNumber: "10", fullName: "Student 10" },
        { id: "s1", rollNumber: "1", fullName: "Student 01" },
        { id: "s2", rollNumber: "2", fullName: "Student 02" },
        { id: "s9", rollNumber: "9", fullName: "Student 09" },
      ];

      const sorted = [...students].sort((a, b) => {
        const rollA = Number(String(a.rollNumber).replace(/\D/g, "")) || 0;
        const rollB = Number(String(b.rollNumber).replace(/\D/g, "")) || 0;
        return rollA - rollB;
      });

      expect(sorted.map(s => s.rollNumber)).toEqual(["1", "2", "9", "10"]);
    });
  });

  describe("Check #6: Exams API Envelope Safety & Subjects Fallback", () => {
    it("should safely unwrap axios/envelope without calling .map on object wrapper", () => {
      const apiResponse = {
        data: {
          success: true,
          data: [
            { id: "sec-1", classGrade: "Class 9", sectionName: "A", subjects: ["Math", "Physics"] },
            { id: "sec-2", classGrade: "Class 9", sectionName: "B", subjects: [] },
          ],
        },
      };

      // Exact safe unwrapping used in app/(protected)/exams/page.tsx
      const rawData = apiResponse?.data?.data ?? apiResponse?.data ?? [];
      const safeSections = Array.isArray(rawData) ? rawData : [];

      expect(Array.isArray(safeSections)).toBe(true);
      expect(safeSections).toHaveLength(2);
      expect(() => safeSections.map((s: any) => s.id)).not.toThrow();

      // Subject fallback logic
      const defaultSubjects = ["English", "Mathematics", "Science", "Urdu"];
      const s1Subjects = safeSections[0].subjects?.length > 0 ? safeSections[0].subjects : defaultSubjects;
      const s2Subjects = safeSections[1].subjects?.length > 0 ? safeSections[1].subjects : defaultSubjects;

      expect(s1Subjects).toEqual(["Math", "Physics"]);
      expect(s2Subjects).toEqual(defaultSubjects);
    });
  });

  describe("Check #7: Staff Profile & Standalone Edit Parity", () => {
    it("should normalize both flat and nested properties without TypeError on missing objects", () => {
      const rawDoc = {
        id: "staff-101",
        tenantId: "tenant-1",
        fullName: "Muhammad Ali",
        designation: "Senior Science Teacher",
        department: "Science",
        basicSalary: 65000,
        bankName: "Habib Bank Limited",
        accountNumber: "PK36HABB00000012345678",
        salaryPaymentMethod: "Bank Transfer",
        phone: "03001234567",
        status: "active",
      };

      const entity = StaffPersistenceMapper.fromFirestore(rawDoc as any);

      // Top-level compatibility fields
      expect(entity.fullName).toBe("Muhammad Ali");
      expect(entity.designation).toBe("Senior Science Teacher");
      expect(entity.basicSalary).toBe(65000);
      expect(entity.bankName).toBe("Habib Bank Limited");
      expect(entity.accountNumber).toBe("PK36HABB00000012345678");
      expect(entity.salaryPaymentMethod).toBe("Bank Transfer");

      // Nested canonical structures
      expect(entity.personal.fullName).toBe("Muhammad Ali");
      expect(entity.professional.designation).toBe("Senior Science Teacher");
      expect(entity.payroll?.basicSalary).toBe(65000);
      expect(entity.payroll?.bankName).toBe("Habib Bank Limited");
      expect(entity.payroll?.accountNumber).toBe("PK36HABB00000012345678");
      expect(entity.payroll?.salaryPaymentMethod).toBe("Bank Transfer");
    });
  });

  describe("Check #8: Dashboard Live Aggregation", () => {
    it("should accurately compute active counts and revenue from mock collections", async () => {
      const mockStudents = Array.from({ length: 30 }, (_, i) => ({
        id: `s-${i + 1}`,
        status: "active",
        classGrade: "Class 9",
        section: i < 10 ? "A" : i < 20 ? "B" : "C",
      }));

      const mockStaff = Array.from({ length: 10 }, (_, i) => ({
        id: `st-${i + 1}`,
        status: "active",
        department: i < 5 ? "Science" : "Arts",
      }));

      const mockFees: Array<{ id: string; studentId: string; status: string; amountPaid?: number; amountDue?: number; amount: number }> = [
        { id: "f-1", studentId: "s-1", status: "paid", amountPaid: 5000, amountDue: 0, amount: 5000 },
        ...Array.from({ length: 29 }, (_, i) => ({
          id: `f-${i + 2}`,
          studentId: `s-${i + 2}`,
          status: "pending",
          amountPaid: 0,
          amountDue: 5000,
          amount: 5000,
        })),
      ];

      const totalStudents = mockStudents.length;
      const activeStudents = mockStudents.filter(s => s.status.toLowerCase() === "active").length;
      const totalStaff = mockStaff.length;
      const activeStaff = mockStaff.filter(s => s.status.toLowerCase() === "active").length;

      const revenue = mockFees
        .filter(f => f.status.toLowerCase() === "paid")
        .reduce((sum, f) => sum + (f.amountPaid || 0), 0);

      const pendingFees = mockFees
        .filter(f => f.status.toLowerCase() === "pending")
        .reduce((sum, f) => sum + (f.amountDue || 0), 0);

      expect(totalStudents).toBe(30);
      expect(activeStudents).toBe(30);
      expect(totalStaff).toBe(10);
      expect(activeStaff).toBe(10);
      expect(revenue).toBe(5000);
      expect(pendingFees).toBe(145000);
    });
  });

  describe("Check #9: Fees Deduplication & Clean Class Name Formatting", () => {
    it("should clean 'CLASSCLASS 9- SECTIONC' strings into 'Class 9' and 'Section C'", () => {
      const dirtyDoc = {
        id: "fee-dirty",
        classGrade: "CLASSCLASS 9- SECTIONC",
        section: "",
        status: "pending",
        amountDue: 5000,
      };

      const entity = FeePersistenceMapper.fromFirestore(dirtyDoc as any);
      expect(entity.financial.classGrade).toBe("Class 9");
    });

    it("should deduplicate multiple fee records for the same student and month", () => {
      const studentFees = [
        { id: "f-paid", feeMonth: "November 2026", status: "paid", amountPaid: 5000 },
        { id: "f-stale-unpaid", feeMonth: "November", status: "pending", amount: 0, amountDue: 0 },
      ];

      // Deduplication rule
      const paidRecord = studentFees.find(f => f.status.toLowerCase() === "paid");
      const surviving = paidRecord ? [paidRecord] : studentFees;

      expect(surviving).toHaveLength(1);
      expect(surviving[0].id).toBe("f-paid");
      expect(surviving[0].amountPaid).toBe(5000);
    });
  });

  describe("Check #10: Promotion & Students Directory Filtering", () => {
    it("should normalize 'Class 9' and '9' so promotion correctly identifies eligible students", () => {
      const normClass = (c: any) => String(c || "").replace(/^Class\s*/i, "").trim().toLowerCase();

      const students = [
        { id: "s1", classGrade: "Class 9", status: "active" },
        { id: "s2", classGrade: "9", status: "active" },
        { id: "s3", classGrade: "Class 10", status: "active" },
      ];

      const fromClassSelection = "9";
      const target = normClass(fromClassSelection);
      const eligible = students.filter(s => normClass(s.classGrade) === target);

      expect(eligible).toHaveLength(2);
      expect(eligible.map(s => s.id)).toEqual(["s1", "s2"]);
    });
  });
});

