// lib/events/index.ts

import { eventBus } from "./event-bus";
import { registerAuditSubscriber } from "@/lib/subscribers/audit.subscriber";
// 🔔 نیا نوٹیفکیشن سبسکرائبر امپورٹ کریں
import { registerNotificationSubscriber } from "@/lib/events/subscribers/notification.subscriber";

// 🚀 Register all background listeners here
registerAuditSubscriber();
registerNotificationSubscriber(); // <-- یہ لائن آپ کے نوٹیفکیشن سسٹم کو زندہ کر دے گی!

// Export the ready-to-use eventBus
export { eventBus };
