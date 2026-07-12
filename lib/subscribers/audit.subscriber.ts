// lib/subscribers/audit.subscriber.ts (یا جہاں بھی آپ نے یہ فائل رکھی ہے)

// 🚀 FIXED: Using Absolute Paths (@/) so Next.js never loses the file
import { eventBus } from "@/lib/events/event-bus";
import { EVENTS } from "@/lib/events/event-types";
import { adminDb } from "@/lib/firebase-admin";
import { logger } from "@/lib/logger/logger";

export function registerAuditSubscriber() {
  // 🎧 Listen for STUDENT_CREATED event
  eventBus.subscribe(EVENTS.STUDENT_CREATED, async (payload) => {
    try {
      const { tenantId, studentId, studentData } = payload;

      // 📝 Write to Audit Logs in the background
      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "STUDENT_CREATED",
          targetId: studentId,
          details: `Student ${studentData.firstName || 'Unknown'} was enrolled into the system.`,
          timestamp: new Date().toISOString(),
          module: "Students",
          systemAction: true, 
        });

      logger.info(`Audit: Successfully logged creation of student: ${studentId}`);
    } catch (error) {
      logger.error("Audit: Failed to log event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for ATTENDANCE_MARKED event
  eventBus.subscribe(EVENTS.ATTENDANCE_MARKED, async (payload) => {
    try {
      const { tenantId, attendanceId, studentId, date, status } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "ATTENDANCE_MARKED",
          targetId: attendanceId,
          details: `Attendance marked as ${status} for student ${studentId} on ${date}.`,
          timestamp: new Date().toISOString(),
          module: "Attendance",
          systemAction: true,
        });
    } catch (error) {
      logger.error("Audit: Failed to log attendance marked event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for ATTENDANCE_UPDATED event
  eventBus.subscribe(EVENTS.ATTENDANCE_UPDATED, async (payload) => {
    try {
      const { tenantId, attendanceId, updates } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "ATTENDANCE_UPDATED",
          targetId: attendanceId,
          details: `Attendance record updated: ${JSON.stringify(updates)}`,
          timestamp: new Date().toISOString(),
          module: "Attendance",
          systemAction: true,
        });
    } catch (error) {
      logger.error("Audit: Failed to log attendance updated event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for ATTENDANCE_DELETED event
  eventBus.subscribe(EVENTS.ATTENDANCE_DELETED, async (payload) => {
    try {
      const { tenantId, attendanceId, studentId } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "ATTENDANCE_DELETED",
          targetId: attendanceId,
          details: `Attendance record deleted for student ${studentId}.`,
          timestamp: new Date().toISOString(),
          module: "Attendance",
          systemAction: true,
        });
    } catch (error) {
      logger.error("Audit: Failed to log attendance deleted event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for ATTENDANCE_IMPORTED event
  eventBus.subscribe(EVENTS.ATTENDANCE_IMPORTED, async (payload) => {
    try {
      const { tenantId, recordCount, dates } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "ATTENDANCE_IMPORTED",
          details: `Bulk attendance imported: ${recordCount} records for dates: ${dates.join(", ")}.`,
          timestamp: new Date().toISOString(),
          module: "Attendance",
          systemAction: true,
        });
    } catch (error) {
      logger.error("Audit: Failed to log attendance imported event:", { metadata: { error } });
    }
  });
}
