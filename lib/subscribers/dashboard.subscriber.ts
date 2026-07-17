// lib/subscribers/dashboard.subscriber.ts
import { eventBus } from "@/lib/events/event-bus";
import { EVENTS } from "@/lib/events/event-types";
import { invalidateCache } from "@/lib/cache";
import { logger } from "@/lib/logger/logger";

export function registerDashboardSubscriber() {
  // Events that should trigger dashboard cache invalidation
  const cacheBustingEvents: Array<{ event: typeof EVENTS[keyof typeof EVENTS]; label: string }> = [
    { event: EVENTS.STUDENT_CREATED, label: "student created" },
    { event: EVENTS.STUDENT_DELETED, label: "student deleted" },
    { event: EVENTS.STAFF_CREATED, label: "staff created" },
    { event: EVENTS.STAFF_DELETED, label: "staff deleted" },
    { event: EVENTS.FEE_COLLECTED, label: "fee collected" },
    { event: EVENTS.ATTENDANCE_MARKED, label: "attendance marked" },
    { event: EVENTS.ATTENDANCE_DELETED, label: "attendance deleted" },
    { event: EVENTS.HOMEWORK_CREATED, label: "homework created" },
    { event: EVENTS.MARKS_ENTERED, label: "marks entered" },
    { event: EVENTS.RESULT_PUBLISHED, label: "result published" },
  ];

  for (const { event, label } of cacheBustingEvents) {
    eventBus.subscribe(event, async (payload) => {
      try {
        const tenantId = payload?.tenantId;
        if (!tenantId) return;

        await invalidateCache(`dashboard:${tenantId}`);
        logger.info(`Dashboard cache invalidated: ${label} (tenant: ${tenantId})`);
      } catch (error) {
        logger.error(`Dashboard subscriber failed for ${label}:`, { metadata: { error } });
      }
    });
  }
}
