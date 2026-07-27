// interfaces/IQuizService.ts
import type { Quiz } from "@/types/quiz";

export interface IQuizService {
  createQuiz(data: unknown, tenantId: string, userId: string): Promise<Quiz>;
  listQuizzes(tenantId: string): Promise<(Quiz & { id: string })[]>;
  getQuizById(id: string, tenantId: string): Promise<(Quiz & { id: string }) | null>;
  submitQuiz(data: unknown, tenantId: string, userId: string): Promise<{ id: string; correct: number; total: number; percentage: number }>;
  deleteQuiz(id: string, tenantId: string): Promise<void>;
  getSubmissions(quizId: string, tenantId: string): Promise<any[]>;
}
