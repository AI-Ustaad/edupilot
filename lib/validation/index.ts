// lib/validation/index.ts
// FIXED: نام والے conflicts ختم — ہر schema کا الگ namespace export ہوتا ہے

// Student schemas — اصل نام رہنے دیں (سب سے زیادہ استعمال ہوتے ہیں)
export {
  createStudentSchema,
  updateStudentSchema,
} from "./student.schema";
export type {
  CreateStudentInput,
  UpdateStudentInput,
} from "./student.schema";

// Staff schemas — alias کے ساتھ تاکہ student schema سے ٹکراؤ نہ ہو
export {
  createStaffSchema as CreateStaffSchema,
  updateStaffSchema as UpdateStaffSchema,
  createStaffSchema,
  updateStaffSchema,
} from "./staff.schema";

// Fees schemas
export * from "./fees.schema";

// Attendance schemas
export * from "./attendance.schema";

// Video lecture schemas
export * from "./video-lecture.schema";

// Homework schemas
export * from "./homework.schema";

// Settings schemas
export * from "./settings.schema";

// Auth schemas
export * from "./auth.schema";
