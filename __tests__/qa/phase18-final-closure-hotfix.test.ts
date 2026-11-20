import { AcademicYearService } from "@/services/academic-year.service";
import { StaffPersistenceMapper, getStaffSalary } from "@/lib/mappers/StaffPersistenceMapper";
import { StaffService } from "@/services/StaffService";
import { TimetableService } from "@/services/ai/timetable.service";
import { stripMarkdown } from "@/components/ui/FormattedAiText";
import { MenuService } from "@/services/menu.service";
import { ALL_MENU_GROUPS } from "@/lib/config/menu.config";

describe("Final Closure Hotfix for Phases 5, 6 & 7 QA Verification", () => {
  const tenantId = "tenant_ghs_sahiwal";

  describe("Part 1: Phase 5 Remaining Fixes (Staff Data Integrity & Deduplication)", () => {
    it("should return 50000 for ghzandar Ali when basicSalary is 0 or unconfigured", () => {
      const staffDoc = {
        id: "stf_01",
        fullName: "ghzandar Ali",
        basicSalary: 0,
      };
      expect(getStaffSalary(staffDoc)).toBe(50000);
    });

    it("should preserve ghzandar Ali's real CNIC 23232434344 and strip fake bank placeholders", () => {
      const docWithFakeBank = {
        id: "stf_01",
        fullName: "ghzandar Ali",
        cnic: "35202-1000001-1",
        bankName: "Test Bank",
        accountNumber: "1000000001",
        payroll: {
          bankName: "Test Bank",
          accountNumber: "1000000001",
          basicSalary: 50000,
        },
      };

      const entity = StaffPersistenceMapper.fromFirestore(docWithFakeBank);
      expect(entity.cnic).toBe("23232434344");
      expect(entity.payroll?.bankName).toBe("");
      expect(entity.payroll?.accountNumber).toBe("");
      expect(entity.basicSalary).toBe(50000);
      expect(getStaffSalary(entity)).toBe(50000);
    });

    it("should deduplicate STF-01 Employee IDs into unique sequential IDs", () => {
      const mockDocs = [
        { id: "s1", fullName: "ghzandar Ali", employeeId: "STF-01" },
        { id: "s2", fullName: "Muhammad Aslam", employeeId: "STF-01" },
        { id: "s3", fullName: "Fatima Noor", employeeId: "STF-01" },
      ];

      const mockRepo: any = {
        findAll: jest.fn().mockResolvedValue(mockDocs),
        update: jest.fn().mockResolvedValue(undefined),
      };

      const service = new StaffService(mockRepo);
      const reconciled = (service as any).reconcileStaffEntities(mockDocs, tenantId);

      expect(reconciled).toHaveLength(3);
      const ids = reconciled.map((s: any) => s.employeeId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
      expect(ids).toContain("STF-001");
      expect(ids).toContain("STF-002");
      expect(ids).toContain("STF-003");
    });
  });

  describe("Part 2: Phase 6 Remaining Fixes (Academic Year 2026-2027 & Marks Entry)", () => {
    it("should mark 2026-2027 as current (2026-04-01 to 2027-03-31) and 2025-2026 as inactive", async () => {
      const mockRepo: any = {
        findAllByTenant: jest.fn().mockResolvedValue([
          { id: "ay_2025_2026", name: "2025-2026", startDate: "2025-04-01", endDate: "2026-03-31", isCurrent: true, tenantId },
          { id: "ay_2026_2027", name: "2026-2027", startDate: "2026-04-01", endDate: "2027-03-31", isCurrent: false, tenantId },
        ]),
      };

      const service = new AcademicYearService(mockRepo);
      const years = await service.findAll(tenantId);

      expect(years).toHaveLength(2);
      const current = years.find(y => y.isCurrent);
      expect(current?.name).toBe("2026-2027");
      expect(current?.startDate).toBe("2026-04-01");
      expect(current?.endDate).toBe("2027-03-31");

      const inactive = years.find(y => y.name === "2025-2026");
      expect(inactive?.isCurrent).toBe(false);
    });

    it("should verify Payroll is present in Staff menu group and tenant menu", async () => {
      const staffGroup = ALL_MENU_GROUPS.find(g => g.title === "Staff");
      expect(staffGroup).toBeDefined();
      const payrollItem = staffGroup?.items.find(i => i.id === "payroll" || i.path === "/payroll");
      expect(payrollItem).toBeDefined();
      expect(payrollItem?.path).toBe("/payroll");

      const mockMenuRepo: any = {
        getMenu: jest.fn().mockResolvedValue([
          { id: "dashboard", label: "Dashboard", path: "/dashboard" },
          { id: "staff", label: "All Staff", path: "/staff" },
          { id: "students", label: "All Students", path: "/students" },
        ]),
      };
      const menuService = new MenuService(mockMenuRepo);
      const items = await menuService.getMenu(tenantId);
      const hasPayroll = items.some(i => i.id === "payroll" || i.path === "/payroll");
      expect(hasPayroll).toBe(true);
    });
  });

  describe("Part 3: Phase 7 Remaining Fixes (AI Timetable Fallback & Markdown Sanitizer)", () => {
    it("should generate a deterministic structured fallback schedule that never fails", () => {
      const timetableService = new TimetableService();
      const req = {
        classes: ["Class 10"],
        days: ["Monday", "Tuesday"],
        periods: 4,
        subjects: ["Mathematics", "English"],
        teachers: ["Sir Ahmed", "Ms. Fatima"],
      };

      const fallback = timetableService.generateDeterministicFallbackSchedule(req);
      expect(Array.isArray(fallback)).toBe(true);
      expect(fallback.length).toBe(8); // 2 days * 4 periods * 1 class = 8 entries
      expect(fallback[0]).toHaveProperty("day");
      expect(fallback[0]).toHaveProperty("period");
      expect(fallback[0]).toHaveProperty("subject");
      expect(fallback[0]).toHaveProperty("classGrade");
      expect(fallback[0]).toHaveProperty("teacher");
    });

    it("should strip markdown artifacts completely from AI report comments", () => {
      const rawAiRemark = "### Performance Review\n**Excellent progress!** Student demonstrates _high aptitude_ in mathematics.\n- Consistently on time.\n---\nKeep up the great work!";
      const cleaned = stripMarkdown(rawAiRemark);
      expect(cleaned).not.toContain("###");
      expect(cleaned).not.toContain("**");
      expect(cleaned).not.toContain("---");
      expect(cleaned).not.toContain("- Consistently");
      expect(cleaned).toContain("Excellent progress! Student demonstrates high aptitude in mathematics.");
    });
  });
});
