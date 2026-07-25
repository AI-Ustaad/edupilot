// validators/attendance/index.ts
export { MarkAttendanceSchema, BulkAttendanceSchema, GetAttendanceQuerySchema } from "./AttendanceValidator";
export type { MarkAttendanceInput } from "./AttendanceValidator";
export { UpdateAttendanceSchema } from "@/dto/UpdateAttendanceDTO";
export type { UpdateAttendanceDTO } from "@/dto/UpdateAttendanceDTO";
