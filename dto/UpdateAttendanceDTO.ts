// dto/UpdateAttendanceDTO.ts
import { MarkAttendanceSchema } from "@/validators/attendance/AttendanceValidator";
import { z } from "zod";

export const UpdateAttendanceSchema = MarkAttendanceSchema.partial().omit({
  studentId: true,
});

export type UpdateAttendanceInput = z.infer<typeof UpdateAttendanceSchema>;

export type UpdateAttendanceDTO = UpdateAttendanceInput & {
  id: string;
  tenantId: string;
  updatedBy: string;
};
