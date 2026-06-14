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

  chat: {
    view: "chat.view",
    send: "chat.send",
  },

  parents: {
    view: "parents.view",
  },

  settings: {
    view: "settings.view",
    update: "settings.update",
  },

  ledger: {
    view: "ledger.view",
  },

  subscriptions: {
    view: "subscriptions.view",
  },

  marks: {
    view: "marks.view",
  },

  buses: {
    view: "buses.view",
    update: "buses.update",
  },

  videoLectures: {
    view: "videoLectures.view",
    create: "videoLectures.create",
  },

  audit: {
    view: "audit.view",
  },
} as const;

type PermissionGroup =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export type Permission =
  PermissionGroup[keyof PermissionGroup];
