// interfaces/IQuizRepository.ts
import type { Quiz, QuizSubmission } from "@/types/quiz";

export interface IQuizRepository {
  findAll(tenantId: string): Promise<(Quiz & { id: string })[]>;
  findById(id: string, tenantId: string): Promise<(Quiz & { id: string }) | null>;
  create(data: Omit<Quiz, "id" | "createdAt" | "updatedAt">, tenantId: string): Promise<string>;
  delete(id: string, tenantId: string): Promise<void>;
  count(tenantId: string): Promise<number>;
  exists(id: string, tenantId: string): Promise<boolean>;
  findSubmissionsByQuiz(quizId: string, tenantId: string): Promise<(QuizSubmission & { id: string })[]>;
  createSubmission(data: Omit<QuizSubmission, "id" | "createdAt">, tenantId: string): Promise<string>;
}
