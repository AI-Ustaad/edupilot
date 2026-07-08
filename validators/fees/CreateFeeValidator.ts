// validators/fees/CreateFeeValidator.ts
import { z } from "zod";

export const CreateFeeSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  studentName: z.string().optional(),
  email: z.string().email().optional().nullable(),
  rollNumber: z.number().optional(),
  classGrade: z.string().optional(),
  feeMonth: z.string().min(1, "Fee month is required"),
  amountPaid: z.number().positive("Amount must be greater than 0"),
  paymentMethod: z.enum(["Cash", "Bank Transfer", "Online / JazzCash"]).default("Cash"),
  remarks: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.string().optional(),
});

export type CreateFeeInput = z.infer<typeof CreateFeeSchema>;

export const UpdateFeeSchema = CreateFeeSchema.partial();
export type UpdateFeeInput = z.infer<typeof UpdateFeeSchema>;
