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

  constructor() {
    this.provider = new GeminiProvider();
    this.usageTracker = new UsageTracker();
  }

  async generateTimetable(req: TimetableRequest, tenantId?: string, userId?: string): Promise<any[]> {
    const prompt = `
      Generate a valid JSON array representing a weekly school timetable. Do not include any other text, explanation, or markdown formatting such as \`\`\`json.

      Requirements:
      - Classes: ${req.classes.join(", ")}
      - Days: ${req.days.join(", ")}
      - Periods per day: ${req.periods}
      - Subjects: ${req.subjects.join(", ")}
      - Teachers: ${req.teachers.join(", ")}

      Each entry must have exactly these keys: "day", "period", "subject", "class", "teacher".
      The period should be a number (e.g., 1, 2, 3...).
      Ensure the JSON is valid and complete. Return ONLY the JSON array.
    `;

    const startTime = Date.now();
    const response = await this.provider.generateContent(prompt);
    const text = response.text;
    try {
      const timetable = JSON.parse(text.replace(/```json|```/g, "").trim());
      if (!Array.isArray(timetable) || timetable.length === 0) {
        throw new Error("Empty or invalid timetable");
      }

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
