// lib/events/index.ts

import { eventBus } from "./event-bus";
import { registerAuditSubscriber } from "@/lib/subscribers/audit.subscriber";
import { registerNotificationSubscriber } from "@/lib/events/subscribers/notification.subscriber";
import { registerLifecycleSubscriber } from "@/lib/subscribers/lifecycle.subscriber";
import { registerStaffLifecycleSubscriber } from "@/lib/subscribers/staff-lifecycle.subscriber";
import { registerDashboardSubscriber } from "@/lib/subscribers/dashboard.subscriber";

let subscribersRegistered = false;

/**
 * Registers process-local subscribers once. Services import this module rather
 * than the bare bus so every mutation has the same event topology in API and
 * worker runtimes.
 */
function registerSubscribers(): void {
  if (subscribersRegistered) return;
  subscribersRegistered = true;

  registerAuditSubscriber();
  registerNotificationSubscriber();
  registerLifecycleSubscriber();
  registerStaffLifecycleSubscriber();
  registerDashboardSubscriber();
}

registerSubscribers();

// Export the ready-to-use eventBus
export { eventBus };
