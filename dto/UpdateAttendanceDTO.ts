import { z } from "zod";
import { CreateAttendanceSchema } from "./CreateAttendanceDTO";

export const UpdateAttendanceSchema = CreateAttendanceSchema.partial().omit({
  studentId: true,
});

export type UpdateAttendanceDTO = z.infer<typeof UpdateAttendanceSchema>;
