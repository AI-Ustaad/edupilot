// services/quiz.service.ts
import { QuizRepository } from "@/repositories/quiz.repository";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";
import { CreateQuizSchema, SubmitQuizSchema } from "@/validators/quiz";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";
import type { IQuizRepository } from "@/interfaces/IQuizRepository";
import type { Quiz } from "@/types/quiz";
import type { IQuizService } from "@/interfaces/IQuizService";

export class QuizService implements IQuizService {
  private audit: AuditService;
  private validation: ValidationService;

  constructor(private repo: IQuizRepository = new QuizRepository()) {
    this.audit = new AuditService();
    this.validation = new ValidationService();
  }

  async createQuiz(data: unknown, tenantId: string, userId: string): Promise<Quiz> {
    const parsed = this.validation.validateOrThrow(CreateQuizSchema, data);

    const createData: Omit<Quiz, "id" | "createdAt" | "updatedAt"> = {
      ...parsed,
      tenantId,
      createdBy: userId,
    } as Omit<Quiz, "id" | "createdAt" | "updatedAt">;

    const id = await this.repo.create(createData, tenantId);
    const quiz = await this.repo.findById(id, tenantId);
    if (!quiz) throw new Error("Quiz created but could not be retrieved");

    await this.audit.log({
      action: "quiz.created",
      userId,
      tenantId,
      entityId: id,
      entityType: "quiz",
      metadata: { title: parsed.title, classGrade: parsed.classGrade, subject: parsed.subject },
    });

    await eventBus.publish(EVENTS.QUIZ_CREATED, {
      tenantId,
      quizId: id,
      title: parsed.title,
      classGrade: parsed.classGrade,
      createdBy: userId,
    }, tenantId);

    return quiz as Quiz;
  }

  async listQuizzes(tenantId: string): Promise<(Quiz & { id: string })[]> {
    return this.repo.findAll(tenantId);
  }

  async getQuizById(id: string, tenantId: string): Promise<(Quiz & { id: string }) | null> {
    return this.repo.findById(id, tenantId);
  }

  async submitQuiz(data: unknown, tenantId: string, userId: string): Promise<{
    id: string;
    correct: number;
    total: number;
    percentage: number;
  }> {
    const parsed = this.validation.validateOrThrow(SubmitQuizSchema, data);

    // Load quiz
    const quiz = await this.repo.findById(parsed.quizId, tenantId);
    if (!quiz) throw new Error("Quiz not found");

    const questions = quiz.questions || [];

    // Auto-grading
    let correct = 0;
    const gradedAnswers = parsed.answers.map((ans, idx) => {
      const question = questions[idx];
      const isCorrect = question && question.correct === ans.selected;
      if (isCorrect) correct++;
      return { selected: ans.selected, correct: isCorrect };
    });

    const total = questions.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    const submissionId = await this.repo.createSubmission({
      quizId: parsed.quizId,
      studentId: parsed.studentId,
      studentName: parsed.studentName || "Unknown",
      answers: gradedAnswers,
      correct,
      total,
      percentage,
      submittedBy: userId,
      tenantId,
    }, tenantId);

    await this.audit.log({
      action: "quiz.submitted",
      userId,
      tenantId,
      entityId: submissionId,
      entityType: "quiz_submission",
      metadata: { quizId: parsed.quizId, studentId: parsed.studentId, percentage },
    });

    await eventBus.publish(EVENTS.QUIZ_SUBMITTED, {
      tenantId,
      quizId: parsed.quizId,
      studentId: parsed.studentId,
      submissionId,
      percentage,
    }, tenantId);

    return { id: submissionId, correct, total, percentage };
  }

  async deleteQuiz(id: string, tenantId: string): Promise<void> {
    await this.repo.delete(id, tenantId);
    await this.audit.log({
      action: "quiz.deleted",
      userId: "system",
      tenantId,
      entityId: id,
      entityType: "quiz",
    });

    await eventBus.publish(EVENTS.QUIZ_DELETED, {
      tenantId,
      quizId: id,
    }, tenantId);
  }

  async getSubmissions(quizId: string, tenantId: string) {
    return this.repo.findSubmissionsByQuiz(quizId, tenantId);
  }
}
