import { GeminiProvider } from "@/lib/ai/providers/GeminiProvider";
import { ExamService } from "@/services/ai/exam.service";
import { TimetableService } from "@/services/ai/timetable.service";

describe("GeminiProvider Response Mode and Temperature Config", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = "test-api-key";
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("defaults to natural language mode without responseMimeType when no option is provided", async () => {
    let capturedBody: any = null;

    global.fetch = jest.fn().mockImplementation(async (url: string, init: any) => {
      capturedBody = JSON.parse(init.body);
      return {
        ok: true,
        text: async () =>
          JSON.stringify({
            candidates: [{ content: { parts: [{ text: "Natural language response" }] } }],
            usageMetadata: { totalTokenCount: 20 },
          }),
      };
    }) as any;

    const provider = new GeminiProvider();
    const res = await provider.generateContent("Hello, write an essay");

    expect(res.text).toBe("Natural language response");
    expect(capturedBody).toBeDefined();
    // CRITICAL: responseMimeType MUST NOT be application/json by default
    expect(capturedBody.generationConfig.responseMimeType).toBeUndefined();
    expect(capturedBody.generationConfig.temperature).toBe(0.1);
  });

  it("passes responseMimeType application/json when explicitly requested by structured callers", async () => {
    let capturedBody: any = null;

    global.fetch = jest.fn().mockImplementation(async (url: string, init: any) => {
      capturedBody = JSON.parse(init.body);
      return {
        ok: true,
        text: async () =>
          JSON.stringify({
            candidates: [{ content: { parts: [{ text: "{\"result\": true}" }] } }],
            usageMetadata: { totalTokenCount: 15 },
          }),
      };
    }) as any;

    const provider = new GeminiProvider();
    const res = await provider.generateContent(
      "Extract JSON",
      undefined,
      undefined,
      { responseMimeType: "application/json", temperature: 0.2 }
    );

    expect(res.text).toBe("{\"result\": true}");
    expect(capturedBody).toBeDefined();
    expect(capturedBody.generationConfig.responseMimeType).toBe("application/json");
    expect(capturedBody.generationConfig.temperature).toBe(0.2);
  });

  it("ExamService invokes provider with application/json mode", async () => {
    const mockProvider = {
      name: "gemini",
      getConfig: () => ({ model: "gemini-2.5-flash" }),
      isAvailable: () => true,
      generateContent: jest.fn().mockResolvedValue({
        text: JSON.stringify({
          mcqs: [{ question: "Q1", options: ["A", "B"], correct: "A" }],
          shortAnswers: [],
          longAnswer: { question: "Q2", modelAnswer: "Ans" },
        }),
        tokensUsed: 50,
      }),
    } as any;

    const examService = new ExamService(mockProvider);
    await examService.generateExam({
      className: "Grade 10",
      subject: "Science",
      topic: "Physics",
      difficulty: "medium",
    });

    expect(mockProvider.generateContent).toHaveBeenCalledWith(
      expect.any(String),
      undefined,
      undefined,
      { responseMimeType: "application/json" }
    );
  });
});
