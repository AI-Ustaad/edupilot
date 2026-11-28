import { TimetableService } from "@/services/ai/timetable.service";

function mockProviderWith(text: string) {
  return {
    name: "gemini",
    getConfig: () => ({ model: "gemini-2.5-flash" }),
    isAvailable: () => true,
    generateContent: jest.fn().mockResolvedValue({ text, tokensUsed: 10 }),
  } as any;
}

const mockUsageTracker = {
  checkQuota: jest.fn().mockResolvedValue(undefined),
  track: jest.fn().mockResolvedValue(undefined),
} as any;

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

describe("AI Timetable N23 — subject selection respected, teachers matched to subjects", () => {
  it("fallback: English only generates ONLY English (plus breaks), never the other 10 subjects", () => {
    const service = new TimetableService(mockProviderWith("[]"), mockUsageTracker);
    const result = service.generateDeterministicFallbackSchedule({
      classes: ["Class 1"],
      days: DAYS,
      periods: 8,
      subjects: ["English"],
      teachers: ["Ghzandar Ali"],
    });

    // 5 days x 8 periods = 40 entries for one class
    expect(result).toHaveLength(40);
    const academic = result.filter((e) => e.subject !== "Break / Recess");
    expect(academic).toHaveLength(35);
    expect(new Set(academic.map((e) => e.subject))).toEqual(new Set(["English"]));
    expect(academic.every((e) => e.teacher === "Ghzandar Ali")).toBe(true);

    const breaks = result.filter((e) => e.subject === "Break / Recess");
    expect(breaks).toHaveLength(5);
    expect(breaks.every((e) => e.period === "4" && e.teacher === "Duty Staff")).toBe(true);
  });

  it("fallback: each subject is taught only by a teacher rostered for it", () => {
    const service = new TimetableService(mockProviderWith("[]"), mockUsageTracker);
    const result = service.generateDeterministicFallbackSchedule({
      classes: ["Class 1"],
      days: DAYS,
      periods: 8,
      subjects: ["English", "Mathematics"],
      teachers: ["Ghzandar Ali", "Iqra Qureshi"],
      teacherSubjects: {
        "Ghzandar Ali": ["English"],
        "Iqra Qureshi": ["Mathematics"],
      },
    });

    const academic = result.filter((e) => e.subject !== "Break / Recess");
    expect(academic.length).toBeGreaterThan(0);
    expect(new Set(academic.map((e) => e.subject))).toEqual(new Set(["English", "Mathematics"]));
    for (const entry of academic) {
      if (entry.subject === "English") expect(entry.teacher).toBe("Ghzandar Ali");
      if (entry.subject === "Mathematics") expect(entry.teacher).toBe("Iqra Qureshi");
    }
  });

  it("fallback: two classes at the same slot never share one teacher when two qualified teachers exist", () => {
    const service = new TimetableService(mockProviderWith("[]"), mockUsageTracker);
    const result = service.generateDeterministicFallbackSchedule({
      classes: ["Class 1", "Class 2"],
      days: ["Monday"],
      periods: 8,
      subjects: ["English"],
      teachers: ["Ghzandar Ali", "Iqra Qureshi"],
      teacherSubjects: {
        "Ghzandar Ali": ["English"],
        "Iqra Qureshi": ["English"],
      },
    });

    const academic = result.filter((e) => e.subject !== "Break / Recess");
    const bySlot = new Map<string, string[]>();
    for (const entry of academic) {
      const key = `${entry.day}|${entry.period}`;
      bySlot.set(key, [...(bySlot.get(key) || []), entry.teacher]);
    }
    for (const teachers of bySlot.values()) {
      expect(new Set(teachers).size).toBe(teachers.length);
    }
  });

  it("fallback: a single provided teacher still generates (last resort), and empty subjects keep the canonical default", () => {
    const service = new TimetableService(mockProviderWith("[]"), mockUsageTracker);
    const single = service.generateDeterministicFallbackSchedule({
      classes: ["Class 1"],
      days: ["Monday"],
      periods: 8,
      subjects: ["English", "Urdu"],
      teachers: ["Ghzandar Ali"],
    });
    expect(single).toHaveLength(8);
    expect(single.filter((e) => e.subject !== "Break / Recess").every((e) => e.teacher === "Ghzandar Ali")).toBe(true);

    const noSubjects = service.generateDeterministicFallbackSchedule({
      classes: ["Class 1"],
      days: DAYS,
      periods: 8,
      subjects: [],
      teachers: ["Ghzandar Ali"],
    });
    const subjectsSeen = new Set(noSubjects.map((e) => e.subject));
    expect(subjectsSeen.has("Physics")).toBe(true);
    expect(subjectsSeen.has("Break / Recess")).toBe(true);
  });

  it("AI path: prompt carries the subject->qualified-teacher map and output is repaired when the AI assigns the wrong teacher", async () => {
    let capturedPrompt = "";
    const provider = {
      name: "gemini",
      getConfig: () => ({ model: "gemini-2.5-flash" }),
      isAvailable: () => true,
      generateContent: jest.fn().mockImplementation(async (prompt: string) => {
        capturedPrompt = prompt;
        return {
          text: JSON.stringify([
            { day: "Monday", period: "1", classGrade: "Class 10", subject: "Physics", teacher: "Ghzandar Ali" },
            { day: "Monday", period: "2", classGrade: "Class 10", subject: "English", teacher: "Iqra Qureshi" },
            { day: "Monday", period: "4", classGrade: "Class 10", subject: "Physics", teacher: "Iqra Qureshi" },
          ]),
          tokensUsed: 10,
        };
      }),
    } as any;

    const service = new TimetableService(provider, mockUsageTracker);
    const result = await service.generateTimetable(
      {
        classes: ["Class 10"],
        days: ["Monday"],
        periods: 8,
        subjects: ["Physics", "English"],
        teachers: ["Ghzandar Ali", "Iqra Qureshi"],
        teacherSubjects: {
          "Ghzandar Ali": ["English"],
          "Iqra Qureshi": ["Physics"],
        },
      },
      "tenant-alpha",
      "user-admin"
    );

    expect(capturedPrompt).toContain("Physics: Iqra Qureshi");
    expect(capturedPrompt).toContain("English: Ghzandar Ali");
    // Physics period 1 was assigned to Ghzandar Ali by the AI — repaired to the rostered Physics teacher
    expect(result[0].subject).toBe("Physics");
    expect(result[0].teacher).toBe("Iqra Qureshi");
    // English period 2 was already correct — untouched
    expect(result[1].subject).toBe("English");
    expect(result[1].teacher).toBe("Ghzandar Ali");
    // Period 4 is a break: never a subject teacher
    expect(result[2].subject).toBe("Break / Recess");
    expect(result[2].teacher).toBe("Duty Staff");
  });

  it("AI path: without a roster map the AI output is left as-is (no repair, no crash)", async () => {
    const service = new TimetableService(
      mockProviderWith(
        JSON.stringify([
          { day: "Monday", period: "1", classGrade: "Class 10", subject: "Physics", teacher: "Ghzandar Ali" },
        ])
      ),
      mockUsageTracker
    );
    const result = await service.generateTimetable(
      {
        classes: ["Class 10"],
        days: ["Monday"],
        periods: 8,
        subjects: ["Physics"],
        teachers: ["Ghzandar Ali"],
      },
      "tenant-alpha",
      "user-admin"
    );
    expect(result).toHaveLength(1);
    expect(result[0].teacher).toBe("Ghzandar Ali");
  });
});
