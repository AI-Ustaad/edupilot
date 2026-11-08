import React from "react";
import { renderToString } from "react-dom/server";
import { StudentService } from "@/services/StudentService";
import { StaffService } from "@/services/StaffService";
import { ConfigurationService } from "@/services/configuration.service";
import EditStudentModal from "@/components/students/EditStudentModal";
import EditStaffModal from "@/components/staff/EditStaffModal";
import { PageHeader } from "@/app/(protected)/admin/school-setup/components/PageHeader";

// Mock QueryClient / TanStack Query
jest.mock("@tanstack/react-query", () => {
  const actual = jest.requireActual("@tanstack/react-query");
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: jest.fn(),
      cancelQueries: jest.fn(),
      getQueryData: jest.fn(),
      setQueryData: jest.fn(),
    }),
  };
});

// Mock hooks
jest.mock("@/hooks/useClasses", () => ({
  useClasses: () => ({
    data: [
      { id: "cls-1", classGrade: "Grade 5", sectionName: "A" },
      { id: "cls-2", classGrade: "Grade 6", sectionName: "B" },
    ],
    isLoading: false,
  }),
}));

jest.mock("@/components/ToastProvider", () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

jest.mock("@/hooks/useStudents", () => ({
  useUpdateStudent: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
}));

jest.mock("@/hooks/useStaff", () => ({
  useUpdateStaff: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
}));

describe("Phase 10 — Full Edit Capabilities & Cross-Module Relational Data Synchronization", () => {
  const tenantId = "tenant-phase10-sync";
  const userId = "admin-user-p10";

  // In-memory collections store for integration testing
  const mockDbStore: Record<string, any[]> = {
    students: [],
    staff: [],
    sections: [],
    fees: [],
    attendance: [],
    marks: [],
    invoices: [],
    users: [],
    tenants: [],
    fee_structures: [],
    exam_terms: [],
    configurations: [],
  };

  const createMockDb = () => {
    return {
      collection: (colName: string) => ({
        doc: (id: string) => ({
          get: jest.fn().mockImplementation(async () => {
            const found = (mockDbStore[colName] || []).find((d: any) => d.id === id);
            return {
              exists: Boolean(found),
              id,
              data: () => found,
            };
          }),
          set: jest.fn().mockImplementation(async (data: any, options?: any) => {
            const list = mockDbStore[colName] || [];
            const idx = list.findIndex((d: any) => d.id === id);
            if (idx >= 0) {
              list[idx] = options?.merge ? { ...list[idx], ...data, id } : { ...data, id };
            } else {
              list.push({ ...data, id });
            }
            mockDbStore[colName] = list;
          }),
          update: jest.fn().mockImplementation(async (data: any) => {
            const list = mockDbStore[colName] || [];
            const idx = list.findIndex((d: any) => d.id === id);
            if (idx >= 0) {
              list[idx] = { ...list[idx], ...data };
            }
          }),
          delete: jest.fn().mockImplementation(async () => {
            mockDbStore[colName] = (mockDbStore[colName] || []).filter((d: any) => d.id !== id);
          }),
        }),
        add: jest.fn().mockImplementation(async (data: any) => {
          const id = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          const doc = { ...data, id };
          if (!mockDbStore[colName]) mockDbStore[colName] = [];
          mockDbStore[colName].push(doc);
          return { id };
        }),
        where: jest.fn().mockImplementation(function (field: string, op: string, val: any) {
          let filtered = (mockDbStore[colName] || []).filter((d: any) => {
            if (op === "==") return d[field] === val;
            return true;
          });
          const chain = {
            where: jest.fn().mockImplementation((f2: string, op2: string, v2: any) => {
              filtered = filtered.filter((d: any) => {
                if (op2 === "==") return d[f2] === v2;
                return true;
              });
              return chain;
            }),
            limit: jest.fn().mockImplementation(() => chain),
            get: jest.fn().mockImplementation(async () => ({
              empty: filtered.length === 0,
              size: filtered.length,
              docs: filtered.map((item: any) => ({
                id: item.id,
                data: () => item,
                ref: {
                  id: item.id,
                  update: jest.fn().mockImplementation(async (patch: any) => {
                    Object.assign(item, patch);
                  }),
                },
              })),
            })),
          };
          return chain;
        }),
        get: jest.fn().mockImplementation(async () => {
          const list = mockDbStore[colName] || [];
          return {
            empty: list.length === 0,
            size: list.length,
            docs: list.map((item: any) => ({
              id: item.id,
              data: () => item,
              ref: {
                id: item.id,
                update: jest.fn().mockImplementation(async (patch: any) => {
                  Object.assign(item, patch);
                }),
              },
            })),
          };
        }),
      }),
    };
  };

  beforeEach(() => {
    Object.keys(mockDbStore).forEach((key) => {
      mockDbStore[key] = [];
    });
  });

  describe("1. Student Edit & Relational Sync", () => {
    it("provisions an initial fee record and verifies section roster on student creation", async () => {
      const mockDb = createMockDb();
      const mockRepo: any = {
        db: mockDb,
        findByRollNumber: jest.fn().mockResolvedValue(null),
        save: jest.fn().mockImplementation(async (doc: any) => {
          const id = `stu_${Date.now()}`;
          const saved = { ...doc, id };
          mockDbStore.students.push(saved);
          return saved;
        }),
      };

      const studentService = new StudentService(mockRepo);

      const created = await studentService.create(
        {
          fullName: "John Alexander",
          rollNumber: "101",
          classGrade: "Grade 5",
          section: "A",
          guardianName: "Alexander Senior",
          monthlyFee: 6500,
        },
        tenantId,
        userId
      );

      expect(created).toBeDefined();
      expect(mockDbStore.students.length).toBe(1);

      // Verify Initial Fee Provisioning
      const fees = mockDbStore.fees;
      expect(fees.length).toBe(1);
      expect(fees[0].studentName).toBe("John Alexander");
      expect(fees[0].amount).toBe(6500);
      expect(fees[0].amountPaid).toBe(0);
      expect(fees[0].status).toBe("Pending");
      expect(fees[0].classGrade).toBe("Grade 5");

      // Verify Section Roster Existence
      const sections = mockDbStore.sections;
      expect(sections.length).toBe(1);
      expect(sections[0].classGrade).toBe("Grade 5");
      expect(sections[0].sectionName).toBe("A");
    });

    it("updates student profile and atomically propagates changes to fees, attendance, and marks", async () => {
      const mockDb = createMockDb();
      const studentId = "stu-sync-01";

      // Seed student
      const initialStudent = {
        id: studentId,
        tenantId,
        fullName: "Original Student",
        rollNumber: "10",
        classGrade: "Grade 4",
        section: "A",
        guardianName: "Original Guardian",
        status: "active",
      };
      mockDbStore.students.push(initialStudent);

      // Seed dependent module records
      mockDbStore.fees.push({
        id: "fee-1",
        tenantId,
        studentId,
        studentName: "Original Student",
        classGrade: "Grade 4",
        rollNumber: 10,
        amount: 5000,
        amountPaid: 0,
        status: "Pending",
      });

      mockDbStore.attendance.push({
        id: "att-1",
        tenantId,
        studentId,
        studentName: "Original Student",
        classGrade: "Grade 4",
        section: "A",
        rollNumber: "10",
        date: "2026-11-01",
        status: "Present",
      });

      mockDbStore.marks.push({
        id: "mark-1",
        tenantId,
        studentId,
        studentName: "Original Student",
        classGrade: "Grade 4",
        section: "A",
        rollNumber: "10",
        subject: "Mathematics",
        marksObtained: 85,
        totalMarks: 100,
      });

      const mockRepo: any = {
        db: mockDb,
        findById: jest.fn().mockImplementation(async (id: string) => {
          return mockDbStore.students.find((s) => s.id === id) || null;
        }),
        update: jest.fn().mockImplementation(async (id: string, updates: any) => {
          const idx = mockDbStore.students.findIndex((s) => s.id === id);
          if (idx >= 0) {
            mockDbStore.students[idx] = { ...mockDbStore.students[idx], ...updates };
          }
        }),
      };

      const studentService = new StudentService(mockRepo);

      // Execute Student Edit
      const updated = await studentService.update(
        tenantId,
        studentId,
        {
          fullName: "Updated Student VIP",
          rollNumber: "99",
          classGrade: "Grade 5",
          section: "B",
          guardianName: "Updated Guardian",
        },
        userId
      );

      expect(updated).toBeDefined();

      // Verify Student Persistence
      const persistedStudent = mockDbStore.students.find((s) => s.id === studentId);
      expect(persistedStudent?.fullName).toBe("Updated Student VIP");
      expect(persistedStudent?.rollNumber).toBe("99");
      expect(persistedStudent?.classGrade).toBe("Grade 5");
      expect(persistedStudent?.section).toBe("B");

      // Verify Cascading Relational Sync in Fees
      const feeDoc = mockDbStore.fees[0];
      expect(feeDoc.studentName).toBe("Updated Student VIP");
      expect(feeDoc.classGrade).toBe("Grade 5");
      expect(feeDoc.rollNumber).toBe(99);

      // Verify Cascading Relational Sync in Attendance
      const attDoc = mockDbStore.attendance[0];
      expect(attDoc.studentName).toBe("Updated Student VIP");
      expect(attDoc.classGrade).toBe("Grade 5");
      expect(attDoc.section).toBe("B");
      expect(attDoc.rollNumber).toBe("99");

      // Verify Cascading Relational Sync in Marks / Exam Results
      const markDoc = mockDbStore.marks[0];
      expect(markDoc.studentName).toBe("Updated Student VIP");
      expect(markDoc.classGrade).toBe("Grade 5");
      expect(markDoc.section).toBe("B");
      expect(markDoc.rollNumber).toBe("99");
    });
  });

  describe("2. Teacher Edit & Allocation Sync", () => {
    it("updates teacher profile and propagates class teacher name to assigned classes and linked user", async () => {
      const mockDb = createMockDb();
      const teacherId = "stf-teacher-01";
      const teacherEmail = "teacher.sarah@school.edu";

      // Seed teacher
      mockDbStore.staff.push({
        id: teacherId,
        tenantId,
        personal: { fullName: "Sarah Jenkins" },
        contact: { email: teacherEmail, mobile: "+92 300 1111111" },
        professional: { designation: "Teacher", department: "Science", personnelNo: "STF-001" },
        academic: { classesAssigned: ["Grade 5"], sectionAssignment: "A" },
        payroll: { basicSalary: 45000 },
        status: "active",
      });

      // Seed linked section in sections collection
      mockDbStore.sections.push({
        id: "sec-grade5-a",
        tenantId,
        classGrade: "Grade 5",
        sectionName: "A",
        classTeacherId: teacherId,
        classTeacherName: "Sarah Jenkins",
        incharge: "Sarah Jenkins",
      });

      // Seed linked user in users collection
      mockDbStore.users.push({
        id: "usr-sarah-01",
        tenantId,
        staffId: teacherId,
        email: teacherEmail,
        displayName: "Sarah Jenkins",
        role: "teacher",
      });

      const mockRepo: any = {
        db: mockDb,
        findById: jest.fn().mockImplementation(async (id: string) => {
          return mockDbStore.staff.find((s) => s.id === id) || null;
        }),
        update: jest.fn().mockImplementation(async (id: string, updates: any) => {
          const idx = mockDbStore.staff.findIndex((s) => s.id === id);
          if (idx >= 0) {
            mockDbStore.staff[idx] = { ...mockDbStore.staff[idx], ...updates };
          }
        }),
      };

      const staffService = new StaffService(mockRepo);

      // Execute Teacher Update (Promotion & Name change)
      await staffService.update(
        tenantId,
        teacherId,
        {
          fullName: "Dr. Sarah Jenkins Ph.D",
          designation: "Senior Science Head",
          classesAssigned: ["Grade 5", "Grade 6"],
          sectionAssignment: "A",
          basicSalary: 65000,
        },
        userId
      );

      // Verify Staff document
      const updatedStaff = mockDbStore.staff.find((s) => s.id === teacherId);
      expect(updatedStaff.personal.fullName).toBe("Dr. Sarah Jenkins Ph.D");

      // Verify Section & Class Allocation Sync
      const sectionDoc = mockDbStore.sections.find((sec) => sec.id === "sec-grade5-a");
      expect(sectionDoc.classTeacherName).toBe("Dr. Sarah Jenkins Ph.D");
      expect(sectionDoc.incharge).toBe("Dr. Sarah Jenkins Ph.D");

      // Verify User Account Sync
      const userDoc = mockDbStore.users.find((u) => u.staffId === teacherId);
      expect(userDoc.displayName).toBe("Dr. Sarah Jenkins Ph.D");
    });
  });

  describe("3. School Configuration Edit & Module Seeding/Sync", () => {
    it("updates tenant profile and seeds canonical fee structures and exam terms", async () => {
      const mockDb = createMockDb();

      // Seed tenant
      mockDbStore.tenants.push({
        id: tenantId,
        name: "Old Academy",
        currency: "USD",
      });

      const mockConfigRepo: any = {
        db: mockDb,
        getConfiguration: jest.fn().mockResolvedValue({
          id: "current",
          tenantId,
          version: { number: 1 },
          features: {},
          academic: { classes: [], sectionNames: ["A"] },
          school: { name: "Old Academy", type: "Private", country: "PK" },
          metadata: { academicYearId: "ay-2026" },
        }),
        publishConfiguration: jest.fn().mockImplementation(async (_tId: string, cfg: any) => {
          mockDbStore.configurations.push(cfg);
        }),
      };

      const mockHealthService: any = {
        checkHealth: jest.fn().mockResolvedValue({
          diagnostics: { tenantValid: true },
        }),
      };

      const mockProvisioningService: any = {
        provisionFromConfiguration: jest.fn().mockResolvedValue({
          academicYearId: "ay-2026-2027",
          sectionsCreated: 4,
          departmentsCreated: 2,
        }),
      };

      const mockCache: any = {
        invalidateConfiguration: jest.fn(),
        setConfiguration: jest.fn(),
      };

      const configService = new ConfigurationService(
        mockConfigRepo,
        mockCache,
        mockHealthService,
        mockProvisioningService
      );

      // Execute Save & Publish School Configuration
      await configService.saveAndPublishConfiguration(
        {
          schoolProfile: {
            name: "EduPilot Horizon International",
            type: "Private",
            curriculumId: "oxford",
            boardName: "Federal Board",
            country: "PK",
            sections: ["A", "B"],
          },
          academicStructure: {
            levels: ["primary", "secondary"],
            grades: [
              { name: "Grade 1", levelId: "primary", schemeOfStudy: { subjects: [{ name: "English" }] } },
              { name: "Grade 2", levelId: "primary", schemeOfStudy: { subjects: [{ name: "Math" }] } },
            ],
            allSubjects: [{ name: "English" }, { name: "Math" }],
          },
          currency: "PKR",
          feeCategories: ["Tuition Fee", "Admission Fee", "Computer Lab Fee"],
          examTerms: ["Mid-Term 2026", "Final Term 2027"],
        } as any,
        tenantId,
        userId,
        "admin"
      );

      // Verify Tenant Profile Synchronization
      const updatedTenant = mockDbStore.tenants.find((t) => t.id === tenantId);
      expect(updatedTenant.name).toBe("EduPilot Horizon International");
      expect(updatedTenant.currency).toBe("PKR");
      expect(updatedTenant.academicYear).toBe("ay-2026-2027");

      // Verify Canonical Fee Structures Seeding
      const feeStructures = mockDbStore.fee_structures;
      expect(feeStructures.length).toBeGreaterThanOrEqual(3);
      expect(feeStructures.some((f) => f.name === "Tuition Fee")).toBe(true);
      expect(feeStructures.some((f) => f.name === "Admission Fee")).toBe(true);

      // Verify Canonical Exam Terms Seeding
      const examTerms = mockDbStore.exam_terms;
      expect(examTerms.length).toBeGreaterThanOrEqual(2);
      expect(examTerms.some((e) => e.name === "Mid-Term 2026")).toBe(true);
      expect(examTerms.some((e) => e.name === "Final Term 2027")).toBe(true);
    });
  });

  describe("4. UI Edit Controls Verification", () => {
    it("renders Edit Student modal with pre-populated input controls", () => {
      const mockStudent = {
        id: "stu-ui-01",
        fullName: "Emma Watson",
        rollNumber: "42",
        classGrade: "Grade 5",
        section: "A",
        guardianName: "Chris Watson",
        guardianPhone: "+92 300 9999999",
        monthlyFee: 7500,
      };

      const html = renderToString(
        React.createElement(EditStudentModal, {
          isOpen: true,
          onClose: jest.fn(),
          student: mockStudent,
        })
      );

      expect(html).toContain("Edit Student Profile");
      expect(html).toContain("Save &amp; Sync Student");
      expect(html).toContain("Emma Watson");
      expect(html).toContain("42");
      expect(html).toContain("7500");
    });

    it("renders Edit Staff modal with pre-populated fields and role selectors", () => {
      const mockStaff = {
        id: "stf-ui-01",
        fullName: "Robert Vance",
        email: "robert@school.edu",
        designation: "Senior Teacher",
        department: "Mathematics",
        basicSalary: 60000,
      };

      const html = renderToString(
        React.createElement(EditStaffModal, {
          isOpen: true,
          onClose: jest.fn(),
          staff: mockStaff,
        })
      );

      expect(html).toContain("Edit Staff Member");
      expect(html).toContain("Save &amp; Sync Staff");
      expect(html).toContain("Robert Vance");
      expect(html).toContain("Senior Teacher");
    });

    it("renders Edit Configuration control in PageHeader when school is configured", () => {
      const html = renderToString(
        React.createElement(PageHeader, {
          isConfigured: true,
          onEdit: jest.fn(),
        })
      );

      expect(html).toContain("Edit Configuration");
      expect(html).toContain("School Configuration");
    });
  });
});
