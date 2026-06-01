import { generateContent } from "@/lib/ai/gemini";

interface ReportRequest {
  studentName: string;
  grade: string;
  subject: string;
  marks: number;
  attendance: number;
}

export class ReportService {
  async generateComment(req: ReportRequest): Promise<string> {
    const prompt = `
      You are a professional teacher. Write a brief, encouraging report card comment (2-3 sentences) for a ${req.grade} student named ${req.studentName} in ${req.subject}.
      The student scored ${req.marks}% and has ${req.attendance}% attendance.
      Keep the tone positive and constructive. Return only the comment text, no quotes or extra formatting.
    `;

    const text = await generateContent({ prompt, temperature: 0.7, maxOutputTokens: 200 });
    return text.trim();
  }
}
