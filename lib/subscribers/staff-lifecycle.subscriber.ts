// lib/subscribers/staff-lifecycle.subscriber.ts
import { eventBus } from "@/lib/events/event-bus";
import { EVENTS } from "@/lib/events/event-types";
import { invalidateCache } from "@/lib/cache";
import { adminDb } from "@/lib/firebase-admin";
import { logger } from "@/lib/logger/logger";

export function registerStaffLifecycleSubscriber() {
  // Listen for STAFF_ACTIVATED — trigger staff onboarding cascade
  eventBus.subscribe(EVENTS.STAFF_ACTIVATED, async (payload) => {
    try {
      const { tenantId, staffId, fullName } = payload;

      // 1. Invalidate dashboard cache so staff count refreshes
      await invalidateCache(`dashboard:${tenantId}`);

      // 2. Notify admins about new staff member
      const adminSnap = await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("users")
        .where("role", "in", ["admin", "super-admin"])
        .limit(5)
        .get();

      for (const doc of adminSnap.docs) {
        await doc.ref.collection("notifications").add({
          title: "New Staff Member Added",
          message: `${fullName || "A new staff member"} has been added to the system.`,
          type: "info",
          isRead: false,
          link: `/staff`,
          createdAt: new Date().toISOString(),
        });
      }

      logger.info(`Staff Lifecycle: Activation cascade completed for ${staffId}`);
    } catch (error) {
      logger.error("Staff Lifecycle: Failed to process staff activated cascade:", { metadata: { error } });
    }
  });

  // Listen for STAFF_DELETED — cleanup cascade
  eventBus.subscribe(EVENTS.STAFF_DELETED, async (payload) => {
    try {
      const { tenantId, staffId } = payload;

      // Invalidate dashboard cache
      await invalidateCache(`dashboard:${tenantId}`);

      logger.info(`Staff Lifecycle: Deletion cascade completed for ${staffId}`);
    } catch (error) {
      logger.error("Staff Lifecycle: Failed to process staff deleted cascade:", { metadata: { error } });
    }
  });
}
