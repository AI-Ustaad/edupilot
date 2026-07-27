// interfaces/IAIExamService.ts
export interface IAIExamService {
  generateExam(req: { className: string; subject: string; topic: string; difficulty: string }, tenantId?: string, userId?: string): Promise<{ mcqs: { question: string; options: string[]; correct: string }[]; shortAnswers: { question: string; modelAnswer: string }[]; longAnswer: { question: string; modelAnswer: string } }>;
}
