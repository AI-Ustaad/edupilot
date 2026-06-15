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

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  [ROLES.SUPER_ADMIN]: [
    ...Object.values(PERMISSIONS).flatMap((module) => Object.values(module)) as Permission[]
  ],
  
  [ROLES.ADMIN]: [
    PERMISSIONS.students.view, PERMISSIONS.students.create, PERMISSIONS.students.update, PERMISSIONS.students.delete,
    PERMISSIONS.staff.view, PERMISSIONS.staff.create, PERMISSIONS.staff.update,
    PERMISSIONS.fees.view, PERMISSIONS.fees.collect,
    PERMISSIONS.attendance.view, PERMISSIONS.attendance.update,
    PERMISSIONS.settings.view, PERMISSIONS.settings.update,
  ],

  [ROLES.TEACHER]: [
    PERMISSIONS.students.view,
    PERMISSIONS.attendance.view, PERMISSIONS.attendance.create, PERMISSIONS.attendance.update,
    PERMISSIONS.homework.view, PERMISSIONS.homework.create, PERMISSIONS.homework.update,
  ],

  [ROLES.ACCOUNTANT]: [
    PERMISSIONS.students.view,
    PERMISSIONS.fees.view, PERMISSIONS.fees.create, PERMISSIONS.fees.update, PERMISSIONS.fees.collect,
  ],

  [ROLES.PARENT]: [
    PERMISSIONS.students.view,
    PERMISSIONS.attendance.view,
    PERMISSIONS.homework.view,
    PERMISSIONS.fees.view,
  ],

  [ROLES.STUDENT]: [
    PERMISSIONS.attendance.view,
    PERMISSIONS.homework.view,
  ],
};
