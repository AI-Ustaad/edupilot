// lib/events/event-types.ts

export const EVENTS = {
  STUDENT_CREATED: "student.created",
  FEE_COLLECTED: "fee.collected",
  ATTENDANCE_MARKED: "attendance.marked",
  ATTENDANCE_UPDATED: "attendance.updated",
  ATTENDANCE_DELETED: "attendance.deleted",
  ATTENDANCE_IMPORTED: "attendance.imported",
  REPORT_GENERATED: "report.generated",
  STAFF_CREATED: "staff.created",
  STAFF_UPDATED: "staff.updated",
  STAFF_DELETED: "staff.deleted",
  STAFF_ACTIVATED: "staff.activated",
  STAFF_DEACTIVATED: "staff.deactivated",
  STAFF_PROMOTED: "staff.promoted",
  ASSIGNMENT_CREATED: "assignment.created",
  ASSIGNMENT_DELETED: "assignment.deleted",
  ASSIGNMENT_SUBMITTED: "assignment.submitted",
  LESSON_PLAN_CREATED: "lesson_plan.created",
  LESSON_PLAN_DELETED: "lesson_plan.deleted",
  BOOK_CREATED: "book.created",
  BOOK_UPDATED: "book.updated",
  BOOK_DELETED: "book.deleted",
  BEHAVIOR_RECORDED: "behavior.recorded",
} as const;

// Typescript Magic for strict typing
export type EventType = typeof EVENTS[keyof typeof EVENTS];
