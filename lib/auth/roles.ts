import { PERMISSIONS, Permission } from "./permissions";

export const ROLES = {
  SUPER_ADMIN: "superAdmin", // Global SaaS Owner
  ADMIN: "admin",            // School Principal / Manager
  TEACHER: "teacher",        // Teaching Staff
  ACCOUNTANT: "accountant",  // Finance / Fee Manager
  PARENT: "parent",          // Guardian
  STUDENT: "student",        // Learner
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Helper array to automatically fetch all available permissions for Super Admin
const ALL_PERMISSIONS = Object.values(PERMISSIONS).flatMap((module) => Object.values(module)) as Permission[];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN]: ALL_PERMISSIONS,

  [ROLES.ADMIN]: [
    // Admin gets full tenant-level access. We list them explicitly for strict security audits.
    PERMISSIONS.students.view, PERMISSIONS.students.create, PERMISSIONS.students.update, PERMISSIONS.students.delete,
    PERMISSIONS.staff.view, PERMISSIONS.staff.create, PERMISSIONS.staff.update, PERMISSIONS.staff.delete, PERMISSIONS.staff.manage,
    PERMISSIONS.fees.view, PERMISSIONS.fees.create, PERMISSIONS.fees.update, PERMISSIONS.fees.delete, PERMISSIONS.fees.collect, PERMISSIONS.fees.manage,
    PERMISSIONS.attendance.view, PERMISSIONS.attendance.create, PERMISSIONS.attendance.update, PERMISSIONS.attendance.delete, PERMISSIONS.attendance.manage,
    PERMISSIONS.exams.view, PERMISSIONS.exams.create, PERMISSIONS.exams.update, PERMISSIONS.exams.delete, PERMISSIONS.exams.manage,
    PERMISSIONS.finance.view, PERMISSIONS.finance.create, PERMISSIONS.finance.update, PERMISSIONS.finance.delete, PERMISSIONS.finance.manage,
    PERMISSIONS.settings.view, PERMISSIONS.settings.update, PERMISSIONS.settings.manage,
    PERMISSIONS.homework.view, PERMISSIONS.homework.create, PERMISSIONS.homework.update, PERMISSIONS.homework.delete,
    PERMISSIONS.buses.view, PERMISSIONS.buses.create, PERMISSIONS.buses.update, PERMISSIONS.buses.delete,
    PERMISSIONS.parents.view, PERMISSIONS.parents.create, PERMISSIONS.parents.update, PERMISSIONS.parents.delete,
    PERMISSIONS.videoLectures.view, PERMISSIONS.videoLectures.create, PERMISSIONS.videoLectures.delete,
    PERMISSIONS.ledger.view, PERMISSIONS.ledger.create, PERMISSIONS.ledger.update, PERMISSIONS.ledger.delete,
    PERMISSIONS.subscriptions.view, PERMISSIONS.subscriptions.create, PERMISSIONS.subscriptions.update, PERMISSIONS.subscriptions.delete, PERMISSIONS.subscriptions.activate,
    PERMISSIONS.marks.view, PERMISSIONS.marks.create, PERMISSIONS.marks.update, PERMISSIONS.marks.delete,
    PERMISSIONS.assignments.view, PERMISSIONS.assignments.create, PERMISSIONS.assignments.update, PERMISSIONS.assignments.delete, PERMISSIONS.assignments.grade,
    PERMISSIONS.quizzes.view, PERMISSIONS.quizzes.create, PERMISSIONS.quizzes.update, PERMISSIONS.quizzes.delete, PERMISSIONS.quizzes.grade,
    PERMISSIONS.lessonPlans.view, PERMISSIONS.lessonPlans.create, PERMISSIONS.lessonPlans.update, PERMISSIONS.lessonPlans.delete,
    PERMISSIONS.timetable.view, PERMISSIONS.timetable.create, PERMISSIONS.timetable.update, PERMISSIONS.timetable.delete,
    PERMISSIONS.behavior.view, PERMISSIONS.behavior.create, PERMISSIONS.behavior.update, PERMISSIONS.behavior.delete,
    PERMISSIONS.skills.view, PERMISSIONS.skills.create, PERMISSIONS.skills.update, PERMISSIONS.skills.delete,
    PERMISSIONS.books.view, PERMISSIONS.books.create, PERMISSIONS.books.update, PERMISSIONS.books.delete,
    PERMISSIONS.chat.view, PERMISSIONS.chat.send, PERMISSIONS.chat.delete,
    PERMISSIONS.audit.view, PERMISSIONS.analytics.view,
  ],

  [ROLES.TEACHER]: [
    PERMISSIONS.students.view,
    PERMISSIONS.attendance.view, PERMISSIONS.attendance.create, PERMISSIONS.attendance.update,
    PERMISSIONS.homework.view, PERMISSIONS.homework.create, PERMISSIONS.homework.update,
    PERMISSIONS.assignments.view, PERMISSIONS.assignments.create, PERMISSIONS.assignments.update, PERMISSIONS.assignments.grade,
    PERMISSIONS.quizzes.view, PERMISSIONS.quizzes.create, PERMISSIONS.quizzes.update, PERMISSIONS.quizzes.grade,
    PERMISSIONS.lessonPlans.view, PERMISSIONS.lessonPlans.create, PERMISSIONS.lessonPlans.update,
    PERMISSIONS.exams.view, PERMISSIONS.exams.manage,
    PERMISSIONS.marks.view, PERMISSIONS.marks.create, PERMISSIONS.marks.update,
    PERMISSIONS.videoLectures.view, PERMISSIONS.videoLectures.create,
    PERMISSIONS.books.view, PERMISSIONS.books.create,
    PERMISSIONS.timetable.view,
    PERMISSIONS.behavior.view, PERMISSIONS.behavior.create,
    PERMISSIONS.skills.view, PERMISSIONS.skills.create,
    PERMISSIONS.chat.view, PERMISSIONS.chat.send,
  ],

  [ROLES.ACCOUNTANT]: [
    PERMISSIONS.students.view,
    PERMISSIONS.fees.view, PERMISSIONS.fees.create, PERMISSIONS.fees.update, PERMISSIONS.fees.collect, PERMISSIONS.fees.manage,
    PERMISSIONS.finance.view, PERMISSIONS.finance.create, PERMISSIONS.finance.update, PERMISSIONS.finance.manage,
    PERMISSIONS.ledger.view, PERMISSIONS.ledger.create, PERMISSIONS.ledger.update,
  ],

  [ROLES.PARENT]: [
    PERMISSIONS.students.view,
    PERMISSIONS.attendance.view,
    PERMISSIONS.homework.view,
    PERMISSIONS.assignments.view,
    PERMISSIONS.quizzes.view,
    PERMISSIONS.marks.view,
    PERMISSIONS.fees.view,
    PERMISSIONS.buses.view,
    PERMISSIONS.timetable.view,
    PERMISSIONS.books.view,
    PERMISSIONS.videoLectures.view,
    PERMISSIONS.chat.view, PERMISSIONS.chat.send,
  ],

  [ROLES.STUDENT]: [
    PERMISSIONS.attendance.view,
    PERMISSIONS.homework.view,
    PERMISSIONS.assignments.view,
    PERMISSIONS.quizzes.view,
    PERMISSIONS.marks.view,
    PERMISSIONS.timetable.view,
    PERMISSIONS.books.view,
    PERMISSIONS.videoLectures.view,
    PERMISSIONS.chat.view, PERMISSIONS.chat.send,
  ],
};
