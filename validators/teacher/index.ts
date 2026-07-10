// validators/teacher/index.ts
import { z } from "zod";

// ─── Assignment Validators ────────────────────────────────────
export const CreateAssignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().default(""),
  classGrade: z.string().min(1, "Class/Grade is required"),
  section: z.string().min(1, "Section is required"),
  subject: z.string().min(1, "Subject is required"),
  dueDate: z.string().nullable().optional(),
});
export type CreateAssignmentInput = z.infer<typeof CreateAssignmentSchema>;

export const UpdateAssignmentSchema = CreateAssignmentSchema.partial();
export type UpdateAssignmentInput = z.infer<typeof UpdateAssignmentSchema>;

// ─── Lesson Plan Validators ───────────────────────────────────
export const CreateLessonPlanSchema = z.object({
  date: z.string().min(1, "Date is required"),
  topic: z.string().min(1, "Topic is required"),
  objective: z.string().min(1, "Objective is required"),
  materials: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});
export type CreateLessonPlanInput = z.infer<typeof CreateLessonPlanSchema>;

export const UpdateLessonPlanSchema = CreateLessonPlanSchema.partial();
export type UpdateLessonPlanInput = z.infer<typeof UpdateLessonPlanSchema>;

// ─── Book Validators ──────────────────────────────────────────
export const CreateBookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().optional(),
  subject: z.string().optional(),
  classGrade: z.string().optional(),
  isbn: z.string().optional(),
  publisher: z.string().optional(),
  description: z.string().optional(),
});
export type CreateBookInput = z.infer<typeof CreateBookSchema>;

export const UpdateBookSchema = CreateBookSchema.partial();
export type UpdateBookInput = z.infer<typeof UpdateBookSchema>;

// ─── Behavior Validators ──────────────────────────────────────
export const RecordBehaviorSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  points: z.number(),
  reason: z.string().min(1, "Reason is required"),
});
export type RecordBehaviorInput = z.infer<typeof RecordBehaviorSchema>;
