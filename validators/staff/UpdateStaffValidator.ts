// validators/staff/UpdateStaffValidator.ts
import { z } from "zod";
import { CreateStaffSchema } from "./CreateStaffValidator";

export const UpdateStaffSchema = CreateStaffSchema.partial();

export type UpdateStaffInput = z.infer<typeof UpdateStaffSchema>;
