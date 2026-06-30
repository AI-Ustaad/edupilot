// lib/auth/permissions.ts
// FIXED: Permission type اب properly تمام nested values کو include کرتا ہے

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
    manage: "parents.manage",
  },
  settings: {
    view: "settings.view",
    update: "settings.update",
    manage: "settings.manage",
  },
  billing: {
    view: "billing.view",
  },
  audit: {
    view: "audit.view",
  },
  analytics: {
    view: "analytics.view",
  },
  subscriptions: {
    view: "subscriptions.view",
  },
  assignments: {
    view: "assignments.view",
    create: "assignments.create",
    update: "assignments.update",
    grade: "assignments.grade",
  },
  homework: {
    view: "homework.view",
    create: "homework.create",
    update: "homework.update",
  },
  quizzes: {
    view: "quizzes.view",
    create: "quizzes.create",
    grade: "quizzes.grade",
  },
  lessonPlans: {
    view: "lessonPlans.view",
    create: "lessonPlans.create",
  },
  marks: {
    view: "marks.view",
  },
  buses: {
    view: "buses.view",
    update: "buses.update",
  },
  chat: {
    view: "chat.view",
    send: "chat.send",
  },
  ledger: {
    view: "ledger.view",
  },
  videoLectures: {
    view: "videoLectures.view",
    create: "videoLectures.create",
  },
} as const;

// FIXED: یہ اب ہر module کے ہر action کو ٹھیک طرح union type میں جمع کرتا ہے
// پہلے یہ صرف 1 level گہرا تھا، اب recursive ہے
type ValueOf<T> = T[keyof T];
export type Permission = ValueOf<{
  [K in keyof typeof PERMISSIONS]: ValueOf<typeof PERMISSIONS[K]>;
}>;
