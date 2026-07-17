// validators/student/OCRValidator.ts
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
  dateOfBirth: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  classGrade: z.string().optional().default(""),
  rollNumber: z.string().optional().default(""),
  gender: z.string().optional().default(""),
  religion: z.string().optional().default(""),
  address: z.string().optional().default(""),
});

export type OCRFileInput = z.infer<typeof OCRFileSchema>;
export type OCRExtracted = z.infer<typeof OCRExtractedSchema>;
