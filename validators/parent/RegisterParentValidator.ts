// validators/parent/RegisterParentValidator.ts
import { z } from "zod";

export const RegisterParentSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().optional().default(""),
  studentIds: z.array(z.string()).min(1, "At least one student ID is required"),
});

export type RegisterParentInput = z.infer<typeof RegisterParentSchema>;
