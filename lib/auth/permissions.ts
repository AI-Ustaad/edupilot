// lib/auth/permissions.ts
// ==========================================
// 🛡️ EDUPILOT PERMISSIONS REGISTRY
// Enterprise-Grade RBAC System
// ==========================================

/**
 * Permission Structure:
 * resource.action
 * 
 * Actions:
 * - view: Read access
 * - create: Create new records
 * - update: Modify existing records
 * - delete: Remove/archive records
 * - export: Export data (CSV, Excel, PDF)
 * - import: Bulk import data
 * - publish: Publish content (marks, results)
 * - approve: Approve requests (admissions, leave)
 * - manage: Full administrative control
 * - bulk: Bulk operations
 */

export const PERMISSIONS = {
  // ==========================================
  // 👨‍🎓 STUDENTS - Most Sensitive
  // ==========================================
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

  // ==========================================
  // 👨‍🏫 STAFF / TEACHERS
  // ==========================================
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

  // ==========================================
  // 👨‍👩‍👧 PARENTS
  // ==========================================
  parents: {
    view: "parents.view",
    create: "parents.create",
    update: "parents.update",
    delete: "parents.delete",
    export: "parents.export",
    import: "parents.import",
  },

  // ==========================================
  // 📊 ACADEMIC - MARKS & RESULTS
  // ==========================================
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

  // ==========================================
  // 📅 ATTENDANCE
  // ==========================================
  attendance: {
    view: "attendance.view",
    create: "attendance.create",
    update: "attendance.update",
    delete: "attendance.delete",
    bulk: "attendance.bulk",
    export: "attendance.export",
    import: "attendance.import",
  },

  // ==========================================
  // 💰 FINANCIAL - FEES & LEDGER
  // ==========================================
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

  // ==========================================
  // 📚 ACADEMIC RESOURCES
  // ==========================================
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

  // ==========================================
  // 📝 ASSIGNMENTS & HOMEWORK
  // ==========================================
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

  // ==========================================
  // 🎯 QUIZZES & EXAMS
  // ==========================================
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

  // ==========================================
  // 📆 TIMETABLE
  // ==========================================
  timetable: {
    view: "timetable.view",
    create: "timetable.create",
    update: "timetable.update",
    delete: "timetable.delete",
    generateAI: "timetable.generateAI",
  },

  // ==========================================
  // 🚌 TRANSPORT
  // ==========================================
  buses: {
    view: "buses.view",
    create: "buses.create",
    update: "buses.update",
    delete: "buses.delete",
  },

  // ==========================================
  // 🏫 SCHOOL MANAGEMENT
  // ==========================================
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

  // ==========================================
  // 📋 BEHAVIOR & DISCIPLINE
  // ==========================================
  behavior: {
    view: "behavior.view",
    create: "behavior.create",
    update: "behavior.update",
    delete: "behavior.delete",
  },

  // ==========================================
  // 🏖️ LEAVE MANAGEMENT
  // ==========================================
  leave: {
    view: "leave.view",
    apply: "leave.apply",
    approve: "leave.approve",
    reject: "leave.reject",
    manage: "leave.manage",
  },

  // ==========================================
  // 🎓 ADMISSIONS
  // ==========================================
  admissions: {
    view: "admissions.view",
    create: "admissions.create",
    update: "admissions.update",
    approve: "admissions.approve",
    reject: "admissions.reject",
  },

  // ==========================================
  // 📊 REPORTS & ANALYTICS
  // ==========================================
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

  // ==========================================
  // 🤖 AI FEATURES
  // ==========================================
  ai: {
    chatbot: "ai.chatbot",
    examQuestions: "ai.examQuestions",
    examPaper: "ai.examPaper",
    reportComments: "ai.reportComments",
    timetable: "ai.timetable",
    smartBookCenter: "ai.smartBookCenter",
  },

  // ==========================================
  // 📷 OCR
  // ==========================================
  ocr: {
    use: "ocr.use",
    extract: "ocr.extract",
  },

  // ==========================================
  // 💬 CHAT & COMMUNICATION
  // ==========================================
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

  // ==========================================
  // ⚙️ SETTINGS & CONFIGURATION
  // ==========================================
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

  // ==========================================
  // 👥 USER MANAGEMENT
  // ==========================================
  users: {
    view: "users.view",
    create: "users.create",
    update: "users.update",
    delete: "users.delete",
    manageRoles: "users.manageRoles",
    registerSchool: "users.registerSchool",
  },

  // ==========================================
  // 🛡️ ADMIN OPERATIONS
  // ==========================================
  admin: {
    rebuildStats: "admin.rebuildStats",
    deleteStudent: "admin.deleteStudent",
    manageParents: "admin.manageParents",
    superAnalytics: "admin.superAnalytics",
  },

  // ==========================================
  // 💳 SUBSCRIPTIONS & BILLING
  // ==========================================
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

  // ==========================================
  // 📜 CERTIFICATES & DOCUMENTS
  // ==========================================
  certificates: {
    view: "certificates.view",
    create: "certificates.create",
    issue: "certificates.issue",
  },

  // ==========================================
  // 📁 FILE OPERATIONS
  // ==========================================
  upload: {
    use: "upload.use",
    manage: "upload.manage",
  },

  // ==========================================
  // 🔄 CRON & JOBS (System Level)
  // ==========================================
  jobs: {
    trigger: "jobs.trigger",
    view: "jobs.view",
  },

  // ==========================================
  // 🔒 GDPR & COMPLIANCE
  // ==========================================
  gdpr: {
    export: "gdpr.export",
    delete: "gdpr.delete",
  },

  // ==========================================
  // 🎯 PROTECTED DATA (Special)
  // ==========================================
  protectedData: {
    access: "protectedData.access",
  },
} as const;

// ==========================================
// TYPE DEFINITIONS
// ==========================================

// Extract all permission strings as a union type
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS][keyof typeof PERMISSIONS[keyof typeof PERMISSIONS]];

// Permission categories
export type PermissionCategory = keyof typeof PERMISSIONS;

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
      permissions.push(permission);
    }
  }
  return permissions;
}

/**
 * Get permissions for a specific category
 */
export function getCategoryPermissions(category: PermissionCategory): Permission[] {
  return Object.values(PERMISSIONS[category]) as Permission[];
}

/**
 * Check if a string is a valid permission
 */
export function isValidPermission(permission: string): permission is Permission {
  return getAllPermissions().includes(permission as Permission);
}

/**
 * Get permission description (for UI display)
 */
export function getPermissionDescription(permission: Permission): string {
  const [resource, action] = permission.split(".");
  
  const actionLabels: Record<string, string> = {
    view: "View",
    create: "Create",
    update: "Update",
    delete: "Delete",
    export: "Export",
    import: "Import",
    bulk: "Bulk Operations",
    publish: "Publish",
    approve: "Approve",
    reject: "Reject",
    manage: "Manage",
    generate: "Generate",
    collect: "Collect",
    waive: "Waive",
    refund: "Refund",
    grade: "Grade",
    apply: "Apply",
    send: "Send",
    use: "Use",
    access: "Access",
    trigger: "Trigger",
    activate: "Activate",
    issue: "Issue",
    load: "Load",
    preview: "Preview",
  };

  const resourceLabels: Record<string, string> = {
    students: "Students",
    staff: "Staff",
    parents: "Parents",
    marks: "Marks",
    attendance: "Attendance",
    fees: "Fees",
    ledger: "Financial Ledger",
    syllabus: "Syllabus",
    curriculum: "Curriculum",
    books: "Books",
    lessonPlans: "Lesson Plans",
    assignments: "Assignments",
    homework: "Homework",
    quizzes: "Quizzes",
    admitCards: "Admit Cards",
    timetable: "Timetable",
    buses: "Transport",
    classes: "Classes",
    sections: "Sections",
    academicYear: "Academic Year",
    behavior: "Behavior Records",
    leave: "Leave Management",
    admissions: "Admissions",
    reports: "Reports",
    analytics: "Analytics",
    audit: "Audit Logs",
    ai: "AI Features",
    ocr: "OCR",
    chat: "Chat",
    notifications: "Notifications",
    settings: "Settings",
    menu: "Menu",
    featureFlags: "Feature Flags",
    users: "Users",
    admin: "Admin Operations",
    subscriptions: "Subscriptions",
    addons: "Add-ons",
    certificates: "Certificates",
    upload: "File Upload",
    jobs: "Background Jobs",
    gdpr: "GDPR",
    protectedData: "Protected Data",
  };

  return `${actionLabels[action] || action} ${resourceLabels[resource] || resource}`;
}
