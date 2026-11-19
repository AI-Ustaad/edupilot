import { z } from "zod";

export const CreateFeeSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  studentName: z.string().optional(),
  email: z.string().email().optional().nullable(),
  rollNumber: z.union([z.number(), z.string()]).optional(),
  classGrade: z.string().optional(),
  section: z.string().optional(),
  feeMonth: z.string().min(1, "Fee month is required"),
  amountPaid: z.number().positive("Amount must be greater than 0"),
  amount: z.number().optional(),
  amountDue: z.number().optional(),
  receiptNumber: z.string().optional(),
  paidAt: z.string().optional(),
  paymentMethod: z.enum(["Cash", "Bank Transfer", "Online / JazzCash"]).or(z.string()).default("Cash"),
  remarks: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.string().optional(),
  metadata: z.object({
    version: z.number().default(1),
    source: z.string().optional(),
  }).optional(),
});

export type CreateFeeDTO = z.infer<typeof CreateFeeSchema>;
