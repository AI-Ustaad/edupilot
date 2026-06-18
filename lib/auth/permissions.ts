// lib/auth/permissions.ts

export const PERMISSIONS = {
  // 🎓 Core Modules
  students: { view: "students.view", create: "students.create", update: "students.update", delete: "students.delete", manage: "students.manage" },
  academics: { view: "academics.view", manage: "academics.manage" },
  exams: { view: "exams.view", create: "exams.create", update: "exams.update", delete: "exams.delete", manage: "exams.manage" },
  
  // 👨‍🏫 Staff & HR
  staff: { view: "staff.view", create: "staff.create", update: "staff.update", delete: "staff.delete", manage: "staff.manage" },
  payroll: { view: "payroll.view", manage: "payroll.manage" },
  leave: { view: "leave.view", manage: "leave.manage" },

  // 💰 Finance
  fees: { view: "fees.view", create: "fees.create", update: "fees.update", delete: "fees.delete", collect: "fees.collect", manage: "fees.manage" },
  finance: { view: "finance.view", create: "finance.create", update: "finance.update", delete: "finance.delete", manage: "finance.manage" },
  ledger: { view: "ledger.view", create: "ledger.create", update: "ledger.update", delete: "ledger.delete" },

  // ⚙️ Operations & Daily
  attendance: { view: "attendance.view", create: "attendance.create", update: "attendance.update", delete: "attendance.delete", manage: "attendance.manage" },
  timetable: { view: "timetable.view", create: "timetable.create", update: "timetable.update", delete: "timetable.delete" },
  operations: { view: "operations.view", manage: "operations.manage" }, // Transport, Hostel, Inventory
  communication: { view: "communication.view", send: "communication.send", manage: "communication.manage" },

  // 📚 Teaching & Learning
  homework: { view: "homework.view", create: "homework.create", update: "homework.update", delete: "homework.delete" },
  assignments: { view: "assignments.view", create: "assignments.create", update: "assignments.update", delete: "assignments.delete", grade: "assignments.grade" },
  quizzes: { view: "quizzes.view", create: "quizzes.create", update: "quizzes.update", delete: "quizzes.delete", grade: "quizzes.grade" },
  lessonPlans: { view: "lessonPlans.view", create: "lessonPlans.create", update: "lessonPlans.update", delete: "lessonPlans.delete" },
  videoLectures: { view: "videoLectures.view", create: "videoLectures.create", delete: "videoLectures.delete" },
  books: { view: "books.view", create: "books.create", update: "books.update", delete: "books.delete" },
  behavior: { view: "behavior.view", create: "behavior.create", update: "behavior.update", delete: "behavior.delete" },
  skills: { view: "skills.view", create: "skills.create", update: "skills.update", delete: "skills.delete" },
  
  // 🤖 AI & Analytics
  ai: { view: "ai.view", manage: "ai.manage" },
  analytics: { view: "analytics.view" },

  // 🛡️ Admin & System
  settings: { view: "settings.view", update: "settings.update", manage: "settings.manage" },
  audit: { view: "audit.view" },
  billing: { view: "billing.view" },
  parents: { view: "parents.view", create: "parents.create", update: "parents.update", delete: "parents.delete" },
  chat: { view: "chat.view", send: "chat.send", delete: "chat.delete" },
  
  // 🌍 Global SaaS (Super Admin Only)
  superadmin: { access: "superadmin.access" },
  subscriptions: { view: "subscriptions.view", create: "subscriptions.create", update: "subscriptions.update", delete: "subscriptions.delete", activate: "subscriptions.activate" }
} as const;

type ValueOf<T> = T[keyof T];
export type Permission = ValueOf<{
  [K in keyof typeof PERMISSIONS]: ValueOf<typeof PERMISSIONS[K]>
}>;
