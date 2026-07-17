// validators/staff/OCRValidator.ts
import { z } from "zod";

export const OCRFileSchema = z.object({
  mimeType: z.enum([
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "application/pdf",
  ]),
  size: z.number().max(4_000_000, "File must be under 4MB"),
  extension: z.enum(["png", "jpg", "jpeg", "webp", "pdf"]),
});

export const OCRExtractedSchema = z.object({
  fullName: z.string().optional().default(""),
  fatherName: z.string().optional().default(""),
  cnic: z.string().optional().default(""),
  dob: z.string().optional().default(""),
  designation: z.string().optional().default(""),
  personnelNo: z.string().optional().default(""),
  bps: z.string().optional().default(""),
  basicSalary: z.string().optional().default(""),
  grossPay: z.string().optional().default(""),
  netPay: z.string().optional().default(""),
  accountNumber: z.string().optional().default(""),
  bankName: z.string().optional().default(""),
});

export type OCRFileInput = z.infer<typeof OCRFileSchema>;
export type OCRExtracted = z.infer<typeof OCRExtractedSchema>;
