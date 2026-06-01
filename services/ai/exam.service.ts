import { generateContent } from "@/lib/ai/gemini";

interface ExamRequest {
  className: string;
  subject: string;
  topic: string;
  difficulty: string;
}

interface ExamOutput {
  mcqs: { question: string; options: string[]; correct: string }[];
  shortAnswers: { question: string; modelAnswer: string }[];
  longAnswer: { question: string; modelAnswer: string };
}

export class ExamService {
  async generateExam(req: ExamRequest): Promise<ExamOutput> {
    const prompt = `Generate 5 multiple-choice questions (MCQs), 2 short answer questions, and 1 long answer question for a ${req.className} class in subject "${req.subject}" on the topic "${req.topic}" at difficulty level "${req.difficulty}".
Return the result as a valid JSON object with this structure:
{
  "mcqs": [{ "question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correct": "A" }],
  "shortAnswers": [{ "question": "...", "modelAnswer": "..." }],
  "longAnswer": { "question": "...", "modelAnswer": "..." }
}
Only return the JSON, no other text.`;

    const text = await generateContent({ prompt, temperature: 0.7, maxOutputTokens: 1500 });
    try {
      const exam = JSON.parse(text.replace(/```json|```/g, "").trim());
      return exam;
    } catch (e) {
      throw new Error("Failed to parse AI response");
    }
  }
}
