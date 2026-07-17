// dto/RecordBehaviorDTO.ts
import { RecordBehaviorInput } from "@/validators/teacher";

export type RecordBehaviorDTO = RecordBehaviorInput & {
  tenantId: string;
  recordedBy: string;
};
