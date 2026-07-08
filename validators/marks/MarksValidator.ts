// validators/marks/MarksValidator.ts
import { z } from "zod";

export const SaveMarkSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  studentName: z.string().optional(),
  classGrade: z.string().min(1, "Class is required"),
  section: z.string().min(1, "Section is required"),
  term: z.string().min(1, "Term is required"),
  subject: z.string().min(1, "Subject is required"),
  marksObtained: z.number().min(0, "Marks obtained must be >= 0"),
  totalMarks: z.number().min(1, "Total marks must be >= 1"),
  percentage: z.number().min(0).max(100).optional(),
  grade: z.string().optional(),
  skills: z.record(z.number()).optional(),
});

export const BulkPublishSchema = z.object({
  classGrade: z.string().min(1, "Class is required"),
  section: z.string().min(1, "Section is required"),
  term: z.string().min(1, "Term is required"),
});

export const SkillsSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  term: z.string().min(1, "Term is required"),
  subject: z.string().min(1, "Subject is required"),
  skills: z.record(z.string(), z.number()).optional(),
});

export const GetMarksQuerySchema = z.object({
  classGrade: z.string().optional(),
  section: z.string().optional(),
  term: z.string().optional(),
  subject: z.string().optional(),
  studentId: z.string().optional(),
});

export type SaveMarkInput = z.infer<typeof SaveMarkSchema>;
export type BulkPublishInput = z.infer<typeof BulkPublishSchema>;
export type SkillsInput = z.infer<typeof SkillsSchema>;
