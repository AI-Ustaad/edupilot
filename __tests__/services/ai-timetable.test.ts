import { TimetableService } from "@/services/ai/timetable.service";
import { CreateTimetableEntrySchema } from "@/validators/timetable/TimetableValidator";

describe("AI TimetableService Schema Alignment (DEF-016)", () => {
  it("normalizes output to include classGrade and string period conforming to CreateTimetableEntrySchema", async () => {
    let capturedPrompt = "";

    const mockProvider = {
      name: "gemini",
      getConfig: () => ({ model: "gemini-2.5-flash" }),
      isAvailable: () => true,
      generateContent: jest.fn().mockImplementation(async (prompt: string) => {
        capturedPrompt = prompt;
        return {
          text: JSON.stringify([
            {
              day: "Monday",
              period: 1, // number from legacy format
              class: "Grade 10-A", // legacy key
              subject: "Physics",
              teacher: "Dr. Tariq",
            },
            {
              day: "Monday",
              period: "2",
              classGrade: "Grade 10-A",
              subject: "Chemistry",
              teacher: "Ms. Ayesha",
            },
          ]),
          tokensUsed: 42,
        };
      }),
    } as any;

    const mockUsageTracker = {
      checkQuota: jest.fn().mockResolvedValue(undefined),
      track: jest.fn().mockResolvedValue(undefined),
    } as any;

    const service = new TimetableService(mockProvider, mockUsageTracker);
    const result = await service.generateTimetable(
      {
        classes: ["Grade 10-A"],
        days: ["Monday", "Tuesday"],
        periods: 6,
        subjects: ["Physics", "Chemistry"],
        teachers: ["Dr. Tariq", "Ms. Ayesha"],
      },
      "tenant-alpha",
      "user-admin"
    );

    expect(capturedPrompt).toContain("classGrade");
    expect(result).toHaveLength(2);

    // Verify first entry normalization (converted period to string and added classGrade)
    expect(result[0].classGrade).toBe("Grade 10-A");
    expect(result[0].period).toBe("1");
    expect(() => CreateTimetableEntrySchema.parse(result[0])).not.toThrow();

    // Verify second entry
    expect(result[1].classGrade).toBe("Grade 10-A");
    expect(result[1].period).toBe("2");
    expect(() => CreateTimetableEntrySchema.parse(result[1])).not.toThrow();

    expect(mockUsageTracker.track).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: "tenant-alpha",
        userId: "user-admin",
        success: true,
      })
    );
  });
});

