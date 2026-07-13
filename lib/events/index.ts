// lib/events/index.ts

import { eventBus } from "./event-bus";
import { registerAuditSubscriber } from "@/lib/subscribers/audit.subscriber";
import { registerNotificationSubscriber } from "@/lib/events/subscribers/notification.subscriber";
import { registerLifecycleSubscriber } from "@/lib/subscribers/lifecycle.subscriber";
import { registerStaffLifecycleSubscriber } from "@/lib/subscribers/staff-lifecycle.subscriber";
import { registerDashboardSubscriber } from "@/lib/subscribers/dashboard.subscriber";

// Register all background listeners
registerAuditSubscriber();
registerNotificationSubscriber();
registerLifecycleSubscriber();
registerStaffLifecycleSubscriber();
registerDashboardSubscriber();

// Export the ready-to-use eventBus
export { eventBus };
