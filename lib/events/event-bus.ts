// lib/events/event-bus.ts

import { EventType } from "./event-types";
import { logger } from "@/lib/logger/logger";

type EventHandler = (payload: any) => Promise<void> | void;

class EventBus {
  private handlers: Map<EventType, EventHandler[]> = new Map();

  /**
   * Subscribe: کوئی سروس جب کسی ایونٹ کا انتظار کرنا چاہے
   */
  subscribe(event: EventType, handler: EventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)?.push(handler);
  }

  /**
   * Publish: جب کوئی نیا کام ہو (جیسے فیس جمع ہونا)، تو بس ایک نعرہ لگائیں!
   */
  async publish(event: EventType, payload: any) {
    const eventHandlers = this.handlers.get(event);
    if (!eventHandlers) return; // اگر کوئی اس ایونٹ کو نہیں سن رہا تو کچھ نہ کریں

    // 🚀 Promise.allSettled کا جادو: یہ تمام کام بیک گراؤنڈ میں کرے گا
    // اگر SMS فیل بھی ہو جائے، تو فیس جمع ہونے کا مین پروسیس کریش نہیں ہوگا!
    Promise.allSettled(eventHandlers.map(handler => handler(payload)))
      .then((results) => {
        results.forEach((res, index) => {
          if (res.status === "rejected") {
            logger.error(`[EventBus] Error in handler ${index} for event ${event}:`, { metadata: { error: res.reason } });
          }
        });
      });
  }
}

// Export as a Singleton (پوری ایپ میں ایک ہی بس چلے گی)
export const eventBus = new EventBus();
