// lib/validation/staff.schema.ts
import { z } from "zod";

// Personal Information Schema
export const PersonalInfoSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  fatherName: z.string().optional(),
  cnic: z.string().regex(/^\d{5}-\d{7}-\d$/, "Invalid CNIC format (e.g., 12345-1234567-1)").optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional(),
  gender: z.enum(["Male", "Female", "Other"]).default("Male"),
  maritalStatus: z.enum(["Single", "Married", "Divorced", "Widowed"]).default("Single"),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().regex(/^03\d{9}$/, "Invalid Pakistani phone number").optional(),
  currentAddress: z.string().optional(),
  permanentAddress: z.string().optional(),
  emergencyContact: z.string().optional(),
  photo: z.string().optional(),
});

// Professional Information Schema
export const ProfessionalInfoSchema = z.object({
  personnelNo: z.string().min(1, "Employee ID is required"),
  doj: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional(),
  bps: z.string().optional(),
  empCategory: z.enum(["Active Permanent", "Contract", "Visiting", "Retired"]).default("Active Permanent"),
  designation: z.string().min(1, "Designation is required"),
  ddoCode: z.string().optional(),
  prevExperience: z.string().optional(),
  prevInstitution: z.string().optional(),
});

// Financial Information Schema
export const FinancialInfoSchema = z.object({
  bankName: z.string().optional(),
  accountNo: z.string().optional(),
  accountTitle: z.string().optional(),
  ntn: z.string().optional(),
});

// Allowance Schema
export const AllowanceSchema = z.object({
  name: z.string().min(1, "Allowance name is required"),
  amount: z.number().nonnegative("Amount must be zero or positive"),
});

// Deduction Schema
export const DeductionSchema = z.object({
  name: z.string().min(1, "Deduction name is required"),
  amount: z.number().nonnegative("Amount must be zero or positive"),
});

// Complete Staff Schema
export const CreateStaffSchema = z.object({
  personal: PersonalInfoSchema,
  professional: ProfessionalInfoSchema,
  financial: FinancialInfoSchema.optional(),
  education: z.array(z.object({
    level: z.string(),
    institute: z.string(),
    passingYear: z.string(),
    subjects: z.string(),
    document: z.string().optional(),
  })).optional(),
  allowances: z.array(AllowanceSchema).default([]),
  deductions: z.array(DeductionSchema).default([]),
});

export const UpdateStaffSchema = CreateStaffSchema.partial();
