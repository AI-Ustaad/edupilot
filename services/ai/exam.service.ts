import { GeminiProvider } from "@/lib/ai/providers/GeminiProvider";
import { UsageTracker } from "@/lib/ai/monitoring/UsageTracker";
import { logger } from "@/lib/logger/logger";

interface ExamRequest { className: string; subject: string; topic: string; difficulty: string; }
interface ExamOutput { mcqs: { question: string; options: string[]; correct: string }[]; shortAnswers: { question: string; modelAnswer: string }[]; longAnswer: { question: string; modelAnswer: string }; }

export class ExamService {
  private provider: GeminiProvider;
  private usageTracker: UsageTracker;

  constructor(provider?: GeminiProvider) {
    this.provider = provider ?? new GeminiProvider();
    this.usageTracker = new UsageTracker();
  }

  async generateExam(req: ExamRequest, tenantId?: string, userId?: string): Promise<ExamOutput> {
    logger.info("[ExamService] Generating exam", { metadata: { className: req.className, subject: req.subject, topic: req.topic, difficulty: req.difficulty } });
    const startTime = Date.now();

    const prompt = `Generate 5 multiple-choice questions (MCQs), 2 short answer questions, and 1 long answer question for a ${req.className} class in subject "${req.subject}" on the topic "${req.topic}" at difficulty level "${req.difficulty}".
Return the result as a valid JSON object with this structure:
{
  "mcqs": [{ "question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correct": "A" }],
  "shortAnswers": [{ "question": "...", "modelAnswer": "..." }],
  "longAnswer": { "question": "...", "modelAnswer": "..." }
}
Only return the JSON, no other text.`;

    const response = await this.provider.generateContent(prompt);
    const text = response.text;
    let exam: ExamOutput;
    try {
      exam = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch (e) {
      logger.error("[ExamService] Failed to parse AI response", { metadata: { error: e, responsePreview: text.substring(0, 200) } });
      throw new Error("Failed to parse AI response");
    }

    const elapsed = Date.now() - startTime;
    logger.info("[ExamService] Exam generated successfully", { metadata: { elapsedMs: elapsed, mcqCount: exam.mcqs?.length || 0 } });

    if (tenantId && userId) {
      await this.usageTracker.track({
        tenantId,
        userId,
        provider: this.provider.name,
        model: this.provider.getConfig().model,
        tokens: response.tokensUsed ?? 0,
        latencyMs: elapsed,
        success: true,
        documentType: "exam-generation",
      });
    }

    return exam;
  }
}
