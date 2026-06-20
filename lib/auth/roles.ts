// lib/auth/roles.ts
import { PERMISSIONS } from "./permissions";

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  // ─── Super Admin (سب کچھ) ─────────────────
  super_admin: [
    // تمام ممکنہ پرمیشنز
    "students.view", "students.create", "students.update", "students.delete",
    "staff.view", "staff.create", "staff.update", "staff.delete",
    "fees.view", "fees.create", "fees.update", "fees.delete",
    "attendance.view", "attendance.create", "attendance.update", "attendance.delete",
    "parents.view", "parents.manage",
    "dashboard.view", "analytics.view",
    "settings.view", "settings.manage",
    "billing.view", "billing.manage",
    "audit.view",
    "ledger.view",
    "buses.view", "buses.create", "buses.update", "buses.delete",
    "homework.create", "homework.view",
    "assignments.create", "assignments.view", "assignments.grade",
    "quizzes.create", "quizzes.view", "quizzes.grade",
    "lessonPlans.create", "lessonPlans.view",
    "videoLectures.view", "videoLectures.create", "videoLectures.delete",
    "books.view", "books.create", "books.update", "books.delete",
    "behavior.view", "behavior.create",
    "skills.view", "skills.create",
    "ai.view",               // ← AI Assistant + Exam Generator + Timetable
    "chat.send", "chat.view",
    "admissions",
    "leaveRequests",
    "aiExamGenerator",
    "aiTimetable",
    "academics.view", "academics.manage",
    "exams.view", "exams.create", "exams.update", "exams.delete", "exams.manage",
    "marks.view", "marks.create", "marks.update", "marks.delete",
    "payroll.view", "payroll.manage",
    "leave.view", "leave.manage",
    "finance.view", "finance.create", "finance.update", "finance.delete", "finance.manage",
    "timetable.view", "timetable.create", "timetable.update", "timetable.delete",
    "operations.view", "operations.manage",
    "communication.view", "communication.send", "communication.manage",
    "superadmin.access",
    "subscriptions.view", "subscriptions.create", "subscriptions.update", "subscriptions.delete", "subscriptions.activate",
  ],

  // ─── Admin (اسکول کا ایڈمن) ───────────────
  admin: [
    "students.view", "students.create", "students.update", "students.delete",
    "staff.view", "staff.create", "staff.update", "staff.delete",
    "fees.view", "fees.create", "fees.update", "fees.delete",
    "attendance.view", "attendance.create", "attendance.update", "attendance.delete",
    "parents.view", "parents.manage",
    "dashboard.view", "analytics.view",
    "settings.view", "settings.manage",
    "billing.view", "billing.manage",
    "audit.view",
    "ledger.view",
    "buses.view", "buses.create", "buses.update", "buses.delete",
    "homework.create", "homework.view",
    "assignments.create", "assignments.view", "assignments.grade",
    "quizzes.create", "quizzes.view", "quizzes.grade",
    "lessonPlans.create", "lessonPlans.view",
    "videoLectures.view", "videoLectures.create",
    "books.view", "books.create",
    "behavior.view", "behavior.create",
    "skills.view", "skills.create",
    "ai.view",               // ← ضروری
    "chat.send", "chat.view",
    "admissions",
    "leaveRequests",
    "aiExamGenerator",
    "aiTimetable",
    "academics.view", "academics.manage",
    "exams.view", "exams.create", "exams.update", "exams.delete",
    "marks.view", "marks.create", "marks.update", "marks.delete",
    "payroll.view", "payroll.manage",
    "leave.view", "leave.manage",
    "timetable.view", "timetable.create",
    "operations.view", "operations.manage",
    "communication.view", "communication.send", "communication.manage",
    "subscriptions.view", "subscriptions.create", "subscriptions.update",
  ],

  // ─── Teacher ───────────────────────────────
  teacher: [
    "students.view",
    "attendance.view", "attendance.create",
    "dashboard.view", "analytics.view",
    "homework.create", "homework.view",
    "assignments.create", "assignments.view", "assignments.grade",
    "quizzes.create", "quizzes.view",
    "lessonPlans.create", "lessonPlans.view",
    "videoLectures.view", "videoLectures.create",
    "books.view",
    "behavior.view", "behavior.create",
    "skills.view", "skills.create",
    "ai.view",               // ٹیچر کو AI کی رسائی
    "chat.send", "chat.view",
    "exams.view",
    "marks.view", "marks.create", "marks.update",
    "timetable.view",
    "communication.send",
  ],

  // ─── Accountant ────────────────────────────
  accountant: [
    "fees.view", "fees.create", "fees.update",
    "billing.view",
    "ledger.view",
    "dashboard.view", "analytics.view",
  ],

  // ─── Parent ────────────────────────────────
  parent: [
    "parents.view", "parents.manage",
  ],
};

export type Role = keyof typeof ROLE_PERMISSIONS;
