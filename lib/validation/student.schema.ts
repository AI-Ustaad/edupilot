import { z } from "zod";

export const createStudentSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  fatherName: z.string().optional(),
  classGrade: z.string().min(1, "Class is required"),
  // 🔥 section optional → real-world schools often skip sections
  section: z.string().optional(),
  // 🔥 coerce سے string خودکار number میں تبدیل ہو جائے گا
  rollNumber: z.coerce.number().int().positive("Roll number must be a positive integer"),
  cnic: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
