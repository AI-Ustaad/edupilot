import { z } from "zod";

export const CreateAttendanceSchema = z.object({
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
  metadata: z.object({
    version: z.number().default(1),
    source: z.string().optional(),
  }).optional(),
});

export type CreateAttendanceDTO = z.infer<typeof CreateAttendanceSchema>;
