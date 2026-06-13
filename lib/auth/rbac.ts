// lib/auth/permissions.ts
// ==========================================
// 🛡️ EDUPILOT PERMISSIONS REGISTRY
// Simplified & TypeScript-Safe Version
// ==========================================

/**
 * All permissions as a flat string union type.
 * This is bulletproof - TypeScript will NEVER infer 'never' from this.
 */
export type Permission =
  // Students
  | "students.view"
  | "students.create"
  | "students.update"
  | "students.delete"
  | "students.export"
  | "students.import"
  | "students.bulk"
  | "students.promote"
  | "students.view360"
  | "students.viewRisk"
  | "students.ocrAdmission"
  // Staff
  | "staff.view"
  | "staff.create"
  | "staff.update"
  | "staff.delete"
  | "staff.export"
  | "staff.import"
  | "staff.bulk"
  | "staff.managePayroll"
  // Parents
  | "parents.view"
  | "parents.create"
  | "parents.update"
  | "parents.delete"
  | "parents.export"
  | "parents.import"
  // Marks
  | "marks.view"
  | "marks.create"
  | "marks.update"
  | "marks.delete"
  | "marks.bulk"
  | "marks.publish"
  | "marks.export"
  | "marks.import"
  | "marks.manageSkills"
  // Attendance
  | "attendance.view"
  | "attendance.create"
  | "attendance.update"
  | "attendance.delete"
  | "attendance.bulk"
  | "attendance.export"
  | "attendance.import"
  // Fees
  | "fees.view"
  | "fees.create"
  | "fees.update"
  | "fees.delete"
  | "fees.bulk"
  | "fees.export"
  | "fees.import"
  | "fees.collect"
  | "fees.waive"
  | "fees.refund"
  // Ledger
  | "ledger.view"
  | "ledger.create"
  | "ledger.update"
  | "ledger.delete"
  | "ledger.export"
  // Academic Resources
  | "syllabus.view"
  | "syllabus.create"
  | "syllabus.update"
  | "syllabus.delete"
  | "syllabus.publish"
  | "curriculum.view"
  | "curriculum.create"
  | "curriculum.update"
  | "curriculum.delete"
  | "curriculum.load"
  | "curriculum.preview"
  | "books.view"
  | "books.create"
  | "books.update"
  | "books.delete"
  | "books.manage"
  | "lessonPlans.view"
  | "lessonPlans.create"
  | "lessonPlans.update"
  | "lessonPlans.delete"
  | "lessonPlans.publish"
  // Assignments & Homework
  | "assignments.view"
  | "assignments.create"
  | "assignments.update"
  | "assignments.delete"
  | "assignments.grade"
  | "homework.view"
  | "homework.create"
  | "homework.update"
  | "homework.delete"
  // Quizzes & Exams
  | "quizzes.view"
  | "quizzes.create"
  | "quizzes.update"
  | "quizzes.delete"
  | "quizzes.publish"
  | "quizzes.grade"
  | "admitCards.view"
  | "admitCards.create"
  | "admitCards.bulk"
  | "admitCards.export"
  // Timetable & Transport
  | "timetable.view"
  | "timetable.create"
  | "timetable.update"
  | "timetable.delete"
  | "timetable.generateAI"
  | "buses.view"
  | "buses.create"
  | "buses.update"
  | "buses.delete"
  // School Management
  | "classes.view"
  | "classes.create"
  | "classes.update"
  | "classes.delete"
  | "sections.view"
  | "sections.create"
  | "sections.update"
  | "sections.delete"
  | "academicYear.view"
  | "academicYear.create"
  | "academicYear.update"
  | "academicYear.delete"
  | "academicYear.activate"
  // Behavior & Leave
  | "behavior.view"
  | "behavior.create"
  | "behavior.update"
  | "behavior.delete"
  | "leave.view"
  | "leave.apply"
  | "leave.approve"
  | "leave.reject"
  | "leave.manage"
  // Admissions
  | "admissions.view"
  | "admissions.create"
  | "admissions.update"
  | "admissions.approve"
  | "admissions.reject"
  // Reports & Analytics
  | "reports.view"
  | "reports.create"
  | "reports.generate"
  | "reports.export"
  | "analytics.view"
  | "analytics.viewAdvanced"
  | "analytics.export"
  | "audit.view"
  | "audit.export"
  // AI Features
  | "ai.chatbot"
  | "ai.examQuestions"
  | "ai.examPaper"
  | "ai.reportComments"
  | "ai.timetable"
  | "ai.smartBookCenter"
  // OCR & Chat
  | "ocr.use"
  | "ocr.extract"
  | "chat.view"
  | "chat.send"
  | "chat.manage"
  | "notifications.view"
  | "notifications.send"
  | "notifications.manage"
  // Settings
  | "settings.view"
  | "settings.update"
  | "settings.manageWhitelabel"
  | "settings.manageAddons"
  | "settings.manageBilling"
  | "menu.view"
  | "menu.update"
  | "featureFlags.view"
  | "featureFlags.update"
  // Users & Admin
  | "users.view"
  | "users.create"
  | "users.update"
  | "users.delete"
  | "users.manageRoles"
  | "users.registerSchool"
  | "admin.rebuildStats"
  | "admin.deleteStudent"
  | "admin.manageParents"
  | "admin.superAnalytics"
  // Subscriptions
  | "subscriptions.view"
  | "subscriptions.manage"
  | "subscriptions.activate"
  | "addons.view"
  | "addons.purchase"
  | "addons.manage"
  // Certificates & Upload
  | "certificates.view"
  | "certificates.create"
  | "certificates.issue"
  | "upload.use"
  | "upload.manage"
  // Jobs & GDPR
  | "jobs.trigger"
  | "jobs.view"
  | "gdpr.export"
  | "gdpr.delete"
  | "protectedData.access";

/**
 * ✅ PERMISSIONS object - strongly typed with `as const`
 */
export const PERMISSIONS = {
  students: {
    view: "students.view",
    create: "students.create",
    update: "students.update",
    delete: "students.delete",
    export: "students.export",
    import: "students.import",
    bulk: "students.bulk",
    promote: "students.promote",
    view360: "students.view360",
    viewRisk: "students.viewRisk",
    ocrAdmission: "students.ocrAdmission",
  },
  staff: {
    view: "staff.view",
    create: "staff.create",
    update: "staff.update",
    delete: "staff.delete",
    export: "staff.export",
    import: "staff.import",
    bulk: "staff.bulk",
    managePayroll: "staff.managePayroll",
  },
  parents: {
    view: "parents.view",
    create: "parents.create",
    update: "parents.update",
    delete: "parents.delete",
    export: "parents.export",
    import: "parents.import",
  },
  marks: {
    view: "marks.view",
    create: "marks.create",
    update: "marks.update",
    delete: "marks.delete",
    bulk: "marks.bulk",
    publish: "marks.publish",
    export: "marks.export",
    import: "marks.import",
    manageSkills: "marks.manageSkills",
  },
  attendance: {
    view: "attendance.view",
    create: "attendance.create",
    update: "attendance.update",
    delete: "attendance.delete",
    bulk: "attendance.bulk",
    export: "attendance.export",
    import: "attendance.import",
  },
  fees: {
    view: "fees.view",
    create: "fees.create",
    update: "fees.update",
    delete: "fees.delete",
    bulk: "fees.bulk",
    export: "fees.export",
    import: "fees.import",
    collect: "fees.collect",
    waive: "fees.waive",
    refund: "fees.refund",
  },
  ledger: {
    view: "ledger.view",
    create: "ledger.create",
    update: "ledger.update",
    delete: "ledger.delete",
    export: "ledger.export",
  },
  syllabus: {
    view: "syllabus.view",
    create: "syllabus.create",
    update: "syllabus.update",
    delete: "syllabus.delete",
    publish: "syllabus.publish",
  },
  curriculum: {
    view: "curriculum.view",
    create: "curriculum.create",
    update: "curriculum.update",
    delete: "curriculum.delete",
    load: "curriculum.load",
    preview: "curriculum.preview",
  },
  books: {
    view: "books.view",
    create: "books.create",
    update: "books.update",
    delete: "books.delete",
    manage: "books.manage",
  },
  lessonPlans: {
    view: "lessonPlans.view",
    create: "lessonPlans.create",
    update: "lessonPlans.update",
    delete: "lessonPlans.delete",
    publish: "lessonPlans.publish",
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
    publish: "quizzes.publish",
    grade: "quizzes.grade",
  },
  admitCards: {
    view: "admitCards.view",
    create: "admitCards.create",
    bulk: "admitCards.bulk",
    export: "admitCards.export",
  },
  timetable: {
    view: "timetable.view",
    create: "timetable.create",
    update: "timetable.update",
    delete: "timetable.delete",
    generateAI: "timetable.generateAI",
  },
  buses: {
    view: "buses.view",
    create: "buses.create",
    update: "buses.update",
    delete: "buses.delete",
  },
  classes: {
    view: "classes.view",
    create: "classes.create",
    update: "classes.update",
    delete: "classes.delete",
  },
  sections: {
    view: "sections.view",
    create: "sections.create",
    update: "sections.update",
    delete: "sections.delete",
  },
  academicYear: {
    view: "academicYear.view",
    create: "academicYear.create",
    update: "academicYear.update",
    delete: "academicYear.delete",
    activate: "academicYear.activate",
  },
  behavior: {
    view: "behavior.view",
    create: "behavior.create",
    update: "behavior.update",
    delete: "behavior.delete",
  },
  leave: {
    view: "leave.view",
    apply: "leave.apply",
    approve: "leave.approve",
    reject: "leave.reject",
    manage: "leave.manage",
  },
  admissions: {
    view: "admissions.view",
    create: "admissions.create",
    update: "admissions.update",
    approve: "admissions.approve",
    reject: "admissions.reject",
  },
  reports: {
    view: "reports.view",
    create: "reports.create",
    generate: "reports.generate",
    export: "reports.export",
  },
  analytics: {
    view: "analytics.view",
    viewAdvanced: "analytics.viewAdvanced",
    export: "analytics.export",
  },
  audit: {
    view: "audit.view",
    export: "audit.export",
  },
  ai: {
    chatbot: "ai.chatbot",
    examQuestions: "ai.examQuestions",
    examPaper: "ai.examPaper",
    reportComments: "ai.reportComments",
    timetable: "ai.timetable",
    smartBookCenter: "ai.smartBookCenter",
  },
  ocr: {
    use: "ocr.use",
    extract: "ocr.extract",
  },
  chat: {
    view: "chat.view",
    send: "chat.send",
    manage: "chat.manage",
  },
  notifications: {
    view: "notifications.view",
    send: "notifications.send",
    manage: "notifications.manage",
  },
  settings: {
    view: "settings.view",
    update: "settings.update",
    manageWhitelabel: "settings.manageWhitelabel",
    manageAddons: "settings.manageAddons",
    manageBilling: "settings.manageBilling",
  },
  menu: {
    view: "menu.view",
    update: "menu.update",
  },
  featureFlags: {
    view: "featureFlags.view",
    update: "featureFlags.update",
  },
  users: {
    view: "users.view",
    create: "users.create",
    update: "users.update",
    delete: "users.delete",
    manageRoles: "users.manageRoles",
    registerSchool: "users.registerSchool",
  },
  admin: {
    rebuildStats: "admin.rebuildStats",
    deleteStudent: "admin.deleteStudent",
    manageParents: "admin.manageParents",
    superAnalytics: "admin.superAnalytics",
  },
  subscriptions: {
    view: "subscriptions.view",
    manage: "subscriptions.manage",
    activate: "subscriptions.activate",
  },
  addons: {
    view: "addons.view",
    purchase: "addons.purchase",
    manage: "addons.manage",
  },
  certificates: {
    view: "certificates.view",
    create: "certificates.create",
    issue: "certificates.issue",
  },
  upload: {
    use: "upload.use",
    manage: "upload.manage",
  },
  jobs: {
    trigger: "jobs.trigger",
    view: "jobs.view",
  },
  gdpr: {
    export: "gdpr.export",
    delete: "gdpr.delete",
  },
  protectedData: {
    access: "protectedData.access",
  },
} as const;

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get all permissions as a flat array
 */
export function getAllPermissions(): Permission[] {
  const permissions: Permission[] = [];
  for (const category of Object.values(PERMISSIONS)) {
    for (const permission of Object.values(category)) {
      permissions.push(permission as Permission);
    }
  }
  return permissions;
}

/**
 * Check if a string is a valid permission
 */
export function isValidPermission(permission: string): permission is Permission {
  return getAllPermissions().includes(permission as Permission);
}
