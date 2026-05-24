// lib/validation/attendance.schema.ts
import { z } from "zod";

export const MarkAttendanceSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  studentName: z.string().optional(),
  rollNumber: z.number().optional(),
  classGrade: z.string().min(1, "Class is required"),
  section: z.string().min(1, "Section is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  status: z.enum(["Present", "Absent", "Leave"], {
    errorMap: () => ({ message: "Status must be Present, Absent, or Leave" }),
  }),
});

export const BulkAttendanceSchema = z.array(MarkAttendanceSchema).min(1, "At least one attendance record required");

export const GetAttendanceQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
  classGrade: z.string().optional(),
  section: z.string().optional(),
});
