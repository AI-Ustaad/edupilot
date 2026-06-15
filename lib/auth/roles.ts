import { PERMISSIONS, Permission } from "./permissions";

export const ROLES = {
  SUPER_ADMIN: "superAdmin",
  ADMIN: "admin",
  TEACHER: "teacher",
  ACCOUNTANT: "accountant",
  PARENT: "parent",
  STUDENT: "student",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN]: [
    // Super Admin gets every single permission available in the registry
    ...Object.values(PERMISSIONS).flatMap((module) => Object.values(module)) as Permission[]
  ],
  
  [ROLES.ADMIN]: [
    PERMISSIONS.students.view,
    PERMISSIONS.students.create,
    PERMISSIONS.students.update,
    PERMISSIONS.students.delete,
    PERMISSIONS.staff.view,
    PERMISSIONS.staff.create,
    PERMISSIONS.staff.update,
    PERMISSIONS.staff.delete,
    PERMISSIONS.fees.view,
    PERMISSIONS.fees.create,
    PERMISSIONS.fees.update,
    PERMISSIONS.fees.delete,
    PERMISSIONS.fees.collect,
    PERMISSIONS.attendance.view,
    PERMISSIONS.attendance.create,
    PERMISSIONS.attendance.update,
    PERMISSIONS.attendance.delete,
    PERMISSIONS.settings.view,
    PERMISSIONS.settings.update,
    PERMISSIONS.settings.manage,
    PERMISSIONS.buses.view,
    PERMISSIONS.buses.create,
    PERMISSIONS.buses.update,
    PERMISSIONS.buses.delete,
    PERMISSIONS.parents.view,
    PERMISSIONS.parents.create,
    PERMISSIONS.parents.update,
    PERMISSIONS.parents.delete,
    PERMISSIONS.audit.view,
    PERMISSIONS.analytics.view,
  ],

  [ROLES.TEACHER]: [
    PERMISSIONS.students.view,
    PERMISSIONS.attendance.view,
    PERMISSIONS.attendance.create,
    PERMISSIONS.attendance.update,
    PERMISSIONS.homework.view,
    PERMISSIONS.homework.create,
    PERMISSIONS.homework.update,
    PERMISSIONS.assignments.view,
    PERMISSIONS.assignments.create,
    PERMISSIONS.assignments.update,
    PERMISSIONS.assignments.grade,
    PERMISSIONS.quizzes.view,
    PERMISSIONS.quizzes.create,
    PERMISSIONS.quizzes.update,
    PERMISSIONS.quizzes.grade,
    PERMISSIONS.lessonPlans.view,
    PERMISSIONS.lessonPlans.create,
    PERMISSIONS.lessonPlans.update,
    PERMISSIONS.chat.view,
    PERMISSIONS.chat.send,
  ],

  [ROLES.ACCOUNTANT]: [
    PERMISSIONS.students.view,
    PERMISSIONS.fees.view,
    PERMISSIONS.fees.create,
    PERMISSIONS.fees.update,
    PERMISSIONS.fees.collect,
    PERMISSIONS.ledger.view,
    PERMISSIONS.ledger.create,
    PERMISSIONS.ledger.update,
  ],

  [ROLES.PARENT]: [
    PERMISSIONS.students.view,
    PERMISSIONS.attendance.view,
    PERMISSIONS.homework.view,
    PERMISSIONS.fees.view,
    PERMISSIONS.chat.view,
    PERMISSIONS.chat.send,
  ],

  [ROLES.STUDENT]: [
    PERMISSIONS.attendance.view,
    PERMISSIONS.homework.view,
    PERMISSIONS.chat.view,
    PERMISSIONS.chat.send,
  ],
};
