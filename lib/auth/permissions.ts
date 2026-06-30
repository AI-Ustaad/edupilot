// lib/auth/permissions.ts
// FIXED: ہر module میں مکمل CRUD actions شامل کیے گئے ہیں
// تاکہ آئندہ کسی page میں .create/.update/.delete استعمال ہونے پر error نہ آئے

export const PERMISSIONS = {
  dashboard: {
    view: "dashboard.view",
  },
  students: {
    view: "students.view",
    create: "students.create",
    update: "students.update",
    delete: "students.delete",
  },
  staff: {
    view: "staff.view",
    create: "staff.create",
    update: "staff.update",
    delete: "staff.delete",
  },
  fees: {
    view: "fees.view",
    create: "fees.create",
    update: "fees.update",
    delete: "fees.delete",
    collect: "fees.collect",
  },
  attendance: {
    view: "attendance.view",
    create: "attendance.create",
    update: "attendance.update",
    delete: "attendance.delete",
    mark: "attendance.mark",
  },
  parents: {
    view: "parents.view",
    create: "parents.create",
    update: "parents.update",
    delete: "parents.delete",
    manage: "parents.manage",
  },
  settings: {
    view: "settings.view",
    create: "settings.create",
    update: "settings.update",
    delete: "settings.delete",
    manage: "settings.manage",
  },
  billing: {
    view: "billing.view",
    create: "billing.create",
    update: "billing.update",
    manage: "billing.manage",
  },
  audit: {
    view: "audit.view",
  },
  analytics: {
    view: "analytics.view",
  },
  subscriptions: {
    view: "subscriptions.view",
    create: "subscriptions.create",
    update: "subscriptions.update",
    manage: "subscriptions.manage",
  },
  assignments: {
    view: "assignments.view",
    create: "assignments.create",
    update: "assignments.update",
    delete: "assignments.delete",
    grade: "assignments.grade",
  },
  homework: {
    view: "homework.view",
    create: "homework.create",
    update: "homework.update",
    delete: "homework.delete",
  },
  quizzes: {
    view: "quizzes.view",
    create: "quizzes.create",
    update: "quizzes.update",
    delete: "quizzes.delete",
    grade: "quizzes.grade",
  },
  lessonPlans: {
    view: "lessonPlans.view",
    create: "lessonPlans.create",
    update: "lessonPlans.update",
    delete: "lessonPlans.delete",
  },
  marks: {
    view: "marks.view",
    create: "marks.create",
    update: "marks.update",
    delete: "marks.delete",
  },
  buses: {
    view: "buses.view",
    create: "buses.create",
    update: "buses.update",
    delete: "buses.delete",
  },
  chat: {
    view: "chat.view",
    send: "chat.send",
  },
  ledger: {
    view: "ledger.view",
    create: "ledger.create",
    update: "ledger.update",
  },
  videoLectures: {
    view: "videoLectures.view",
    create: "videoLectures.create",
    update: "videoLectures.update",
    delete: "videoLectures.delete",
  },
  exams: {
    view: "exams.view",
    create: "exams.create",
    update: "exams.update",
    delete: "exams.delete",
  },
  syllabus: {
    view: "syllabus.view",
    create: "syllabus.create",
    update: "syllabus.update",
    delete: "syllabus.delete",
  },
  admissions: {
    view: "admissions.view",
    create: "admissions.create",
    update: "admissions.update",
    approve: "admissions.approve",
  },
  whitelabel: {
    view: "whitelabel.view",
    update: "whitelabel.update",
    manage: "whitelabel.manage",
  },
  users: {
    view: "users.view",
    create: "users.create",
    update: "users.update",
    delete: "users.delete",
    manage: "users.manage",
  },
  gdpr: {
    view: "gdpr.view",
    export: "gdpr.export",
    delete: "gdpr.delete",
  },
  reports: {
    view: "reports.view",
    create: "reports.create",
    generate: "reports.generate",
  },
} as const;

// Recursive type — ہر module کی ہر action ایک ہی Permission union میں شامل ہوتی ہے
type ValueOf<T> = T[keyof T];
export type Permission = ValueOf<{
  [K in keyof typeof PERMISSIONS]: ValueOf<typeof PERMISSIONS[K]>;
}>;
