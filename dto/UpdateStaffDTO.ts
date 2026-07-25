import { z } from "zod";
import { CreateStaffSchema } from "./CreateStaffDTO";

export const UpdateStaffSchema = CreateStaffSchema.partial();
export type UpdateStaffDTO = z.infer<typeof UpdateStaffSchema>;
