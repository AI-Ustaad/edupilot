import { generateContent } from "@/lib/ai/gemini";

interface TimetableRequest {
  classes: string[];
  days: string[];
  periods: number;
  subjects: string[];
  teachers: string[];
}

export class TimetableService {
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

    const text = await generateContent({ prompt, temperature: 0.2, maxOutputTokens: 2048 });
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
