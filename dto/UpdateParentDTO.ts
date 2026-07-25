import { z } from "zod";
import { CreateParentSchema } from "./CreateParentDTO";

export const UpdateParentSchema = CreateParentSchema.partial();
export type UpdateParentDTO = z.infer<typeof UpdateParentSchema>;
