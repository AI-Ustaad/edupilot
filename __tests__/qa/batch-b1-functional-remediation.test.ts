// __tests__/qa/batch-b1-functional-remediation.test.ts
import { VideoLectureService } from "@/services/video-lecture.service";
import { HomeworkService } from "@/services/homework.service";
import { LeaveService } from "@/services/leave.service";
import { ConfigurationService } from "@/services/configuration.service";
import { TimetableService as AITimetableService } from "@/services/ai/timetable.service";
import { ROLE_PERMISSIONS } from "@/lib/auth/roles";
import { createHomeworkSchema } from "@/lib/validation/homework.schema";
import { CANONICAL_SUBJECTS } from "@/lib/utils/formatClassLabel";

describe("Batch B1 Functional Defects Remediation", () => {
  const tenantId = "tenant_ghs_sahiwal";
  const userId = "user_admin_01";

  // 1. N2: Video Lectures Upload, Delete & Permissions
  describe("N2: Video Lectures Management", () => {
    it("should ensure admin and teacher roles have videoLectures.delete permission", () => {
      expect(ROLE_PERMISSIONS.admin).toContain("videoLectures.delete");
      expect(ROLE_PERMISSIONS.teacher).toContain("videoLectures.delete");
    });

    it("should delete video lecture and log video.deleted audit event", async () => {
      const mockRepo = {
        create: jest.fn().mockResolvedValue("video-123"),
        findById: jest.fn().mockResolvedValue({
          id: "video-123",
          title: "Math Lecture 1",
          classGrade: "Class 10",
          subject: "Mathematics",
          videoUrl: "https://example.com/math.mp4",
          tenantId,
        }),
        findAll: jest.fn().mockResolvedValue([]),
        delete: jest.fn().mockResolvedValue(undefined),
      };
      const service = new VideoLectureService(mockRepo as any);
      const auditSpy = jest.spyOn((service as any).audit, "log").mockResolvedValue(undefined);

      await service.delete("video-123", tenantId, userId);

      expect(mockRepo.delete).toHaveBeenCalledWith("video-123", tenantId);
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "video.deleted",
          entityId: "video-123",
          entityType: "video",
          tenantId,
        })
      );
    });
  });

  // 2. N1 & W2: Homework Validation, Sorting, and Module Deletions
  describe("N1 & W2: Homework Visibility & Content Deletions", () => {
    it("should allow homework creation without dueDate (empty string allowed)", () => {
      const validWithoutDate = {
        title: "Algebra Exercises Chapter 1",
        description: "Complete questions 1 to 15 on page 42",
        classGrade: "Class 10",
        section: "A",
        subject: "Mathematics",
        dueDate: "",
      };
      const result = createHomeworkSchema.safeParse(validWithoutDate);
      expect(result.success).toBe(true);
    });

    it("should sort homework newest first and filter stuck test homework", async () => {
      const mockRepo = {
        findAll: jest.fn().mockResolvedValue([
          { id: "h1", title: "Older Homework", createdAt: "2026-11-20T10:00:00.000Z", tenantId },
          { id: "faOtOsMq", title: "TEST — Delete Check", createdAt: "2026-11-22T08:31:00.000Z", tenantId },
          { id: "h2", title: "Newer Homework", createdAt: "2026-11-22T09:00:00.000Z", tenantId },
        ]),
        delete: jest.fn().mockResolvedValue(undefined),
        create: jest.fn(),
        findById: jest.fn(),
      };
      const service = new HomeworkService(mockRepo as any);

      const list = await service.listHomework(tenantId);

      expect(list.length).toBe(2);
      expect(list[0].id).toBe("h2"); // Newest first
      expect(list[1].id).toBe("h1");
      expect(mockRepo.delete).toHaveBeenCalledWith("faOtOsMq", tenantId);
    });

    it("should ensure admin and teacher have delete permissions for all content modules", () => {
      const modules = [
        "homework.delete",
        "assignments.delete",
        "quizzes.delete",
        "lessonPlans.delete",
        "videoLectures.delete",
      ];
      modules.forEach((perm) => {
        expect(ROLE_PERMISSIONS.admin).toContain(perm);
        expect(ROLE_PERMISSIONS.teacher).toContain(perm);
      });
    });

    it("should log leave.deleted audit event when leave request is deleted", async () => {
      const mockLeaveRepo = {
        delete: jest.fn().mockResolvedValue(undefined),
        findPendingByTenant: jest.fn().mockResolvedValue([]),
        create: jest.fn(),
        updateStatus: jest.fn(),
      };
      const mockStaffRepo = { findById: jest.fn() };
      const mockAudit = { log: jest.fn().mockResolvedValue(undefined) };

      const service = new LeaveService(mockLeaveRepo as any, mockStaffRepo as any, mockAudit as any);
      await service.deleteLeave("leave-999", tenantId, userId);

      expect(mockLeaveRepo.delete).toHaveBeenCalledWith("leave-999", tenantId);
      expect(mockAudit.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "leave.deleted",
          entityId: "leave-999",
          entityType: "leave",
          tenantId,
        })
      );
    });
  });

  // 3. W1: OCR Admission Unblocked
  describe("W1: OCR Admission Quota Check Decoupling", () => {
    it("should verify OCR route does not invoke checkStudentQuota on document extraction", async () => {
      const fs = require("fs");
      const ocrRouteContent = fs.readFileSync("app/api/v1/students/ocr-admission/route.ts", "utf-8");
      // Must not contain checkStudentQuota call in the handler
      expect(ocrRouteContent).not.toMatch(/await checkStudentQuota\(/);
    });
  });

  // 4. N3: School Setup Identity Reconciled
  describe("N3: School Setup Canonical Profile", () => {
    it("should resolve canonical school name, type, and board for Government High School Sahiwal", async () => {
      const mockRepo = {
        getConfiguration: jest.fn().mockResolvedValue(null),
        saveConfiguration: jest.fn(),
        db: {
          collection: jest.fn().mockReturnValue({
            doc: jest.fn().mockReturnValue({
              get: jest.fn().mockResolvedValue({
                exists: true,
                data: () => ({
                  name: "Government High School Sahiwal",
                  type: "Government",
                  boardName: "Punjab Government (PCTB)",
                  country: "PK",
                }),
              }),
            }),
            where: jest.fn().mockReturnValue({
              get: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
            }),
          }),
        },
      };
      const mockCache = { getConfiguration: jest.fn().mockResolvedValue(null), setConfiguration: jest.fn() };
      const mockHealth = { checkHealth: jest.fn().mockResolvedValue({ status: "CONFIGURED", diagnostics: {} }) };

      const service = new ConfigurationService(mockRepo as any, mockCache as any, mockHealth as any);
      const viewModel = await service.getConfigurationViewModel(tenantId);

      expect(viewModel?.schoolName).toBe("Government High School Sahiwal");
      expect(viewModel?.schoolType).toBe("Government");
      expect(viewModel?.boardName).toBe("Punjab Government (PCTB)");
      expect(viewModel?.schoolName).not.toContain("Test Secondary School");
      expect(viewModel?.schoolName).not.toContain("EduPilot QA");
    });
  });

  // 5. D2 & D3: AI Timetable Generator Break / Recess Guarantee
  describe("D2 & D3: Timetable Recess & Conflict-Free Teachers", () => {
    it("should include Period 4 as Break / Recess in deterministic timetable schedule", () => {
      const service = new AITimetableService();
      const schedule = service.generateDeterministicFallbackSchedule({
        classes: ["Class 10"],
        days: ["Monday", "Tuesday"],
        periods: 8,
        subjects: CANONICAL_SUBJECTS,
        teachers: ["Sir Ahmed", "Ms. Fatima", "ghzandar Ali"],
      });

      const period4Entries = schedule.filter((e) => e.period === "4");
      expect(period4Entries.length).toBeGreaterThan(0);
      period4Entries.forEach((entry) => {
        expect(entry.subject).toBe("Break / Recess");
        expect(entry.teacher).toBe("Duty Staff");
      });
    });
  });
});
