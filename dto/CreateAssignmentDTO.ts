// dto/CreateAssignmentDTO.ts
import { CreateAssignmentInput } from "@/validators/teacher";

export type CreateAssignmentDTO = CreateAssignmentInput & {
  tenantId: string;
  createdBy: string;
};
