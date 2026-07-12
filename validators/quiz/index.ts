// validators/quiz/index.ts
import { z } from "zod";

const QuizQuestionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  options: z.array(z.string()).min(2, "At least 2 options required"),
  correct: z.string().min(1, "Correct answer is required"),
});

export const CreateQuizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  classGrade: z.string().min(1, "Class is required"),
  section: z.string().min(1, "Section is required"),
  subject: z.string().optional().default(""),
  dueDate: z.string().nullable().optional(),
  questions: z.array(QuizQuestionSchema).min(1, "At least 1 question required"),
});
export type CreateQuizInput = z.infer<typeof CreateQuizSchema>;

export const SubmitQuizSchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
  studentId: z.string().min(1, "Student ID is required"),
  studentName: z.string().optional(),
  answers: z.array(z.object({
    selected: z.string(),
  })).min(1, "At least 1 answer required"),
});
export type SubmitQuizInput = z.infer<typeof SubmitQuizSchema>;
