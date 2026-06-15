export const PERMISSIONS = {
  students: { view: "students.view", create: "students.create", update: "students.update", delete: "students.delete" },
  staff: { view: "staff.view", create: "staff.create", update: "staff.update", delete: "staff.delete" },
  fees: { view: "fees.view", create: "fees.create", update: "fees.update", delete: "fees.delete", manage: "fees.manage" },
  attendance: { view: "attendance.view", create: "attendance.create", update: "attendance.update", delete: "attendance.delete", manage: "attendance.manage" },
  exams: { view: "exams.view", create: "exams.create", update: "exams.update", delete: "exams.delete", manage: "exams.manage" },
  settings: { view: "settings.view", update: "settings.update", manage: "settings.manage" },
  // ... باقی پرمیشنز اسی طرح رکھیں
} as const;

export type Permission = 
  | "students.view" | "students.create" | "students.update" | "students.delete"
  | "staff.view" | "staff.create" | "staff.update" | "staff.delete"
  | "fees.view" | "fees.create" | "fees.update" | "fees.delete" | "fees.manage"
  | "attendance.view" | "attendance.create" | "attendance.update" | "attendance.delete" | "attendance.manage"
  | "exams.view" | "exams.create" | "exams.update" | "exams.delete" | "exams.manage"
  | "settings.view" | "settings.update" | "settings.manage";
