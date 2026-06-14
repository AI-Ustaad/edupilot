export const PERMISSIONS = {
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
  },
  analytics: {
    view: "analytics.view",
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
  chat: {
    view: "chat.view",
    send: "chat.send",
    delete: "chat.delete",
  },
  settings: {
    view: "settings.view",
    update: "settings.update",
    manage: "settings.manage",
  },
  audit: {
    view: "audit.view",
  },
  videoLectures: {
    view: "videoLectures.view",
    create: "videoLectures.create",
    delete: "videoLectures.delete",
  },
  buses: {
    view: "buses.view",
    create: "buses.create",
    update: "buses.update",
    delete: "buses.delete",
  },
  parents: {
    view: "parents.view",
    create: "parents.create",
    update: "parents.update",
    delete: "parents.delete",
  },
  ledger: {
    view: "ledger.view",
    create: "ledger.create",
    update: "ledger.update",
    delete: "ledger.delete",
  },
  subscriptions: {
    view: "subscriptions.view",
    create: "subscriptions.create",
    update: "subscriptions.update",
    delete: "subscriptions.delete",
    activate: "subscriptions.activate",
  },
  marks: {
    view: "marks.view",
    create: "marks.create",
    update: "marks.update",
    delete: "marks.delete",
  }
} as const;

export type Permission = 
  | "students.view" | "students.create" | "students.update" | "students.delete"
  | "staff.view" | "staff.create" | "staff.update" | "staff.delete"
  | "fees.view" | "fees.create" | "fees.update" | "fees.delete" | "fees.collect"
  | "attendance.view" | "attendance.create" | "attendance.update" | "attendance.delete"
  | "analytics.view"
  | "assignments.view" | "assignments.create" | "assignments.update" | "assignments.delete" | "assignments.grade"
  | "homework.view" | "homework.create" | "homework.update" | "homework.delete"
  | "quizzes.view" | "quizzes.create" | "quizzes.update" | "quizzes.delete" | "quizzes.grade"
  | "lessonPlans.view" | "lessonPlans.create" | "lessonPlans.update" | "lessonPlans.delete"
  | "chat.view" | "chat.send" | "chat.delete"
  | "settings.view" | "settings.update" | "settings.manage"
  | "audit.view"
  | "videoLectures.view" | "videoLectures.create" | "videoLectures.delete"
  | "buses.view" | "buses.create" | "buses.update" | "buses.delete"
  | "parents.view" | "parents.create" | "parents.update" | "parents.delete"
  | "ledger.view" | "ledger.create" | "ledger.update" | "ledger.delete"
  | "subscriptions.view" | "subscriptions.create" | "subscriptions.update" | "subscriptions.delete" | "subscriptions.activate"
  | "marks.view" | "marks.create" | "marks.update" | "marks.delete";