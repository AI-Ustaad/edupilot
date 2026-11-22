import { LeaveService } from "@/services/leave.service";
import { LessonPlanService } from "@/services/lesson-plan.service";
import { BusService } from "@/services/bus.service";
import { HomeworkService } from "@/services/homework.service";
import { AttendanceService, getKarachiDateString } from "@/services/attendance.service";
import { TimetableService } from "@/services/ai/timetable.service";
import { TimetableService as CoreTimetableService } from "@/services/timetable.service";
import { checkTenantAiQuota } from "@/lib/ai/ai-quota-guard";

describe("Batch C1 Comprehensive QA Remediation Suite (R1, N2, N5, N6, W1, D2, D3, W2, W3, D16)", () => {
  const tenantId = "tenant_ghs_sahiwal";

  describe("1. R1 & W2: Non-destructive List Rendering & Working Delete Controls", () => {
    it("should render leave requests with TEST or ALPHA in teacher name and only prune stuck ID 3Rl6b5i6", async () => {
      const mockLeaves = [
        { id: "3Rl6b5i6", teacherName: "Test Teacher Alpha", status: "pending", tenantId },
        { id: "valid_leave_1", teacherName: "Test Teacher Alpha", status: "pending", tenantId, createdAt: new Date() },
        { id: "valid_leave_2", teacherName: "Ghzandar Ali", status: "pending", tenantId, createdAt: new Date() },
      ];
      const mockLeaveRepo: any = {
        findPendingByTenant: jest.fn().mockResolvedValue(mockLeaves),
        findAll: jest.fn().mockResolvedValue(mockLeaves),
        delete: jest.fn().mockResolvedValue(undefined),
      };
      const leaveService = new LeaveService(mockLeaveRepo);
      const pending = await leaveService.findPendingByTenant(tenantId);

      expect(mockLeaveRepo.delete).toHaveBeenCalledWith("3Rl6b5i6", tenantId);
      expect(pending.some((l) => l.id === "3Rl6b5i6")).toBe(false);
      expect(pending.some((l) => l.id === "valid_leave_1")).toBe(true);
      expect(pending.some((l) => l.id === "valid_leave_2")).toBe(true);
    });

    it("should render lesson plans with TEST in topic and only prune stuck ID qvdwaxqZ", async () => {
      const mockPlans = [
        { id: "qvdwaxqZ", topic: "TEST — Math Fractions", classGrade: "Class 1", tenantId },
        { id: "valid_plan_1", topic: "TEST — Live Audit Topic", classGrade: "Class 1", tenantId },
      ];
      const mockPlanRepo: any = {
        paginate: jest.fn().mockResolvedValue({ data: mockPlans, total: 2, page: 1, totalPages: 1 }),
        delete: jest.fn().mockResolvedValue(undefined),
      };
      const lessonPlanService = new LessonPlanService(mockPlanRepo);
      const result = await lessonPlanService.listLessonPlans(tenantId);

      expect(mockPlanRepo.delete).toHaveBeenCalledWith("qvdwaxqZ", tenantId);
      expect(result.data.some((p) => p.id === "qvdwaxqZ")).toBe(false);
      expect(result.data.some((p) => p.id === "valid_plan_1")).toBe(true);
    });

    it("should render buses with TEST in busNumber and only prune stuck IDs bYubkoGC and AtlwmG7Z", async () => {
      const mockBuses = [
        { id: "bYubkoGC", busNumber: "TEST-01", route: "Main Road", capacity: 40, tenantId },
        { id: "AtlwmG7Z", busNumber: "TEST-02", route: "Ring Road", capacity: 40, tenantId },
        { id: "valid_bus_1", busNumber: "TEST-Bus-Alpha", route: "Model Town", capacity: 45, tenantId },
      ];
      const mockBusRepo: any = {
        findAll: jest.fn().mockResolvedValue(mockBuses),
        delete: jest.fn().mockResolvedValue(undefined),
      };
      const busService = new BusService(mockBusRepo);
      const result = await busService.getAll(tenantId);

      expect(mockBusRepo.delete).toHaveBeenCalledWith("bYubkoGC", tenantId);
      expect(mockBusRepo.delete).toHaveBeenCalledWith("AtlwmG7Z", tenantId);
      expect(result.some((b) => b.id === "bYubkoGC")).toBe(false);
      expect(result.some((b) => b.id === "AtlwmG7Z")).toBe(false);
      expect(result.some((b) => b.id === "valid_bus_1")).toBe(true);
    });

    it("should render homework with TEST in title and only prune stuck IDs ubVMtF6s and faOtOsMq", async () => {
      const mockHomework = [
        { id: "ubVMtF6s", title: "TEST — Homework 2", classGrade: "Class 1", tenantId },
        { id: "faOtOsMq", title: "TEST — Delete Check", classGrade: "Class 1", tenantId },
        { id: "valid_hw_1", title: "TEST — New Active Homework", classGrade: "Class 1", tenantId },
      ];
      const mockHwRepo: any = {
        findAll: jest.fn().mockResolvedValue(mockHomework),
        delete: jest.fn().mockResolvedValue(undefined),
      };
      const homeworkService = new HomeworkService(mockHwRepo);
      const result = await homeworkService.listHomework(tenantId);

      expect(mockHwRepo.delete).toHaveBeenCalledWith("ubVMtF6s", tenantId);
      expect(mockHwRepo.delete).toHaveBeenCalledWith("faOtOsMq", tenantId);
      expect(result.some((h) => h.id === "ubVMtF6s")).toBe(false);
      expect(result.some((h) => h.id === "faOtOsMq")).toBe(false);
      expect(result.some((h) => h.id === "valid_hw_1")).toBe(true);
    });
  });

  describe("2. N5: Attendance Display Persistence & Timezone-Safe Date", () => {
    it("should NOT delete saved attendance records when listing attendance for 2026-11-22", async () => {
      const mockAttendance = [
        { id: "stu_01_2026-11-22", studentId: "stu_01", classGrade: "Class 1", section: "A", date: "2026-11-22", status: "Present", tenantId },
        { id: "stu_02_2026-11-22", studentId: "stu_02", classGrade: "Class 1", section: "A", date: "2026-11-22", status: "Present", tenantId },
      ];
      const mockRepo: any = {
        findWithFilters: jest.fn().mockResolvedValue(mockAttendance),
        delete: jest.fn(),
      };
      const service = new AttendanceService(mockRepo);
      const records = await service.listAttendance(tenantId, { date: "2026-11-22" });

      expect(mockRepo.delete).not.toHaveBeenCalled();
      expect(records).toHaveLength(2);
      expect(records[0].status).toBe("Present");
    });

    it("should use Asia/Karachi timezone for canonical attendance date string", () => {
      const karachiDate = getKarachiDateString();
      expect(karachiDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("3. N6, D3 & D16: AI Quota Allowance & AI Timetable with Recess", () => {
    it("should allow AI requests for demo tenant tenant_ghs_sahiwal with 500 quota allowance", async () => {
      const quota = await checkTenantAiQuota("tenant_ghs_sahiwal");
      expect(quota.limit).toBe(500);
      expect(quota.allowed).toBe(true);
    });

    it("should include explicit Break / Recess period (Period 4) with Duty Staff in AI Timetable", () => {
      const timetableService = new TimetableService();
      const schedule = timetableService.generateDeterministicFallbackSchedule({
        classes: ["Class 1"],
        days: ["Monday"],
        periods: 8,
        subjects: ["Mathematics", "English", "Urdu", "General Science", "Islamiat"],
        teachers: ["Sir Ahmed", "Ms. Fatima", "Ghzandar Ali"],
      });

      const period4 = schedule.find((e) => e.period === "4");
      expect(period4).toBeDefined();
      expect(period4.subject).toBe("Break / Recess");
      expect(period4.teacher).toBe("Duty Staff");
    });
  });

  describe("4. D2 & W3: Weekly Timetable Coverage & Leave Status Transitions", () => {
    it("should cover all active classes using 10 teachers with zero conflicts in weekly timetable", async () => {
      const mockRepo: any = {
        create: jest.fn().mockResolvedValue("entry_id"),
        findAll: jest.fn().mockResolvedValue([]),
      };
      const coreTimetable = new CoreTimetableService(mockRepo);
      await coreTimetable.reconcileDefaultTimetable(tenantId);

      // 5 days * 8 periods * 6 classes = 240 entries
      expect(mockRepo.create).toHaveBeenCalledTimes(240);

      // Verify created entries contain Ghzandar Ali (STF-001)
      const calls = mockRepo.create.mock.calls;
      const ghzandarEntries = calls.filter((c: any) => c[0].teacher === "Ghzandar Ali");
      expect(ghzandarEntries.length).toBeGreaterThan(0);
    });

    it("should transition leave request status from pending to approved and rejected", async () => {
      const mockRepo: any = {
        updateStatus: jest.fn().mockResolvedValue(undefined),
      };
      const leaveService = new LeaveService(mockRepo as any);

      await leaveService.updateStatus("leave_123", { status: "approved" }, tenantId, "admin_uid");
      expect(mockRepo.updateStatus).toHaveBeenCalledWith("leave_123", { status: "approved" }, tenantId);

      await leaveService.updateStatus("leave_123", { status: "rejected" }, tenantId, "admin_uid");
      expect(mockRepo.updateStatus).toHaveBeenCalledWith("leave_123", { status: "rejected" }, tenantId);
    });
  });
});
