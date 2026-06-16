// lib/auth/permissions.ts

export const PERMISSIONS = {
  students: { 
    view: "students.view", 
    create: "students.create", 
    update: "students.update", 
    delete: "students.delete" 
  },
  staff: { 
    view: "staff.view", 
    create: "staff.create", 
    update: "staff.update", 
    delete: "staff.delete",
    manage: "staff.manage" // Added for HR/Leave Approvals
  },
  fees: { 
    view: "fees.view", 
    create: "fees.create", 
    update: "fees.update", 
    delete: "fees.delete", 
    collect: "fees.collect",
    manage: "fees.manage" 
  },
  attendance: { 
    view: "attendance.view", 
    create: "attendance.create", 
    update: "attendance.update", 
    delete: "attendance.delete",
    manage: "attendance.manage" 
  },
  exams: { 
    view: "exams.view", 
    create: "exams.create", 
    update: "exams.update", 
    delete: "exams.delete", 
    manage: "exams.manage" 
  },
  finance: { 
    view: "finance.view", 
    create: "finance.create", 
    update: "finance.update", 
    delete: "finance.delete", 
    manage: "finance.manage" 
  },
  settings: { 
    view: "settings.view", 
    update: "settings.update", 
    manage: "settings.manage" 
  },
  homework: { 
    view: "homework.view", 
    create: "homework.create", 
    update: "homework.update", 
    delete: "homework.delete" 
  },
  buses: { 
    view: "buses.view", 
    create: "buses.create", 
    update: "buses.update", 
    delete: "buses.delete" 
  },
  parents: { 
    view: "parents.view", 
    create: "parents.create", 
    update: "parents.update", 
    delete: "parents.delete" 
  },
  videoLectures: { 
    view: "videoLectures.view", 
    create: "videoLectures.create", 
    delete: "videoLectures.delete" 
  },
  ledger: { 
    view: "ledger.view", 
    create: "ledger.create", 
    update: "ledger.update", 
    delete: "ledger.delete" 
  },
  subscriptions: { 
    view: "subscriptions.view", 
    create: "subscriptions.create", 
    update: "subscriptions.update", 
    delete: "subscriptions.delete", 
    activate: "subscriptions.activate" 
  },
  marks: { 
    view: "marks.view", 
    create: "marks.create", 
    update: "marks.update", 
    delete: "marks.delete" 
  },
  analytics: { 
    view: "analytics.view" 
  },
  assignments: { 
    view: "assignments.view", 
    create: "assignments.create", 
    update: "assignments.update", 
    delete: "assignments.delete", 
    grade: "assignments.grade" 
  },
  quizzes: { 
    view: "quizzes.view", 
    create: "quizzes.create", 
    update: "quizzes.update", 
    delete: "quizzes.delete", 
    grade: "quizzes.grade" 
  },
  lessonPlans: { 
    view: "lessonPlans.view", 
    create: "lessonPlans.create", 
    update: "lessonPlans.update", 
    delete: "lessonPlans.delete" 
  },
  chat: { 
    view: "chat.view", 
    send: "chat.send", 
    delete: "chat.delete" 
  },
  audit: { 
    view: "audit.view" 
  },
  // 🚀 NEW MODULES ADDED TO FREEZE THE REGISTRY
  timetable: {
    view: "timetable.view",
    create: "timetable.create",
    update: "timetable.update",
    delete: "timetable.delete"
  },
  behavior: {
    view: "behavior.view",
    create: "behavior.create",
    update: "behavior.update",
    delete: "behavior.delete"
  },
  skills: {
    view: "skills.view",
    create: "skills.create",
    update: "skills.update",
    delete: "skills.delete"
  },
  books: {
    view: "books.view",
    create: "books.create",
    update: "books.update",
    delete: "books.delete"
  }
} as const;

// 🚀 ENTERPRISE MAGIC: Auto-extract types so you NEVER have to write them manually again!
// This extracts all the string values from the nested PERMISSIONS object into a single Union Type.
type PermissionsObject = typeof PERMISSIONS;
type Modules = keyof PermissionsObject;
export type Permission = PermissionsObject[Modules][keyof PermissionsObject[Modules]];
