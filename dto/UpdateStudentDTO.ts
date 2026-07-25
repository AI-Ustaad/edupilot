// dto/UpdateStudentDTO.ts
import { z } from "zod";
import { CreateStudentSchema } from "./CreateStudentDTO";

export const UpdateStudentSchema = CreateStudentSchema.partial();
export type UpdateStudentDTO = z.infer<typeof UpdateStudentSchema>;
