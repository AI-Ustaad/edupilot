// lib/auth/roles.ts
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    "students.view", "students.create", "students.update", "students.delete",
    "staff.view", "staff.create", "staff.update", "staff.delete",
    "fees.view", "fees.create", "fees.update", "fees.delete",
    "attendance.view", "attendance.create", "attendance.update", "attendance.delete", "attendance.mark",
    "classes.view", "classes.create", "classes.update", "classes.delete", "classes.manage",
    "parents.view", "parents.create", "parents.manage",
    "dashboard.view", "analytics.view",
    "settings.view", "settings.update", "settings.manage",
    "billing.view", "billing.create", "billing.update", "billing.manage",
    "users.view", "users.create", "users.update", "users.delete",
    "audit.view",
    "ledger.view",
    "buses.view", "buses.create", "buses.update", "buses.delete",
    "homework.create", "homework.view", "homework.delete",
    "assignments.view", "assignments.create", "assignments.grade", "assignments.delete",
    "quizzes.view", "quizzes.create", "quizzes.grade", "quizzes.delete",
    "lessonPlans.create", "lessonPlans.view", "lessonPlans.delete",
    "videoLectures.view", "videoLectures.create", "videoLectures.delete",
    // B11 rework (27 Nov): PR #20 added withPermission(PERMISSIONS.syllabus.create)
    // to POST /api/v1/syllabus, but no role held any syllabus.* permission, so
    // even ADMIN got 403 "Forbidden: Insufficient permissions" on save (and the
    // [id] route's syllabus.update / syllabus.delete gates failed the same way).
    // The client form rendered anyway because the page gates on settings.manage
    // and the menu on academics.view, which admin does hold.
    "syllabus.view", "syllabus.create", "syllabus.update", "syllabus.delete",
    "bookCenter.view", "bookCenter.create", "bookCenter.update", "bookCenter.delete",
    "behavior.view", "behavior.create",
    "skills.view", "skills.create",
    "ai.view", "chat.send", "chat.view",
    "admissions", "admissions.view", "admissions.create", "admissions.update", "admissions.delete", "admissions.manage",
    "leaveRequests", "leaveRequests.view", "leaveRequests.create", "leaveRequests.update", "leaveRequests.delete", "leaveRequests.manage",
    "leaves.view", "leaves.create", "leaves.update", "leaves.delete", "leaves.manage",
    "aiExamGenerator", "aiTimetable",
    "academics.view", "academics.manage",
    "exams.view", "exams.create", "exams.update", "exams.delete",
    "marks.view", "marks.create", "marks.update", "marks.delete",
    "payroll.view", "payroll.manage",
    "leave.view", "leave.manage",
    "finance.view", "finance.create", "finance.update", "finance.delete",
    "timetable.view", "timetable.create",
    "operations.view", "operations.manage",
    "communication.view", "communication.send", "communication.manage",
    "subscriptions.view", "subscriptions.create", "subscriptions.update",
    "featureFlags.view", "featureFlags.update",
  ],
  teacher: [
    "students.view",
    "classes.view",
    "attendance.view", "attendance.create", "attendance.update", "attendance.mark",
    "dashboard.view", "analytics.view",
    "homework.create", "homework.view", "homework.delete",
    "assignments.view", "assignments.create", "assignments.grade", "assignments.delete",
    "quizzes.view", "quizzes.create", "quizzes.delete",
    "lessonPlans.create", "lessonPlans.view", "lessonPlans.delete",
    "videoLectures.view", "videoLectures.create", "videoLectures.delete",
    "bookCenter.view",
    "behavior.view", "behavior.create",
    "skills.view", "skills.create",
    "ai.view", "chat.send", "chat.view",
    "exams.view", "marks.view", "marks.create", "marks.update",
    "timetable.view",
    "communication.send",
  ],
  accountant: [
    "fees.view", "fees.create", "fees.update",
    "billing.view",
    "ledger.view",
    "dashboard.view", "analytics.view",
  ],
  parent: [
    "parents.view", "parents.manage",
    "chat.send", "chat.view",
  ],
  student: [
    "students.view",
    "ai.view",
    "chat.send",
    "chat.view",
  ],
};

// These are canonical role names produced by the auth/tenant layer. They are
// operationally school administrators and must not be rejected solely because
// the permission table used its legacy `admin` key.
ROLE_PERMISSIONS.schoolAdmin = [...ROLE_PERMISSIONS.admin];
ROLE_PERMISSIONS.superAdmin = [...ROLE_PERMISSIONS.admin];
ROLE_PERMISSIONS.super_admin = [...ROLE_PERMISSIONS.admin];

export type Role = keyof typeof ROLE_PERMISSIONS;
