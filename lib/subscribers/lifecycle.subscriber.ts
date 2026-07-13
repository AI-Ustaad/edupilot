// lib/subscribers/lifecycle.subscriber.ts
import { eventBus } from "@/lib/events/event-bus";
import { EVENTS } from "@/lib/events/event-types";
import { invalidateCache } from "@/lib/cache";
import { adminDb } from "@/lib/firebase-admin";
import { logger } from "@/lib/logger/logger";

export function registerLifecycleSubscriber() {
  // Listen for STUDENT_ENROLLED — trigger full lifecycle cascade
  eventBus.subscribe(EVENTS.STUDENT_ENROLLED, async (payload) => {
    try {
      const { tenantId, studentId, studentData, approvedBy } = payload;

      // 1. Invalidate dashboard cache so counts refresh
      await invalidateCache(`dashboard:${tenantId}`);

      // 2. Notify all admins about the new enrollment
      const adminSnap = await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("users")
        .where("role", "in", ["admin", "super-admin"])
        .limit(5)
        .get();

      for (const doc of adminSnap.docs) {
        await doc.ref.collection("notifications").add({
          title: "Student Enrolled",
          message: `${studentData?.fullName || "A new student"} has been enrolled in class ${studentData?.classGrade || "N/A"}-${studentData?.section || "N/A"}.`,
          type: "success",
          isRead: false,
          link: `/students`,
          createdAt: new Date().toISOString(),
        });
      }

      logger.info(`Lifecycle: Student enrolled cascade completed for ${studentId}`);
    } catch (error) {
      logger.error("Lifecycle: Failed to process student enrolled cascade:", { metadata: { error } });
    }
  });

  // Listen for SCHOOL_SETUP_COMPLETED — log and invalidate cache
  eventBus.subscribe(EVENTS.SCHOOL_SETUP_COMPLETED, async (payload) => {
    try {
      const { tenantId, schoolName, classesCount } = payload;

      await invalidateCache(`dashboard:${tenantId}`);

      logger.info(`Lifecycle: School setup completed for ${schoolName} with ${classesCount} classes`);
    } catch (error) {
      logger.error("Lifecycle: Failed to process school setup completed:", { metadata: { error } });
    }
  });
}
