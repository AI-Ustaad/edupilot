// lib/validation/index.ts
// FIXED: نام والے conflicts ختم — ہر schema کا الگ namespace export ہوتا ہے

// Student schemas — from dto/ (canonical)
export { CreateStudentSchema } from "../../dto/CreateStudentDTO";
export type { CreateStudentDTO } from "../../dto/CreateStudentDTO";
export { UpdateStudentSchema } from "../../dto/UpdateStudentDTO";
export type { UpdateStudentDTO } from "../../dto/UpdateStudentDTO";

// Fees schemas — from validators/fees/ (canonical)
export {
  CreateFeeSchema,
  UpdateFeeSchema,
} from "../../validators/fees";
export type {
  CreateFeeInput,
  UpdateFeeInput,
} from "../../validators/fees";

// Attendance schemas — from validators/attendance/ (canonical)
export {
  MarkAttendanceSchema,
  BulkAttendanceSchema,
  GetAttendanceQuerySchema,
} from "../../validators/attendance";
export type {
  MarkAttendanceInput,
} from "../../validators/attendance";

// Marks schemas — from validators/marks/ (canonical)
export {
  SaveMarkSchema,
  BulkPublishSchema,
  SkillsSchema,
  GetMarksQuerySchema,
} from "../../validators/marks";
export type {
  SaveMarkInput,
  BulkPublishInput,
  SkillsInput,
} from "../../validators/marks";

// Timetable schemas — from validators/timetable/ (canonical)
export {
  CreateTimetableEntrySchema,
} from "../../validators/timetable";
export type {
  CreateTimetableEntryInput,
} from "../../validators/timetable";

// Teacher schemas — from validators/teacher/ (canonical)
export {
  CreateAssignmentSchema,
  UpdateAssignmentSchema,
  CreateLessonPlanSchema,
  UpdateLessonPlanSchema,
  CreateBookSchema,
  UpdateBookSchema,
  RecordBehaviorSchema,
} from "../../validators/teacher";
export type {
  CreateAssignmentInput,
  UpdateAssignmentInput,
  CreateLessonPlanInput,
  UpdateLessonPlanInput,
  CreateBookInput,
  UpdateBookInput,
  RecordBehaviorInput,
} from "../../validators/teacher";

// Video lecture schemas
export * from "./video-lecture.schema";

// Homework schemas
export * from "./homework.schema";

// Settings schemas
export * from "./settings.schema";

// Auth schemas
export * from "./auth.schema";
