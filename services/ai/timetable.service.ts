import { GeminiProvider } from "@/lib/ai/providers/GeminiProvider";
import { UsageTracker } from "@/lib/ai/monitoring/UsageTracker";
import type { IAITimetableService } from "@/interfaces/IAITimetableService";

interface TimetableRequest {
  classes: string[];
  days: string[];
  periods: number;
  subjects: string[];
  teachers: string[];
}

export class TimetableService implements IAITimetableService {
  private provider: GeminiProvider;
  private usageTracker: UsageTracker;

  constructor(provider?: GeminiProvider, usageTracker?: UsageTracker) {
    this.provider = provider ?? new GeminiProvider();
    this.usageTracker = usageTracker ?? new UsageTracker();
  }

  async generateTimetable(req: TimetableRequest, tenantId?: string, userId?: string): Promise<any[]> {
    if (tenantId) {
      await this.usageTracker.checkQuota(tenantId);
    }
    const prompt = `
      Generate a valid JSON array representing a weekly school timetable. Do not include any other text, explanation, or markdown formatting such as \`\`\`json.

      Requirements:
      - Classes: ${req.classes.join(", ")}
      - Days: ${req.days.join(", ")}
      - Periods per day: ${req.periods}
      - Subjects: ${req.subjects.join(", ")}
      - Teachers: ${req.teachers.join(", ")}

      Each entry must have exactly these keys: "day", "period", "subject", "classGrade", "teacher".
      The period should be a string representing the period (e.g., "1", "2", "3...").
      Ensure the JSON is valid and complete. Return ONLY the JSON array.
    `;

    const startTime = Date.now();
    const response = await this.provider.generateContent(
      prompt,
      undefined,
      undefined,
      { responseMimeType: "application/json" }
    );
    const text = response.text;
    try {
      let cleaned = text.trim();
      const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        cleaned = codeBlockMatch[1].trim();
      } else {
        cleaned = cleaned.replace(/```json|```/g, "").trim();
      }

      // If array is surrounded by extraneous text, isolate array bounds
      const firstBracket = cleaned.indexOf("[");
      const lastBracket = cleaned.lastIndexOf("]");
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        cleaned = cleaned.slice(firstBracket, lastBracket + 1);
      }

      const parsed = JSON.parse(cleaned);
      const list = Array.isArray(parsed) ? parsed : (parsed.timetable || parsed.entries || parsed.items || []);
      if (!Array.isArray(list) || list.length === 0) {
        throw new Error("Empty or invalid timetable");
      }

      // Normalize entries to strictly adhere to CreateTimetableEntrySchema (DEF-016)
      const timetable = list.map((entry: any) => ({
        ...entry,
        classGrade: String(entry.classGrade || entry.class || ""),
        class: String(entry.class || entry.classGrade || ""),
        period: String(entry.period ?? ""),
        subject: String(entry.subject ?? ""),
        teacher: String(entry.teacher ?? ""),
        day: String(entry.day ?? ""),
      }));

      if (tenantId && userId) {
        await this.usageTracker.track({
          tenantId,
          userId,
          provider: this.provider.name,
          model: this.provider.getConfig().model,
          tokens: response.tokensUsed ?? 0,
          latencyMs: Date.now() - startTime,
          success: true,
          documentType: "timetable-generation",
        });
      }

      return timetable;
    } catch (e) {
      if (tenantId && userId) {
        await this.usageTracker.track({
          tenantId,
          userId,
          provider: this.provider.name,
          model: this.provider.getConfig().model,
          tokens: 0,
          latencyMs: Date.now() - startTime,
          success: false,
          documentType: "timetable-generation",
        });
      }
      throw new Error("Failed to parse AI response: " + text.substring(0, 100));
    }
  }
}
