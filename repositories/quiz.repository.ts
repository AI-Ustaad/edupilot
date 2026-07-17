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
    const snapshot = await this.db
      .collection("quiz_submissions")
      .where("quizId", "==", quizId)
      .where("tenantId", "==", tenantId)
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as QuizSubmission & { id: string }));
  }

  async createSubmission(data: Omit<QuizSubmission, "id" | "createdAt">, _tenantId: string): Promise<string> {
    const docRef = await this.db.collection("quiz_submissions").add({
      ...data,
      createdAt: dbTimestamp,
    });
    return docRef.id;
  }
}
