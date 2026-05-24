// lib/validation/fees.schema.ts
import { z } from "zod";

export const CreateFeeSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  studentName: z.string().optional(),
  rollNumber: z.number().optional(),
  classGrade: z.string().optional(),
  feeMonth: z.string().min(1, "Fee month is required"),
  amountPaid: z.number().positive("Amount must be greater than 0"),
  paymentMethod: z.enum(["Cash", "Bank Transfer", "Online / JazzCash"]).default("Cash"),
  remarks: z.string().optional(),
});

export const UpdateFeeSchema = CreateFeeSchema.partial();

export const FeeQuerySchema = z.object({
  studentId: z.string().optional(),
  month: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});
