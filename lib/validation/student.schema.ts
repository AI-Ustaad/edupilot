// lib/validation/student.schema.ts
import { z } from 'zod';

export const createStudentSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  fatherName: z.string().optional(),
  classGrade: z.string().min(1, 'Class is required'),
  section: z.string().min(1, 'Section is required'),
  rollNumber: z.number().int().positive(),
  cnic: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
