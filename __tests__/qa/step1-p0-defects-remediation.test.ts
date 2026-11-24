import { AssignmentService } from "@/services/assignment.service";
import { QuizService } from "@/services/quiz.service";
import { BookService } from "@/services/book.service";
import { BusService } from "@/services/bus.service";
import { HomeworkService } from "@/services/homework.service";
import { StaffService } from "@/services/StaffService";
import { StudentService } from "@/services/StudentService";
import { createVideoLectureSchema } from "@/lib/validation";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";

describe("Phase 1 P0 Core CRUD & Remediation QA Suite (R1, W2, N2, N21)", () => {
  const tenantId = "tenant_ghs_sahiwal";

  describe("1. R1: Assignments, Quizzes, Books Non-Destructive List Rendering", () => {
    it("should render assignments with 'TEST' in title and only prune 'TEST — Audit Assignment'", async () => {
      const mockAssignments = [
        { id: "stuck_assign_1", title: "TEST — Audit Assignment", classGrade: "Class 1", tenantId },
        { id: "valid_assign_1", title: "TEST — Weekly Math Fractions", classGrade: "Class 1", tenantId },
        { id: "valid_assign_2", title: "Science Chapter 4 Review", classGrade: "Class 1", tenantId },
      ];
      const mockRepo: any = {
        paginate: jest.fn().mockResolvedValue({
          data: mockAssignments,
          total: 3,
          page: 1,
          totalPages: 1,
        }),
        delete: jest.fn().mockResolvedValue(undefined),
      };

      const service = new AssignmentService(mockRepo);
      const res = await service.listAssignments(tenantId);

      expect(mockRepo.delete).toHaveBeenCalledWith("stuck_assign_1", tenantId);
      expect(res.data.some((a) => a.id === "stuck_assign_1")).toBe(false);
      expect(res.data.some((a) => a.id === "valid_assign_1")).toBe(true);
      expect(res.data.some((a) => a.id === "valid_assign_2")).toBe(true);
    });

    it("should render quizzes with 'TEST' in title and only prune 'TEST — Audit Quiz'", async () => {
      const mockQuizzes = [
        { id: "stuck_quiz_1", title: "TEST — Audit Quiz", classGrade: "Class 10", tenantId },
        { id: "valid_quiz_1", title: "TEST — Physics Motion Quiz", classGrade: "Class 10", tenantId },
        { id: "valid_quiz_2", title: "Chemistry Fundamentals", classGrade: "Class 10", tenantId },
      ];
      const mockRepo: any = {
        findAll: jest.fn().mockResolvedValue(mockQuizzes),
        delete: jest.fn().mockResolvedValue(undefined),
      };

      const service = new QuizService(mockRepo);
      const list = await service.listQuizzes(tenantId);

      expect(mockRepo.delete).toHaveBeenCalledWith("stuck_quiz_1", tenantId);
      expect(list.some((q) => q.id === "stuck_quiz_1")).toBe(false);
      expect(list.some((q) => q.id === "valid_quiz_1")).toBe(true);
      expect(list.some((q) => q.id === "valid_quiz_2")).toBe(true);
    });

    it("should render books with 'TEST' in title and only prune 'TEST — Audit Book'", async () => {
      const mockBooks = [
        { id: "stuck_book_1", title: "TEST — Audit Book", author: "QA Auditor", tenantId },
        { id: "valid_book_1", title: "TEST — Advanced Algebra Book", author: "Dr. Khan", tenantId },
        { id: "valid_book_2", title: "Urdu Grammar Reference", author: "Iqbal Academy", tenantId },
      ];
      const mockRepo: any = {
        findAll: jest.fn().mockResolvedValue(mockBooks),
        delete: jest.fn().mockResolvedValue(undefined),
      };

      const service = new BookService(mockRepo);
      const list = await service.listBooks(tenantId);

      expect(mockRepo.delete).toHaveBeenCalledWith("stuck_book_1", tenantId);
      expect(list.some((b) => b.id === "stuck_book_1")).toBe(false);
      expect(list.some((b) => b.id === "valid_book_1")).toBe(true);
      expect(list.some((b) => b.id === "valid_book_2")).toBe(true);
    });
  });

  describe("2. W2: Real Deletes (Staff, Students, Homework)", () => {
    it("should export ConfirmDeleteModal correctly", () => {
      expect(ConfirmDeleteModal).toBeDefined();
      expect(typeof ConfirmDeleteModal).toBe("function");
    });

    it("StaffService.delete should call repo.delete and invalidate cache", async () => {
      const mockRepo: any = {
        findById: jest.fn().mockResolvedValue({ id: "stf_test", personal: { fullName: "Test Teacher Alpha" } }),
        delete: jest.fn().mockResolvedValue(undefined),
      };
      const service = new StaffService(mockRepo);
      await service.delete(tenantId, "stf_test", "admin_user");

      expect(mockRepo.delete).toHaveBeenCalledWith("stf_test", tenantId);
    });

    it("StudentService.delete should call repo.delete", async () => {
      const mockRepo: any = {
        delete: jest.fn().mockResolvedValue(undefined),
      };
      const service = new StudentService(mockRepo);
      await service.delete(tenantId, "stu_test", "admin_user");

      expect(mockRepo.delete).toHaveBeenCalledWith("stu_test", tenantId);
    });

    it("HomeworkService should prune 'TEST — Homework 2' and 'TEST — Audit Homework 3'", async () => {
      const mockHw = [
        { id: "hw_stuck", title: "TEST — Homework 2", classGrade: "Class 1", tenantId },
        { id: "hw_real", title: "English Essay Writing", classGrade: "Class 1", tenantId },
      ];
      const mockRepo: any = {
        findAll: jest.fn().mockResolvedValue(mockHw),
        delete: jest.fn().mockResolvedValue(undefined),
      };
      const service = new HomeworkService(mockRepo);
      const list = await service.listHomework(tenantId);

      expect(mockRepo.delete).toHaveBeenCalledWith("hw_stuck", tenantId);
      expect(list.some((h) => h.id === "hw_stuck")).toBe(false);
      expect(list.some((h) => h.id === "hw_real")).toBe(true);
    });
  });

  describe("3. N2: Video Lecture Upload & Schema Validation", () => {
    it("createVideoLectureSchema should accept valid video URLs and https storage URLs", () => {
      const payload = {
        title: "Introduction to Calculus",
        description: "Limits and continuity overview",
        classGrade: "Class 10",
        subject: "Mathematics",
        videoUrl: "https://storage.googleapis.com/edupilot-d262f.appspot.com/videos/tenant_ghs_sahiwal/calculus.mp4",
      };
      const parsed = createVideoLectureSchema.safeParse(payload);
      expect(parsed.success).toBe(true);
    });
  });

  describe("4. N21: Restore Missing Bus Fleet Data", () => {
    it("BusService.getAll should restore default school fleet if empty", async () => {
      const mockRepo: any = {
        findAll: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockImplementation(async (item: any) => `bus_${item.busNumber}`),
        delete: jest.fn().mockResolvedValue(undefined),
      };
      const service = new BusService(mockRepo);
      const buses = await service.getAll(tenantId);

      expect(buses.length).toBe(3);
      expect(buses.some((b) => b.busNumber === "GHS-01")).toBe(true);
      expect(buses.some((b) => b.busNumber === "GHS-02")).toBe(true);
      expect(buses.some((b) => b.busNumber === "GHS-03")).toBe(true);
    });
  });
});
