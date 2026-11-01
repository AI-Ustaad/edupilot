import { MarksService } from "@/services/marks.service";
import { sendEmail } from "@/lib/email";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";

jest.mock("@/lib/email", () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/lib/events", () => ({
  eventBus: {
    publish: jest.fn().mockResolvedValue(undefined),
  },
}));

describe("MarksService Roll Numbers & Parent Email Resolution (DEF-014, DEF-015)", () => {
  let mockMarksRepo: any;
  let mockStudentRepo: any;
  let mockParentsRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockMarksRepo = {
      findWithFilters: jest.fn(),
    };

    mockStudentRepo = {
      batchFindByIds: jest.fn(),
    };

    mockParentsRepo = {
      findById: jest.fn(),
    };
  });

  describe("getAggregatedResults() (DEF-015)", () => {
    it("resolves and populates true student roll numbers instead of hardcoding '-'", async () => {
      mockMarksRepo.findWithFilters.mockResolvedValue([
        {
          id: "m1",
          studentId: "s-1",
          studentName: "Ayaan Ahmed",
          subject: "Math",
          marksObtained: 85,
          totalMarks: 100,
        },
        {
          id: "m2",
          studentId: "s-1",
          studentName: "Ayaan Ahmed",
          subject: "English",
          marksObtained: 90,
          totalMarks: 100,
        },
        {
          id: "m3",
          studentId: "s-2",
          studentName: "Sara Khan",
          subject: "Math",
          marksObtained: 95,
          totalMarks: 100,
        },
      ]);

      mockStudentRepo.batchFindByIds.mockResolvedValue([
        { id: "s-1", fullName: "Ayaan Ahmed", rollNumber: "R-101" },
        { id: "s-2", fullName: "Sara Khan", rollNumber: 102 },
      ]);

      const service = new MarksService(mockMarksRepo, mockStudentRepo, mockParentsRepo);
      const results = await service.getAggregatedResults("tenant-1", "Grade 10", "A", "Midterm 2026");

      expect(results).toHaveLength(2);
      expect(mockStudentRepo.batchFindByIds).toHaveBeenCalledWith("tenant-1", ["s-1", "s-2"]);

      const ayaan = results.find(r => r.studentId === "s-1");
      const sara = results.find(r => r.studentId === "s-2");

      expect(ayaan?.rollNumber).toBe("R-101");
      expect(sara?.rollNumber).toBe(102);
      expect(ayaan?.rollNumber).not.toBe("-");
    });
  });

  describe("publishResults() (DEF-014)", () => {
    it("resolves parent email from ParentsRepository using primaryParentId", async () => {
      mockMarksRepo.findWithFilters.mockResolvedValue([
        { id: "m1", studentId: "s-1", subject: "Math" },
        { id: "m2", studentId: "s-2", subject: "Math" },
      ]);

      mockStudentRepo.batchFindByIds.mockResolvedValue([
        {
          id: "s-1",
          fullName: "Ayaan Ahmed",
          primaryParentId: "parent-doc-1",
        },
        {
          id: "s-2",
          fullName: "Sara Khan",
          primaryParentId: null,
          parentEmail: "sara.mom@example.com",
        },
      ]);

      mockParentsRepo.findById.mockImplementation(async (id: string, tenantId: string) => {
        if (id === "parent-doc-1") {
          return { id: "parent-doc-1", name: "Ahmed Sr.", email: "ahmed.sr@example.com" };
        }
        return null;
      });

      const service = new MarksService(mockMarksRepo, mockStudentRepo, mockParentsRepo);
      const result = await service.publishResults(
        {
          classGrade: "Grade 10",
          section: "A",
          term: "Midterm 2026",
        },
        "tenant-1",
        "admin-user"
      );

      expect(result.students).toBe(2);
      expect(result.emailsSent).toBe(2);

      expect(sendEmail).toHaveBeenCalledWith(
        "ahmed.sr@example.com",
        expect.stringContaining("Midterm 2026"),
        expect.stringContaining("Ayaan Ahmed")
      );

      expect(sendEmail).toHaveBeenCalledWith(
        "sara.mom@example.com",
        expect.stringContaining("Midterm 2026"),
        expect.stringContaining("Sara Khan")
      );

      expect(eventBus.publish).toHaveBeenCalledWith(
        EVENTS.RESULT_PUBLISHED,
        expect.objectContaining({
          tenantId: "tenant-1",
          classGrade: "Grade 10",
          term: "Midterm 2026",
          studentCount: 2,
        }),
        "tenant-1"
      );
    });
  });
});

