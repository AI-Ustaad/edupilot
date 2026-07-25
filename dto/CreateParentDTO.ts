import { z } from "zod";

export const CreateParentSchema = z.object({
  userId: z.string().min(1, "User ID is required").optional(),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  studentIds: z.array(z.string()).min(1, "At least one student ID is required"),
  metadata: z.object({
    version: z.number().default(1),
    source: z.string().optional(),
  }).optional(),
});

export type CreateParentDTO = z.infer<typeof CreateParentSchema>;
