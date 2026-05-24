// lib/validation/auth.schema.ts
import { z } from "zod";

export const RegisterSchoolSchema = z.object({
  schoolName: z.string().min(3, "School name must be at least 3 characters"),
  phone: z.string().regex(/^03\d{9}$/, "Invalid Pakistani phone number").optional(),
});

export const CreateUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "teacher", "accountant", "parent"]).default("teacher"),
  fullName: z.string().min(2, "Name is required").optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
