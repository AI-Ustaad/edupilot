// repositories/quiz.repository.ts
import { BaseRepository } from "./base.repository";
import { dbTimestamp } from "@/lib/firebase-admin";
import type { Quiz, QuizSubmission } from "@/types/quiz";
import type { IQuizRepository } from "@/interfaces/IQuizRepository";

export class QuizRepository extends BaseRepository<Quiz> implements IQuizRepository {
  constructor() {
    super("quizzes");
  }

  async findSubmissionsByQuiz(quizId: string, tenantId: string): Promise<(QuizSubmission & { id: string })[]> {
    try {
      const snapshot = await this.db
        .collection("quiz_submissions")
        .where("quizId", "==", quizId)
        .where("tenantId", "==", tenantId)
        .get();
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as QuizSubmission & { id: string }));
      return list.sort((a: any, b: any) => {
        const tA = new Date(a.createdAt || 0).getTime();
        const tB = new Date(b.createdAt || 0).getTime();
        return tB - tA;
      });
    } catch {
      return [];
    }
  }

  async createSubmission(data: Omit<QuizSubmission, "id" | "createdAt">, tenantId: string): Promise<string> {
    const docRef = await this.db.collection("quiz_submissions").add({
      ...data,
      tenantId,
      schoolId: tenantId,
      createdAt: dbTimestamp,
    });
    return docRef.id;
  }
}
