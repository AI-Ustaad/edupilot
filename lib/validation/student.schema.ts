import { z } from "zod";

export const createStudentSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  fatherName: z.string().optional(),
  classGrade: z.string().min(1, "Class is required"),
  section: z.string().optional(),
  
  // 🔥 Fix: rollNumber کو optional بنایا اور NaN ہونے کی صورت میں undefined کر دیا
  rollNumber: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().int().positive("Roll number must be a positive integer").optional()),
  
  cnic: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
