// lib/events/event-bus.ts

import { EventType } from "./event-types";
import { logger } from "@/lib/logger/logger";
import { EventOutboxRepository } from "@/repositories/event-outbox.repository";
import type { DurableEvent, PublishEventOptions } from "@/types/event";

// Event payload contracts are incrementally typed by subscriber. Keep this
// boundary compatible with the existing event catalogue until that migration is
// completed across all modules.
type EventHandler = (payload: any) => Promise<void> | void;

export class EventBus {
  private handlers: Map<EventType, EventHandler[]> = new Map();
  private readonly outbox: EventOutboxRepository;

  constructor(outbox = new EventOutboxRepository()) {
    this.outbox = outbox;
  }

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
  /**
   * Records an event durably. Delivery is performed by EventWorker, never by
   * the request process, so it is safe across serverless instance shutdowns.
   */
  async publish(event: EventType, payload: Record<string, unknown>, options?: PublishEventOptions): Promise<string> {
    return this.outbox.enqueue(event, payload, options);
  }

  /** Called only by the durable worker after it has acquired an event lease. */
  async dispatch(event: DurableEvent): Promise<void> {
    const eventHandlers = this.handlers.get(event.eventType);
    if (!eventHandlers?.length) return;

    for (const [index, handler] of eventHandlers.entries()) {
      const subscriberId = `${event.eventType}:${index}`;
      const acquired = await this.outbox.claimSubscriber(event.eventId, subscriberId);
      if (!acquired) continue;

      try {
        await handler({
          ...event.payload,
          eventId: event.eventId,
          eventName: event.eventName,
          correlationId: event.correlationId,
          traceId: event.traceId,
        });
        await this.outbox.completeSubscriber(event.eventId, subscriberId);
      } catch (error) {
        await this.outbox.releaseSubscriber(event.eventId, subscriberId);
        logger.error(`[EventBus] Error in subscriber ${subscriberId}:`, { metadata: { error } });
        throw error;
      }
    }
  }

  /** @deprecated Delivery is worker-owned; retained only for isolated tests. */
  async dispatchHandlers(event: EventType, payload: any): Promise<void> {
    const eventHandlers = this.handlers.get(event);
    if (!eventHandlers?.length) return;

    // Keep the request alive until subscribers have observed the event. This is
    // essential on serverless runtimes, where detached promises can be stopped
    // as soon as the route returns. Individual subscriber failures are isolated
    // so a notification failure cannot roll back the completed business mutation.
    const results = await Promise.allSettled(eventHandlers.map((handler) => handler(payload)));
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        logger.error(`[EventBus] Error in handler ${index} for event ${event}:`, {
          metadata: { error: result.reason },
        });
      }
    });
  }
}

// Export as a Singleton (پوری ایپ میں ایک ہی بس چلے گی)
export const eventBus = new EventBus();
