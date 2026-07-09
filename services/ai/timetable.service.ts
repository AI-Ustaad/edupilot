import { GeminiProvider } from "@/lib/ai/providers/GeminiProvider";

interface TimetableRequest {
  classes: string[];
  days: string[];
  periods: number;
  subjects: string[];
  teachers: string[];
}

export class TimetableService {
  private provider: GeminiProvider;

  constructor() {
    this.provider = new GeminiProvider();
  }

  async generateTimetable(req: TimetableRequest): Promise<any[]> {
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

    const response = await this.provider.generateContent(prompt);
    const text = response.text;
    try {
      const timetable = JSON.parse(text.replace(/```json|```/g, "").trim());
      if (!Array.isArray(timetable) || timetable.length === 0) {
        throw new Error("Empty or invalid timetable");
      }
      return timetable;
    } catch (e) {
      throw new Error("Failed to parse AI response: " + text.substring(0, 100));
    }
  }
}
