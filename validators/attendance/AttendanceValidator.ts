// validators/attendance/AttendanceValidator.ts
import { z } from "zod";

export const MarkAttendanceSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  studentName: z.string().optional(),
  rollNumber: z.number().optional(),
  classGrade: z.string().min(1, "Class is required"),
  section: z.string().min(1, "Section is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  status: z.enum(["Present", "Absent", "Leave", "Late", "HalfDay", "Holiday"], {
    errorMap: () => ({ message: "Status must be Present, Absent, Leave, Late, HalfDay, or Holiday" }),
  }),
  period: z.string().optional(),
  remarks: z.string().optional(),
  lateMinutes: z.number().int().min(0).optional(),
  approvedBy: z.string().optional(),
  leaveRequestId: z.string().optional(),
});

export type MarkAttendanceInput = z.infer<typeof MarkAttendanceSchema>;

export const BulkAttendanceSchema = z.array(MarkAttendanceSchema).min(1, "At least one attendance record required");

export const GetAttendanceQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
  classGrade: z.string().optional(),
  section: z.string().optional(),
  studentId: z.string().optional(),
  page: z.string().regex(/^\d+$/, "Page must be a number").optional(),
  limit: z.string().regex(/^\d+$/, "Limit must be a number").optional(),
});
