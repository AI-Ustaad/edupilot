// lib/validation/index.ts
// FIXED: نام والے conflicts ختم — ہر schema کا الگ namespace export ہوتا ہے

// Student schemas — from validators/student/ (canonical)
export {
  CreateStudentSchema,
  UpdateStudentSchema,
  BulkImportRowSchema,
  BulkImportFileSchema,
  OCRFileSchema,
  OCRExtractedSchema,
} from "../../validators/student";
export type {
  CreateStudentInput,
  UpdateStudentInput,
} from "../../validators/student";

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

// Video lecture schemas
export * from "./video-lecture.schema";

// Homework schemas
export * from "./homework.schema";

// Settings schemas
export * from "./settings.schema";

// Auth schemas
export * from "./auth.schema";
