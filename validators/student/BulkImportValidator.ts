// validators/student/BulkImportValidator.ts
import { z } from "zod";

export const BulkImportRowSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  fatherName: z.string().optional().default("N/A"),
  classGrade: z.string().min(1, "Class is required"),
  section: z.string().optional().default("A"),
  rollNumber: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().int().positive().optional()),
  cnic: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  email: z.string().email().optional().or(z.literal("")),
});

export const BulkImportFileSchema = z.object({
  rows: z.array(BulkImportRowSchema).min(1, "At least one row is required"),
});

export type BulkImportRow = z.infer<typeof BulkImportRowSchema>;
export type BulkImportFile = z.infer<typeof BulkImportFileSchema>;
