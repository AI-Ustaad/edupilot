// lib/events/event-types.ts

export const EVENTS = {
  STUDENT_CREATED: "student.created",
  FEE_COLLECTED: "fee.collected",
  ATTENDANCE_MARKED: "attendance.marked",
  REPORT_GENERATED: "report.generated",
} as const;

// Typescript Magic for strict typing
export type EventType = typeof EVENTS[keyof typeof EVENTS];
