// validators/student/CreateStudentValidator.ts
import { z } from "zod";

export const CreateStudentSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  fatherName: z.string().optional().default(""),
  motherName: z.string().optional().default(""),
  classGrade: z.string().min(1, "Class is required"),
  section: z.string().optional().default("A"),
  rollNumber: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().int().positive("Roll number must be a positive integer").optional()),
  cnic: z.string().optional().default(""),
  dateOfBirth: z.string().optional().default(""),
  gender: z.enum(["Male", "Female", "Other"]).optional().default("Male"),
  religion: z.string().optional().default("Islam"),
  phone: z.string().optional().default(""),
  email: z.string().email().optional().or(z.literal("")).default(""),
  address: z.string().optional().default(""),
  academicYear: z.string().optional().default(""),
  previousClass: z.string().optional().default(""),
  previousSection: z.string().optional().default(""),
});

export type CreateStudentInput = z.infer<typeof CreateStudentSchema>;
