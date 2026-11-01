import { AdmissionsService } from "@/services/AdmissionsService";
import { StudentService } from "@/services/StudentService";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";

jest.mock("@/lib/events", () => ({
  eventBus: {
    publish: jest.fn().mockResolvedValue(undefined),
    subscribe: jest.fn(),
  },
}));

describe("Student Admissions, Promotion & Creation Events (DEF-013, DEF-017, DEF-018)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("AdmissionsService.approve()", () => {
    it("emits ADMISSION_APPROVED and STUDENT_ENROLLED events with studentData and userId", async () => {
      const mockRepo = {
        update: jest.fn().mockResolvedValue(undefined),
        findById: jest.fn().mockResolvedValue({
          id: "stud-100",
          fullName: "Bilal Tariq",
          classGrade: "Grade 5",
          section: "B",
          admissionNumber: "ADM-501",
          rollNumber: "501",
        }),
      } as any;

      const admissionsService = new AdmissionsService(mockRepo);
      await admissionsService.approve("tenant-123", "stud-100", "admin-user");

      expect(mockRepo.update).toHaveBeenCalledWith(
        "stud-100",
        expect.objectContaining({ admissionStatus: "approved", updatedBy: "admin-user" }),
        "tenant-123"
      );

      expect(eventBus.publish).toHaveBeenCalledWith(
        EVENTS.ADMISSION_APPROVED,
        expect.objectContaining({
          tenantId: "tenant-123",
          studentId: "stud-100",
          studentData: expect.objectContaining({
            fullName: "Bilal Tariq",
            classGrade: "Grade 5",
            section: "B",
          }),
          approvedBy: "admin-user",
          userId: "admin-user",
        }),
        "tenant-123"
      );

      expect(eventBus.publish).toHaveBeenCalledWith(
        EVENTS.STUDENT_ENROLLED,
        expect.objectContaining({
          tenantId: "tenant-123",
          studentId: "stud-100",
          studentData: expect.objectContaining({
            fullName: "Bilal Tariq",
            classGrade: "Grade 5",
            section: "B",
          }),
          approvedBy: "admin-user",
          userId: "admin-user",
        }),
        "tenant-123"
      );
    });
  });

  describe("StudentService.promote()", () => {
    it("persists academicYear in bulkUpdate and emits STUDENT_PROMOTED event", async () => {
      const mockRepo = {
        batchFindByIds: jest.fn().mockResolvedValue([
          { id: "s1", tenantId: "tenant-123" },
          { id: "s2", tenantId: "tenant-123" },
        ]),
        bulkUpdate: jest.fn().mockResolvedValue(undefined),
      } as any;

      const studentService = new StudentService(mockRepo);
      const res = await studentService.promote(
        "tenant-123",
        ["s1", "s2"],
        "Grade 6",
        "A",
        "2026-2027",
        "principal-user"
      );

      expect(res.success).toBe(true);
      expect(res.promoted).toBe(2);

      expect(mockRepo.bulkUpdate).toHaveBeenCalledWith(
        "tenant-123",
        ["s1", "s2"],
        expect.objectContaining({
          classGrade: "Grade 6",
          section: "A",
          academicYear: "2026-2027",
          updatedBy: "principal-user",
        })
      );

      expect(eventBus.publish).toHaveBeenCalledWith(
        EVENTS.STUDENT_PROMOTED,
        expect.objectContaining({
          tenantId: "tenant-123",
          studentIds: ["s1", "s2"],
          newClass: "Grade 6",
          newClassGrade: "Grade 6",
          newSection: "A",
          academicYear: "2026-2027",
          promotedBy: "principal-user",
          userId: "principal-user",
        }),
        "tenant-123"
      );
    });
  });

  describe("StudentService.create()", () => {
    it("emits STUDENT_CREATED event with userId", async () => {
      const mockRepo = {
        findByRollNumber: jest.fn().mockResolvedValue(null),
        save: jest.fn().mockImplementation(async (doc) => ({ id: "s-new-1", ...doc })),
      } as any;

      const studentService = new StudentService(mockRepo);
      const result = await studentService.create(
        {
          identity: {
            rollNumber: "101",
          },
          personal: {
            firstName: "Hamza",
            lastName: "Khan",
            gender: "Male",
          },
          academic: {
            campusId: "campus-main",
            classId: "Grade 1",
            sectionId: "A",
            admissionDate: "2026-01-01",
          },
          parentReferences: {
            primaryParentId: null,
          },
        } as any,
        "tenant-123",
        "registrar-user"
      );

      expect(result).toBeDefined();
      expect(eventBus.publish).toHaveBeenCalledWith(
        EVENTS.STUDENT_CREATED,
        expect.objectContaining({
          tenantId: "tenant-123",
          userId: "registrar-user",
          studentData: expect.objectContaining({
            fullName: "Hamza Khan",
            classGrade: "Grade 1",
          }),
        }),
        "tenant-123"
      );
    });
  });
});
