// lib/auth/roles.ts
// ==========================================
// 👥 ROLE DEFINITIONS & PERMISSION MAPPINGS
// ==========================================

import { PERMISSIONS, type Permission } from "./permissions";

/**
 * Available Roles in EduPilot
 */
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  PRINCIPAL: "principal",
  VICE_PRINCIPAL: "vice_principal",
  TEACHER: "teacher",
  ACCOUNTANT: "accountant",
  LIBRARIAN: "librarian",
  CLERK: "clerk",
  PARENT: "parent",
  STUDENT: "student",
  GUEST: "guest",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

/**
 * Role Hierarchy (higher number = more power)
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  [ROLES.SUPER_ADMIN]: 100,
  [ROLES.ADMIN]: 90,
  [ROLES.PRINCIPAL]: 80,
  [ROLES.VICE_PRINCIPAL]: 70,
  [ROLES.ACCOUNTANT]: 60,
  [ROLES.TEACHER]: 50,
  [ROLES.LIBRARIAN]: 40,
  [ROLES.CLERK]: 30,
  [ROLES.PARENT]: 20,
  [ROLES.STUDENT]: 10,
  [ROLES.GUEST]: 0,
};

/**
 * Role Permission Mappings
 * Each role gets specific permissions
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  // ==========================================
  // SUPER ADMIN - Full System Access
  // ==========================================
  [ROLES.SUPER_ADMIN]: [
    // All permissions
    ...Object.values(PERMISSIONS).flatMap(category => Object.values(category)),
  ],

  // ==========================================
  // ADMIN - School Level Full Access
  // ==========================================
  [ROLES.ADMIN]: [
    // Students - Full
    PERMISSIONS.students.view,
    PERMISSIONS.students.create,
    PERMISSIONS.students.update,
    PERMISSIONS.students.delete,
    PERMISSIONS.students.export,
    PERMISSIONS.students.import,
    PERMISSIONS.students.bulk,
    PERMISSIONS.students.promote,
    PERMISSIONS.students.view360,
    PERMISSIONS.students.viewRisk,
    PERMISSIONS.students.ocrAdmission,

    // Staff - Full
    PERMISSIONS.staff.view,
    PERMISSIONS.staff.create,
    PERMISSIONS.staff.update,
    PERMISSIONS.staff.delete,
    PERMISSIONS.staff.export,
    PERMISSIONS.staff.import,
    PERMISSIONS.staff.bulk,
    PERMISSIONS.staff.managePayroll,

    // Parents - Full
    PERMISSIONS.parents.view,
    PERMISSIONS.parents.create,
    PERMISSIONS.parents.update,
    PERMISSIONS.parents.delete,
    PERMISSIONS.parents.export,
    PERMISSIONS.parents.import,

    // Academic - Full
    PERMISSIONS.marks.view,
    PERMISSIONS.marks.create,
    PERMISSIONS.marks.update,
    PERMISSIONS.marks.delete,
    PERMISSIONS.marks.bulk,
    PERMISSIONS.marks.publish,
    PERMISSIONS.marks.export,
    PERMISSIONS.marks.import,
    PERMISSIONS.marks.manageSkills,

    PERMISSIONS.attendance.view,
    PERMISSIONS.attendance.create,
    PERMISSIONS.attendance.update,
    PERMISSIONS.attendance.delete,
    PERMISSIONS.attendance.bulk,
    PERMISSIONS.attendance.export,
    PERMISSIONS.attendance.import,

    // Financial - Full
    PERMISSIONS.fees.view,
    PERMISSIONS.fees.create,
    PERMISSIONS.fees.update,
    PERMISSIONS.fees.delete,
    PERMISSIONS.fees.bulk,
    PERMISSIONS.fees.export,
    PERMISSIONS.fees.import,
    PERMISSIONS.fees.collect,
    PERMISSIONS.fees.waive,
    PERMISSIONS.fees.refund,

    PERMISSIONS.ledger.view,
    PERMISSIONS.ledger.create,
    PERMISSIONS.ledger.update,
    PERMISSIONS.ledger.delete,
    PERMISSIONS.ledger.export,

    // Academic Resources - Full
    PERMISSIONS.syllabus.view,
    PERMISSIONS.syllabus.create,
    PERMISSIONS.syllabus.update,
    PERMISSIONS.syllabus.delete,
    PERMISSIONS.syllabus.publish,

    PERMISSIONS.curriculum.view,
    PERMISSIONS.curriculum.create,
    PERMISSIONS.curriculum.update,
    PERMISSIONS.curriculum.delete,
    PERMISSIONS.curriculum.load,
    PERMISSIONS.curriculum.preview,

    PERMISSIONS.books.view,
    PERMISSIONS.books.create,
    PERMISSIONS.books.update,
    PERMISSIONS.books.delete,
    PERMISSIONS.books.manage,

    PERMISSIONS.lessonPlans.view,
    PERMISSIONS.lessonPlans.create,
    PERMISSIONS.lessonPlans.update,
    PERMISSIONS.lessonPlans.delete,
    PERMISSIONS.lessonPlans.publish,

    // Assignments & Homework
    PERMISSIONS.assignments.view,
    PERMISSIONS.assignments.create,
    PERMISSIONS.assignments.update,
    PERMISSIONS.assignments.delete,
    PERMISSIONS.assignments.grade,

    PERMISSIONS.homework.view,
    PERMISSIONS.homework.create,
    PERMISSIONS.homework.update,
    PERMISSIONS.homework.delete,

    // Quizzes & Exams
    PERMISSIONS.quizzes.view,
    PERMISSIONS.quizzes.create,
    PERMISSIONS.quizzes.update,
    PERMISSIONS.quizzes.delete,
    PERMISSIONS.quizzes.publish,
    PERMISSIONS.quizzes.grade,

    PERMISSIONS.admitCards.view,
    PERMISSIONS.admitCards.create,
    PERMISSIONS.admitCards.bulk,
    PERMISSIONS.admitCards.export,

    // Timetable
    PERMISSIONS.timetable.view,
    PERMISSIONS.timetable.create,
    PERMISSIONS.timetable.update,
    PERMISSIONS.timetable.delete,
    PERMISSIONS.timetable.generateAI,

    // Transport
    PERMISSIONS.buses.view,
    PERMISSIONS.buses.create,
    PERMISSIONS.buses.update,
    PERMISSIONS.buses.delete,

    // School Management
    PERMISSIONS.classes.view,
    PERMISSIONS.classes.create,
    PERMISSIONS.classes.update,
    PERMISSIONS.classes.delete,

    PERMISSIONS.sections.view,
    PERMISSIONS.sections.create,
    PERMISSIONS.sections.update,
    PERMISSIONS.sections.delete,

    PERMISSIONS.academicYear.view,
    PERMISSIONS.academicYear.create,
    PERMISSIONS.academicYear.update,
    PERMISSIONS.academicYear.delete,
    PERMISSIONS.academicYear.activate,

    // Behavior & Leave
    PERMISSIONS.behavior.view,
    PERMISSIONS.behavior.create,
    PERMISSIONS.behavior.update,
    PERMISSIONS.behavior.delete,

    PERMISSIONS.leave.view,
    PERMISSIONS.leave.apply,
    PERMISSIONS.leave.approve,
    PERMISSIONS.leave.reject,
    PERMISSIONS.leave.manage,

    // Admissions
    PERMISSIONS.admissions.view,
    PERMISSIONS.admissions.create,
    PERMISSIONS.admissions.update,
    PERMISSIONS.admissions.approve,
    PERMISSIONS.admissions.reject,

    // Reports & Analytics
    PERMISSIONS.reports.view,
    PERMISSIONS.reports.create,
    PERMISSIONS.reports.generate,
    PERMISSIONS.reports.export,

    PERMISSIONS.analytics.view,
    PERMISSIONS.analytics.viewAdvanced,
    PERMISSIONS.analytics.export,

    PERMISSIONS.audit.view,
    PERMISSIONS.audit.export,

    // AI Features
    PERMISSIONS.ai.chatbot,
    PERMISSIONS.ai.examQuestions,
    PERMISSIONS.ai.examPaper,
    PERMISSIONS.ai.reportComments,
    PERMISSIONS.ai.timetable,
    PERMISSIONS.ai.smartBookCenter,

    // OCR
    PERMISSIONS.ocr.use,
    PERMISSIONS.ocr.extract,

    // Chat & Notifications
    PERMISSIONS.chat.view,
    PERMISSIONS.chat.send,
    PERMISSIONS.chat.manage,

    PERMISSIONS.notifications.view,
    PERMISSIONS.notifications.send,
    PERMISSIONS.notifications.manage,

    // Settings
    PERMISSIONS.settings.view,
    PERMISSIONS.settings.update,
    PERMISSIONS.settings.manageWhitelabel,
    PERMISSIONS.settings.manageAddons,
    PERMISSIONS.settings.manageBilling,

    PERMISSIONS.menu.view,
    PERMISSIONS.menu.update,
    PERMISSIONS.featureFlags.view,
    PERMISSIONS.featureFlags.update,

    // Users
    PERMISSIONS.users.view,
    PERMISSIONS.users.create,
    PERMISSIONS.users.update,
    PERMISSIONS.users.delete,
    PERMISSIONS.users.manageRoles,

    // Subscriptions
    PERMISSIONS.subscriptions.view,
    PERMISSIONS.subscriptions.manage,
    PERMISSIONS.subscriptions.activate,

    PERMISSIONS.addons.view,
    PERMISSIONS.addons.purchase,
    PERMISSIONS.addons.manage,

    // Certificates
    PERMISSIONS.certificates.view,
    PERMISSIONS.certificates.create,
    PERMISSIONS.certificates.issue,

    // Upload
    PERMISSIONS.upload.use,
    PERMISSIONS.upload.manage,

    // GDPR
    PERMISSIONS.gdpr.export,
    PERMISSIONS.gdpr.delete,

    // Protected Data
    PERMISSIONS.protectedData.access,
  ],

  // ==========================================
  // PRINCIPAL - Academic Oversight
  // ==========================================
  [ROLES.PRINCIPAL]: [
    // View all academic data
    PERMISSIONS.students.view,
    PERMISSIONS.students.view360,
    PERMISSIONS.students.viewRisk,
    PERMISSIONS.students.export,

    PERMISSIONS.staff.view,
    PERMISSIONS.parents.view,

    PERMISSIONS.marks.view,
    PERMISSIONS.marks.publish,
    PERMISSIONS.marks.export,

    PERMISSIONS.attendance.view,
    PERMISSIONS.attendance.export,

    PERMISSIONS.fees.view,
    PERMISSIONS.fees.export,

    PERMISSIONS.ledger.view,

    // Academic management
    PERMISSIONS.syllabus.view,
    PERMISSIONS.syllabus.create,
    PERMISSIONS.syllabus.update,
    PERMISSIONS.syllabus.publish,

    PERMISSIONS.curriculum.view,
    PERMISSIONS.curriculum.create,
    PERMISSIONS.curriculum.update,

    PERMISSIONS.books.view,
    PERMISSIONS.books.manage,

    PERMISSIONS.lessonPlans.view,
    PERMISSIONS.lessonPlans.create,
    PERMISSIONS.lessonPlans.update,
    PERMISSIONS.lessonPlans.publish,

    PERMISSIONS.assignments.view,
    PERMISSIONS.assignments.create,
    PERMISSIONS.assignments.update,
    PERMISSIONS.assignments.delete,
    PERMISSIONS.assignments.grade,

    PERMISSIONS.homework.view,
    PERMISSIONS.homework.create,
    PERMISSIONS.homework.update,
    PERMISSIONS.homework.delete,

    PERMISSIONS.quizzes.view,
    PERMISSIONS.quizzes.create,
    PERMISSIONS.quizzes.update,
    PERMISSIONS.quizzes.publish,
    PERMISSIONS.quizzes.grade,

    PERMISSIONS.admitCards.view,
    PERMISSIONS.admitCards.create,
    PERMISSIONS.admitCards.bulk,

    PERMISSIONS.timetable.view,
    PERMISSIONS.timetable.create,
    PERMISSIONS.timetable.update,
    PERMISSIONS.timetable.generateAI,

    PERMISSIONS.classes.view,
    PERMISSIONS.sections.view,
    PERMISSIONS.academicYear.view,

    PERMISSIONS.behavior.view,
    PERMISSIONS.behavior.create,
    PERMISSIONS.behavior.update,

    PERMISSIONS.leave.view,
    PERMISSIONS.leave.approve,
    PERMISSIONS.leave.reject,

    PERMISSIONS.admissions.view,
    PERMISSIONS.admissions.approve,
    PERMISSIONS.admissions.reject,

    // Reports
    PERMISSIONS.reports.view,
    PERMISSIONS.reports.create,
    PERMISSIONS.reports.generate,
    PERMISSIONS.reports.export,

    PERMISSIONS.analytics.view,
    PERMISSIONS.analytics.viewAdvanced,
    PERMISSIONS.analytics.export,

    PERMISSIONS.audit.view,

    // AI
    PERMISSIONS.ai.chatbot,
    PERMISSIONS.ai.examQuestions,
    PERMISSIONS.ai.examPaper,
    PERMISSIONS.ai.reportComments,
    PERMISSIONS.ai.timetable,
    PERMISSIONS.ai.smartBookCenter,

    PERMISSIONS.ocr.use,

    // Communication
    PERMISSIONS.chat.view,
    PERMISSIONS.chat.send,
    PERMISSIONS.notifications.view,
    PERMISSIONS.notifications.send,

    // Settings (read-only mostly)
    PERMISSIONS.settings.view,
    PERMISSIONS.menu.view,
    PERMISSIONS.featureFlags.view,

    PERMISSIONS.certificates.view,
    PERMISSIONS.certificates.create,
    PERMISSIONS.certificates.issue,

    PERMISSIONS.upload.use,
  ],

  // ==========================================
  // VICE PRINCIPAL - Similar to Principal
  // ==========================================
  [ROLES.VICE_PRINCIPAL]: [
    ...Object.values(PERMISSIONS.students).filter(p => 
      !p.includes("delete") && !p.includes("promote")
    ),
    PERMISSIONS.staff.view,
    PERMISSIONS.parents.view,
    ...Object.values(PERMISSIONS.marks).filter(p => !p.includes("delete")),
    ...Object.values(PERMISSIONS.attendance).filter(p => !p.includes("delete")),
    PERMISSIONS.fees.view,
    PERMISSIONS.ledger.view,
    ...Object.values(PERMISSIONS.syllabus),
    ...Object.values(PERMISSIONS.curriculum),
    ...Object.values(PERMISSIONS.books),
    ...Object.values(PERMISSIONS.lessonPlans),
    ...Object.values(PERMISSIONS.assignments),
    ...Object.values(PERMISSIONS.homework),
    ...Object.values(PERMISSIONS.quizzes),
    PERMISSIONS.admitCards.view,
    PERMISSIONS.admitCards.create,
    PERMISSIONS.admitCards.bulk,
    ...Object.values(PERMISSIONS.timetable),
    PERMISSIONS.classes.view,
    PERMISSIONS.sections.view,
    PERMISSIONS.academicYear.view,
    ...Object.values(PERMISSIONS.behavior),
    ...Object.values(PERMISSIONS.leave),
    ...Object.values(PERMISSIONS.admissions),
    ...Object.values(PERMISSIONS.reports),
    PERMISSIONS.analytics.view,
    PERMISSIONS.audit.view,
    ...Object.values(PERMISSIONS.ai),
    PERMISSIONS.ocr.use,
    PERMISSIONS.chat.view,
    PERMISSIONS.chat.send,
    PERMISSIONS.notifications.view,
    PERMISSIONS.notifications.send,
    PERMISSIONS.settings.view,
    PERMISSIONS.menu.view,
    PERMISSIONS.featureFlags.view,
    PERMISSIONS.certificates.view,
    PERMISSIONS.certificates.create,
    PERMISSIONS.upload.use,
  ],

  // ==========================================
  // TEACHER - Classroom Management
  // ==========================================
  [ROLES.TEACHER]: [
    // Students - View only (assigned classes)
    PERMISSIONS.students.view,
    PERMISSIONS.students.view360,

    // Marks - Full for assigned classes
    PERMISSIONS.marks.view,
    PERMISSIONS.marks.create,
    PERMISSIONS.marks.update,
    PERMISSIONS.marks.export,
    PERMISSIONS.marks.manageSkills,

    // Attendance - Full for assigned classes
    PERMISSIONS.attendance.view,
    PERMISSIONS.attendance.create,
    PERMISSIONS.attendance.update,

    // Academic Resources
    PERMISSIONS.syllabus.view,
    PERMISSIONS.curriculum.view,
    PERMISSIONS.books.view,

    PERMISSIONS.lessonPlans.view,
    PERMISSIONS.lessonPlans.create,
    PERMISSIONS.lessonPlans.update,

    PERMISSIONS.assignments.view,
    PERMISSIONS.assignments.create,
    PERMISSIONS.assignments.update,
    PERMISSIONS.assignments.grade,

    PERMISSIONS.homework.view,
    PERMISSIONS.homework.create,
    PERMISSIONS.homework.update,

    PERMISSIONS.quizzes.view,
    PERMISSIONS.quizzes.create,
    PERMISSIONS.quizzes.update,
    PERMISSIONS.quizzes.grade,

    PERMISSIONS.admitCards.view,

    PERMISSIONS.timetable.view,

    PERMISSIONS.classes.view,
    PERMISSIONS.sections.view,

    PERMISSIONS.behavior.view,
    PERMISSIONS.behavior.create,
    PERMISSIONS.behavior.update,

    PERMISSIONS.leave.view,
    PERMISSIONS.leave.apply,

    // Reports
    PERMISSIONS.reports.view,
    PERMISSIONS.reports.generate,

    PERMISSIONS.analytics.view,

    // AI
    PERMISSIONS.ai.chatbot,
    PERMISSIONS.ai.examQuestions,
    PERMISSIONS.ai.examPaper,
    PERMISSIONS.ai.reportComments,
    PERMISSIONS.ai.smartBookCenter,

    // Communication
    PERMISSIONS.chat.view,
    PERMISSIONS.chat.send,
    PERMISSIONS.notifications.view,

    PERMISSIONS.settings.view,
    PERMISSIONS.menu.view,

    PERMISSIONS.certificates.view,
    PERMISSIONS.upload.use,
  ],

  // ==========================================
  // ACCOUNTANT - Financial Management
  // ==========================================
  [ROLES.ACCOUNTANT]: [
    PERMISSIONS.students.view,
    PERMISSIONS.staff.view,
    PERMISSIONS.parents.view,

    // Full financial access
    ...Object.values(PERMISSIONS.fees),
    ...Object.values(PERMISSIONS.ledger),

    PERMISSIONS.reports.view,
    PERMISSIONS.reports.create,
    PERMISSIONS.reports.generate,
    PERMISSIONS.reports.export,

    PERMISSIONS.analytics.view,
    PERMISSIONS.analytics.viewAdvanced,
    PERMISSIONS.analytics.export,

    PERMISSIONS.audit.view,
    PERMISSIONS.audit.export,

    PERMISSIONS.chat.view,
    PERMISSIONS.chat.send,
    PERMISSIONS.notifications.view,
    PERMISSIONS.notifications.send,

    PERMISSIONS.settings.view,
    PERMISSIONS.menu.view,

    PERMISSIONS.upload.use,
  ],

  // ==========================================
  // LIBRARIAN - Book Management
  // ==========================================
  [ROLES.LIBRARIAN]: [
    PERMISSIONS.students.view,
    PERMISSIONS.staff.view,

    ...Object.values(PERMISSIONS.books),

    PERMISSIONS.chat.view,
    PERMISSIONS.chat.send,
    PERMISSIONS.notifications.view,

    PERMISSIONS.settings.view,
    PERMISSIONS.menu.view,

    PERMISSIONS.upload.use,
  ],

  // ==========================================
  // CLERK - Administrative Support
  // ==========================================
  [ROLES.CLERK]: [
    PERMISSIONS.students.view,
    PERMISSIONS.students.create,
    PERMISSIONS.students.update,
    PERMISSIONS.students.export,
    PERMISSIONS.students.import,

    PERMISSIONS.staff.view,
    PERMISSIONS.parents.view,
    PERMISSIONS.parents.create,
    PERMISSIONS.parents.update,

    PERMISSIONS.marks.view,
    PERMISSIONS.attendance.view,
    PERMISSIONS.attendance.create,
    PERMISSIONS.attendance.update,

    PERMISSIONS.fees.view,
    PERMISSIONS.fees.create,
    PERMISSIONS.fees.collect,

    PERMISSIONS.admissions.view,
    PERMISSIONS.admissions.create,
    PERMISSIONS.admissions.update,

    PERMISSIONS.classes.view,
    PERMISSIONS.sections.view,

    PERMISSIONS.reports.view,
    PERMISSIONS.reports.generate,

    PERMISSIONS.chat.view,
    PERMISSIONS.chat.send,
    PERMISSIONS.notifications.view,
    PERMISSIONS.notifications.send,

    PERMISSIONS.settings.view,
    PERMISSIONS.menu.view,

    PERMISSIONS.certificates.view,
    PERMISSIONS.certificates.create,

    PERMISSIONS.upload.use,
  ],

  // ==========================================
  // PARENT - Child Access Only
  // ==========================================
  [ROLES.PARENT]: [
    PERMISSIONS.students.view, // Only own children
    PERMISSIONS.students.view360,

    PERMISSIONS.marks.view,
    PERMISSIONS.attendance.view,
    PERMISSIONS.fees.view,
    PERMISSIONS.ledger.view,

    PERMISSIONS.syllabus.view,
    PERMISSIONS.curriculum.view,
    PERMISSIONS.books.view,
    PERMISSIONS.lessonPlans.view,

    PERMISSIONS.assignments.view,
    PERMISSIONS.homework.view,
    PERMISSIONS.quizzes.view,

    PERMISSIONS.timetable.view,

    PERMISSIONS.behavior.view,

    PERMISSIONS.leave.view,
    PERMISSIONS.leave.apply,

    PERMISSIONS.reports.view,
    PERMISSIONS.reports.generate,

    PERMISSIONS.ai.chatbot,
    PERMISSIONS.ai.smartBookCenter,

    PERMISSIONS.chat.view,
    PERMISSIONS.chat.send,
    PERMISSIONS.notifications.view,

    PERMISSIONS.settings.view,
    PERMISSIONS.menu.view,

    PERMISSIONS.certificates.view,
  ],

  // ==========================================
  // STUDENT - Self Access Only
  // ==========================================
  [ROLES.STUDENT]: [
    PERMISSIONS.students.view, // Own profile
    PERMISSIONS.students.view360,

    PERMISSIONS.marks.view,
    PERMISSIONS.attendance.view,
    PERMISSIONS.fees.view,

    PERMISSIONS.syllabus.view,
    PERMISSIONS.books.view,
    PERMISSIONS.lessonPlans.view,

    PERMISSIONS.assignments.view,
    PERMISSIONS.homework.view,
    PERMISSIONS.quizzes.view,

    PERMISSIONS.timetable.view,

    PERMISSIONS.reports.view,

    PERMISSIONS.ai.chatbot,
    PERMISSIONS.ai.smartBookCenter,

    PERMISSIONS.chat.view,
    PERMISSIONS.chat.send,
    PERMISSIONS.notifications.view,

    PERMISSIONS.settings.view,
    PERMISSIONS.menu.view,
  ],

  // ==========================================
  // GUEST - Minimal Access
  // ==========================================
  [ROLES.GUEST]: [
    PERMISSIONS.settings.view, // Public settings only
    PERMISSIONS.menu.view,
  ],
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: Role, permission: Permission): boolean {
  // Super admin has all permissions
  if (role === ROLES.SUPER_ADMIN) return true;
  
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if role1 has higher or equal hierarchy than role2
 */
export function isRoleHigherOrEqual(role1: Role, role2: Role): boolean {
  return ROLE_HIERARCHY[role1] >= ROLE_HIERARCHY[role2];
}

/**
 * Get all roles that have a specific permission
 */
export function getRolesWithPermission(permission: Permission): Role[] {
  return Object.keys(ROLE_PERMISSIONS).filter(role =>
    ROLE_PERMISSIONS[role as Role].includes(permission)
  ) as Role[];
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: Role): string {
  const names: Record<Role, string> = {
    [ROLES.SUPER_ADMIN]: "Super Administrator",
    [ROLES.ADMIN]: "Administrator",
    [ROLES.PRINCIPAL]: "Principal",
    [ROLES.VICE_PRINCIPAL]: "Vice Principal",
    [ROLES.TEACHER]: "Teacher",
    [ROLES.ACCOUNTANT]: "Accountant",
    [ROLES.LIBRARIAN]: "Librarian",
    [ROLES.CLERK]: "Clerk",
    [ROLES.PARENT]: "Parent",
    [ROLES.STUDENT]: "Student",
    [ROLES.GUEST]: "Guest",
  };
  return names[role] || role;
}

/**
 * Validate role string
 */
export function isValidRole(role: string): role is Role {
  return Object.values(ROLES).includes(role as Role);
}
// ==========================================
// ROLE → PERMISSION MAPPING
// ==========================================

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    ...Object.values(PERMISSIONS).flatMap(module => Object.values(module)),
  ],
  teacher: [
    PERMISSIONS.students.view,
    PERMISSIONS.students.view360,
    PERMISSIONS.attendance.view,
    PERMISSIONS.attendance.create,
    PERMISSIONS.attendance.update,
    PERMISSIONS.marks.view,
    PERMISSIONS.marks.create,
    PERMISSIONS.marks.update,
    PERMISSIONS.marks.export,
    PERMISSIONS.dashboard.view,
    PERMISSIONS.assignments.view,
    PERMISSIONS.assignments.create,
    PERMISSIONS.assignments.update,
    PERMISSIONS.assignments.grade,
    PERMISSIONS.homework.view,
    PERMISSIONS.homework.create,
    PERMISSIONS.homework.update,
    PERMISSIONS.quizzes.view,
    PERMISSIONS.quizzes.create,
    PERMISSIONS.quizzes.update,
    PERMISSIONS.quizzes.grade,
    PERMISSIONS.timetable.view,
    PERMISSIONS.behavior.view,
    PERMISSIONS.behavior.create,
    PERMISSIONS.behavior.update,
    PERMISSIONS.reports.view,
    PERMISSIONS.reports.generate,
    PERMISSIONS.analytics.view,
    PERMISSIONS.ai.chatbot,
    PERMISSIONS.ai.examQuestions,
    PERMISSIONS.ai.examPaper,
    PERMISSIONS.ai.reportComments,
    PERMISSIONS.ai.smartBookCenter,
    PERMISSIONS.chat.view,
    PERMISSIONS.chat.send,
    PERMISSIONS.notifications.view,
    PERMISSIONS.settings.view,
    PERMISSIONS.menu.view,
    PERMISSIONS.certificates.view,
    PERMISSIONS.upload.use,
  ],
  accountant: [
    PERMISSIONS.students.view,
    PERMISSIONS.staff.view,
    PERMISSIONS.parents.view,
    PERMISSIONS.fees.view,
    PERMISSIONS.fees.create,
    PERMISSIONS.fees.update,
    PERMISSIONS.fees.delete,
    PERMISSIONS.fees.bulk,
    PERMISSIONS.fees.export,
    PERMISSIONS.fees.import,
    PERMISSIONS.fees.collect,
    PERMISSIONS.fees.waive,
    PERMISSIONS.fees.refund,
    PERMISSIONS.ledger.view,
    PERMISSIONS.ledger.create,
    PERMISSIONS.ledger.update,
    PERMISSIONS.ledger.delete,
    PERMISSIONS.ledger.export,
    PERMISSIONS.reports.view,
    PERMISSIONS.reports.create,
    PERMISSIONS.reports.generate,
    PERMISSIONS.reports.export,
    PERMISSIONS.analytics.view,
    PERMISSIONS.analytics.viewAdvanced,
    PERMISSIONS.analytics.export,
    PERMISSIONS.audit.view,
    PERMISSIONS.audit.export,
    PERMISSIONS.chat.view,
    PERMISSIONS.chat.send,
    PERMISSIONS.notifications.view,
    PERMISSIONS.notifications.send,
    PERMISSIONS.settings.view,
    PERMISSIONS.menu.view,
    PERMISSIONS.upload.use,
  ],
  parent: [
    PERMISSIONS.students.view,
    PERMISSIONS.students.view360,
    PERMISSIONS.marks.view,
    PERMISSIONS.attendance.view,
    PERMISSIONS.fees.view,
    PERMISSIONS.ledger.view,
    PERMISSIONS.syllabus.view,
    PERMISSIONS.curriculum.view,
    PERMISSIONS.books.view,
    PERMISSIONS.lessonPlans.view,
    PERMISSIONS.assignments.view,
    PERMISSIONS.homework.view,
    PERMISSIONS.quizzes.view,
    PERMISSIONS.timetable.view,
    PERMISSIONS.behavior.view,
    PERMISSIONS.leave.view,
    PERMISSIONS.leave.apply,
    PERMISSIONS.reports.view,
    PERMISSIONS.reports.generate,
    PERMISSIONS.ai.chatbot,
    PERMISSIONS.ai.smartBookCenter,
    PERMISSIONS.chat.view,
    PERMISSIONS.chat.send,
    PERMISSIONS.notifications.view,
    PERMISSIONS.settings.view,
    PERMISSIONS.menu.view,
    PERMISSIONS.certificates.view,
  ],
  student: [
    PERMISSIONS.students.view,
    PERMISSIONS.students.view360,
    PERMISSIONS.marks.view,
    PERMISSIONS.attendance.view,
    PERMISSIONS.fees.view,
    PERMISSIONS.syllabus.view,
    PERMISSIONS.books.view,
    PERMISSIONS.lessonPlans.view,
    PERMISSIONS.assignments.view,
    PERMISSIONS.homework.view,
    PERMISSIONS.quizzes.view,
    PERMISSIONS.timetable.view,
    PERMISSIONS.reports.view,
    PERMISSIONS.ai.chatbot,
    PERMISSIONS.ai.smartBookCenter,
    PERMISSIONS.chat.view,
    PERMISSIONS.chat.send,
    PERMISSIONS.notifications.view,
    PERMISSIONS.settings.view,
    PERMISSIONS.menu.view,
  ],
};
