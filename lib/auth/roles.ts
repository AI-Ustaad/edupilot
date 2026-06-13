// lib/auth/roles.ts
// ==========================================
// 👥 ROLE DEFINITIONS & PERMISSION MAPPINGS
// ==========================================

import type { Permission } from "./permissions";
import { PERMISSIONS } from "./permissions";

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
    ...Object.values(PERMISSIONS).flatMap(category => Object.values(category)),
  ],

  // ==========================================
  // ADMIN - School Level Full Access
  // ==========================================
  [ROLES.ADMIN]: [
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
    PERMISSIONS.staff.view,
    PERMISSIONS.staff.create,
    PERMISSIONS.staff.update,
    PERMISSIONS.staff.delete,
    PERMISSIONS.staff.export,
    PERMISSIONS.staff.import,
    PERMISSIONS.staff.bulk,
    PERMISSIONS.staff.managePayroll,
    PERMISSIONS.parents.view,
    PERMISSIONS.parents.create,
    PERMISSIONS.parents.update,
    PERMISSIONS.parents.delete,
    PERMISSIONS.parents.export,
    PERMISSIONS.parents.import,
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
    PERMISSIONS.quizzes.delete,
    PERMISSIONS.quizzes.publish,
    PERMISSIONS.quizzes.grade,
    PERMISSIONS.admitCards.view,
    PERMISSIONS.admitCards.create,
    PERMISSIONS.admitCards.bulk,
    PERMISSIONS.admitCards.export,
    PERMISSIONS.timetable.view,
    PERMISSIONS.timetable.create,
    PERMISSIONS.timetable.update,
    PERMISSIONS.timetable.delete,
    PERMISSIONS.timetable.generateAI,
    PERMISSIONS.buses.view,
    PERMISSIONS.buses.create,
    PERMISSIONS.buses.update,
    PERMISSIONS.buses.delete,
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
    PERMISSIONS.behavior.view,
    PERMISSIONS.behavior.create,
    PERMISSIONS.behavior.update,
    PERMISSIONS.behavior.delete,
    PERMISSIONS.leave.view,
    PERMISSIONS.leave.apply,
    PERMISSIONS.leave.approve,
    PERMISSIONS.leave.reject,
    PERMISSIONS.leave.manage,
    PERMISSIONS.admissions.view,
    PERMISSIONS.admissions.create,
    PERMISSIONS.admissions.update,
    PERMISSIONS.admissions.approve,
    PERMISSIONS.admissions.reject,
    PERMISSIONS.reports.view,
    PERMISSIONS.reports.create,
    PERMISSIONS.reports.generate,
    PERMISSIONS.reports.export,
    PERMISSIONS.analytics.view,
    PERMISSIONS.analytics.viewAdvanced,
    PERMISSIONS.analytics.export,
    PERMISSIONS.audit.view,
    PERMISSIONS.audit.export,
    PERMISSIONS.ai.chatbot,
    PERMISSIONS.ai.examQuestions,
    PERMISSIONS.ai.examPaper,
    PERMISSIONS.ai.reportComments,
    PERMISSIONS.ai.timetable,
    PERMISSIONS.ai.smartBookCenter,
    PERMISSIONS.ocr.use,
    PERMISSIONS.ocr.extract,
    PERMISSIONS.chat.view,
    PERMISSIONS.chat.send,
    PERMISSIONS.chat.manage,
    PERMISSIONS.notifications.view,
    PERMISSIONS.notifications.send,
    PERMISSIONS.notifications.manage,
    PERMISSIONS.settings.view,
    PERMISSIONS.settings.update,
    PERMISSIONS.settings.manageWhitelabel,
    PERMISSIONS.settings.manageAddons,
    PERMISSIONS.settings.manageBilling,
    PERMISSIONS.menu.view,
    PERMISSIONS.menu.update,
    PERMISSIONS.featureFlags.view,
    PERMISSIONS.featureFlags.update,
    PERMISSIONS.users.view,
    PERMISSIONS.users.create,
    PERMISSIONS.users.update,
    PERMISSIONS.users.delete,
    PERMISSIONS.users.manageRoles,
    PERMISSIONS.subscriptions.view,
    PERMISSIONS.subscriptions.manage,
    PERMISSIONS.subscriptions.activate,
    PERMISSIONS.addons.view,
    PERMISSIONS.addons.purchase,
    PERMISSIONS.addons.manage,
    PERMISSIONS.certificates.view,
    PERMISSIONS.certificates.create,
    PERMISSIONS.certificates.issue,
    PERMISSIONS.upload.use,
    PERMISSIONS.upload.manage,
    PERMISSIONS.gdpr.export,
    PERMISSIONS.gdpr.delete,
    PERMISSIONS.protectedData.access,
  ],

  // ==========================================
  // PRINCIPAL - Academic Oversight
  // ==========================================
  [ROLES.PRINCIPAL]: [
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
    PERMISSIONS.reports.view,
    PERMISSIONS.reports.create,
    PERMISSIONS.reports.generate,
    PERMISSIONS.reports.export,
    PERMISSIONS.analytics.view,
    PERMISSIONS.analytics.viewAdvanced,
    PERMISSIONS.analytics.export,
    PERMISSIONS.audit.view,
    PERMISSIONS.ai.chatbot,
    PERMISSIONS.ai.examQuestions,
    PERMISSIONS.ai.examPaper,
    PERMISSIONS.ai.reportComments,
    PERMISSIONS.ai.timetable,
    PERMISSIONS.ai.smartBookCenter,
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
    PERMISSIONS.certificates.issue,
    PERMISSIONS.upload.use,
  ],

  // ==========================================
  // TEACHER - Classroom Management
  // ==========================================
  [ROLES.TEACHER]: [
    PERMISSIONS.students.view,
    PERMISSIONS.students.view360,
    PERMISSIONS.marks.view,
    PERMISSIONS.marks.create,
    PERMISSIONS.marks.update,
    PERMISSIONS.marks.export,
    PERMISSIONS.marks.manageSkills,
    PERMISSIONS.attendance.view,
    PERMISSIONS.attendance.create,
    PERMISSIONS.attendance.update,
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

  // ==========================================
  // ACCOUNTANT - Financial Management
  // ==========================================
  [ROLES.ACCOUNTANT]: [
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

  // ==========================================
  // PARENT - Child Access Only
  // ==========================================
  [ROLES.PARENT]: [
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

  // ==========================================
  // STUDENT - Self Access Only
  // ==========================================
  [ROLES.STUDENT]: [
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

  // ==========================================
  // GUEST - Minimal Access
  // ==========================================
  [ROLES.GUEST]: [
    PERMISSIONS.settings.view,
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
