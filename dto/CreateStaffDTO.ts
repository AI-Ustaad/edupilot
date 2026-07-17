// dto/CreateStaffDTO.ts
import { CreateStaffInput } from "@/validators/staff/CreateStaffValidator";

export type CreateStaffDTO = CreateStaffInput & {
  tenantId: string;
  createdBy: string;
  admissionMethod?: string;
};
