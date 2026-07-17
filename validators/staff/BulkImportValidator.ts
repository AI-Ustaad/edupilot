// validators/staff/BulkImportValidator.ts
import { z } from "zod";

export const BulkImportRowSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  fatherName: z.string().optional(),
  cnic: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  designation: z.string().min(1, "Designation is required"),
  personnelNo: z.string().optional(),
  department: z.string().optional(),
  basicSalary: z.number().min(0).optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
});

export const BulkImportFileSchema = z.object({
  rows: z.array(BulkImportRowSchema).min(1, "At least one row is required"),
});

export type BulkImportRow = z.infer<typeof BulkImportRowSchema>;
export type BulkImportFile = z.infer<typeof BulkImportFileSchema>;
