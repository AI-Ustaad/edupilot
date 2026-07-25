import { z } from "zod";
import { CreateFeeSchema } from "./CreateFeeDTO";

export const UpdateFeeSchema = CreateFeeSchema.partial();
export type UpdateFeeDTO = z.infer<typeof UpdateFeeSchema>;
