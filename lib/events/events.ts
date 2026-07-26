// lib/events/events.ts
export const EVENTS = {
  // Student Events
  STUDENT_CREATED: "student.created",
  STUDENT_UPDATED: "student.updated",
  STUDENT_DELETED: "student.deleted",
  STUDENT_PROMOTED: "student.promoted",
  STUDENT_ARCHIVED: "student.archived",
  STUDENT_RESTORED: "student.restored",
  
  // Staff Events
  STAFF_CREATED: "staff.created",
  STAFF_UPDATED: "staff.updated",
  STAFF_DELETED: "staff.deleted",
  STAFF_PROMOTED: "staff.promoted",
  STAFF_ARCHIVED: "staff.archived",
  STAFF_RESTORED: "staff.restored",
  
  // Attendance Events
  ATTENDANCE_MARKED: "attendance.marked",
  ATTENDANCE_UPDATED: "attendance.updated",
  ATTENDANCE_DELETED: "attendance.deleted",
  
  // Exam Events
  EXAM_PUBLISHED: "exam.published",
  EXAM_UPDATED: "exam.updated",
  EXAM_DELETED: "exam.deleted",
  RESULT_PUBLISHED: "result.published",
  
  // Fee Events
  FEE_PAID: "fee.paid",
  FEE_CREATED: "fee.created",
  FEE_UPDATED: "fee.updated",
  INVOICE_GENERATED: "invoice.generated",
  PAYMENT_FAILED: "payment.failed",
  
  // User Events
  USER_REGISTERED: "user.registered",
  USER_LOGGED_IN: "user.logged_in",
  USER_UPDATED: "user.updated",
  ROLE_CHANGED: "role.changed",
  
  // Notification Events
  NOTIFICATION_SENT: "notification.sent",
  NOTIFICATION_READ: "notification.read",
  
  // Subscription Events
  SUBSCRIPTION_ACTIVATED: "subscription.activated",
  SUBSCRIPTION_CANCELED: "subscription.canceled",
  SUBSCRIPTION_EXPIRED: "subscription.expired",
  SUBSCRIPTION_UPDATED: "subscription.updated",
  
  // Tenant Events
  TENANT_CREATED: "tenant.created",
  TENANT_UPDATED: "tenant.updated",
  TENANT_SUSPENDED: "tenant.suspended",
  
  // AI Events
  AI_JOB_COMPLETED: "ai.job.completed",
  AI_JOB_FAILED: "ai.job.failed",
  
  // Document Events
  DOCUMENT_UPLOADED: "document.uploaded",
  DOCUMENT_DELETED: "document.deleted",
  
  // Queue Events
  QUEUE_COMPLETED: "queue.completed",
  QUEUE_FAILED: "queue.failed",
  
  // Audit Events
  AUDIT_LOGGED: "audit.logged",
} as const;

export type EventType = typeof EVENTS[keyof typeof EVENTS];
