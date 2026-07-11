// dto/CreateAttendanceDTO.ts
import { MarkAttendanceInput } from "@/validators/attendance/AttendanceValidator";

export type CreateAttendanceDTO = MarkAttendanceInput & {
  tenantId: string;
  createdBy: string;
};
