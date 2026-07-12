// dto/CreateLessonPlanDTO.ts
import { CreateLessonPlanInput } from "@/validators/teacher";

export type CreateLessonPlanDTO = CreateLessonPlanInput & {
  tenantId: string;
  createdBy: string;
};
