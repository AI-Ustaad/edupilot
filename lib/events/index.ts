// lib/events/index.ts

import { eventBus } from "./event-bus";
// 🚀 FIXED: Using Absolute Path (@/) to point directly to where your file actually is
import { registerAuditSubscriber } from "@/lib/subscribers/audit.subscriber";

// 🚀 Register all background listeners here
registerAuditSubscriber();

// Export the ready-to-use eventBus
export { eventBus };
