// lib/validation/student.schema.ts
import { z } from "zod";

export const CreateStudentSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  fatherName: z.string().optional(),
  classGrade: z.string().min(1, "Class is required"),
  section: z.string().min(1, "Section is required"),
  rollNumber: z.number().int().positive(),
  cnic: z.string().regex(/^\d{5}-\d{7}-\d$/, "Invalid CNIC format").optional(),
  phone: z.string().regex(/^03\d{9}$/, "Invalid phone number").optional(),
  email: z.string().email().optional(),
});

export const UpdateStudentSchema = CreateStudentSchema.partial();
