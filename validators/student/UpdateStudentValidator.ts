// validators/student/UpdateStudentValidator.ts
import { z } from "zod";

export const UpdateStudentSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  classGrade: z.string().min(1, "Class is required").optional(),
  section: z.string().optional(),
  rollNumber: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().int().positive("Roll number must be a positive integer").optional()),
  cnic: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  religion: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  academicYear: z.string().optional(),
  previousClass: z.string().optional(),
  previousSection: z.string().optional(),
  teacherComment: z.string().optional(),
});

export type UpdateStudentInput = z.infer<typeof UpdateStudentSchema>;
