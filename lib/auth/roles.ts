// lib/auth/roles.ts
import { PERMISSIONS, type Permission } from "./permissions";

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: Object.values(PERMISSIONS).flatMap(module => Object.values(module)) as Permission[],
  
  teacher: [
    PERMISSIONS.students.view,
    PERMISSIONS.attendance.view,
    PERMISSIONS.attendance.create,
    PERMISSIONS.analytics.view,
    PERMISSIONS.assignments.view,
    PERMISSIONS.assignments.create,
    PERMISSIONS.assignments.update,
    PERMISSIONS.assignments.grade,
    PERMISSIONS.homework.view,
    PERMISSIONS.homework.create,
    PERMISSIONS.homework.update,
    PERMISSIONS.quizzes.view,
    PERMISSIONS.quizzes.create,
    PERMISSIONS.quizzes.grade,
    PERMISSIONS.lessonPlans.view,
    PERMISSIONS.lessonPlans.create,
    PERMISSIONS.chat.view,
    PERMISSIONS.chat.send,
  ],
  
  accountant: [
    PERMISSIONS.fees.view,
    PERMISSIONS.fees.create,
    PERMISSIONS.fees.update,
    PERMISSIONS.fees.collect,
    PERMISSIONS.ledger.view,
    PERMISSIONS.subscriptions.view,
  ],
  
  parent: [
    PERMISSIONS.parents.view,
    PERMISSIONS.chat.view,
    PERMISSIONS.chat.send,
    PERMISSIONS.attendance.view,
    PERMISSIONS.fees.view,
    PERMISSIONS.marks.view,
  ],
};

export type Role = keyof typeof ROLE_PERMISSIONS;
