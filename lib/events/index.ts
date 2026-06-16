// lib/events/index.ts

import { eventBus } from "./event-bus";
import { registerAuditSubscriber } from "./subscribers/audit.subscriber";

// 🚀 Register all background listeners here
registerAuditSubscriber();
// کل کو یہاں registerNotificationSubscriber() بھی آئے گا!

// Export the ready-to-use eventBus
export { eventBus };
