// lib/events/event-dispatcher.ts
import { EventHandler, EventMiddleware, DomainEvent, DomainEventEnvelope, DomainEventMetadata } from "./domain-events";
import { logger } from "@/lib/logger/logger";

export class EventDispatcher implements EventDispatcher {
  private handlers: EventHandler[] = [];
  private middlewares: EventMiddleware[] = [];

  register(handler: EventHandler): void {
    this.handlers.push(handler);
  }

  use(middleware: EventMiddleware): void {
    this.middlewares.push(middleware);
  }

  async dispatch(event: DomainEvent, metadata?: DomainEventMetadata): Promise<void> {
    const envelope: DomainEventEnvelope = {
      event,
      metadata: metadata || {},
      headers: {
        "content-type": "application/json",
        "x-event-type": event.eventType,
        "x-tenant-id": event.tenantId,
        "x-correlation-id": event.correlationId || "",
      },
      timestamp: new Date(),
      attempts: 0,
    };

    const handlers = this.handlers.filter(h => h.canHandle(event.eventType));

    if (handlers.length === 0) {
      return;
    }

    const dispatch = async (index: number): Promise<void> => {
      if (index >= handlers.length) return;

      const handler = handlers[index];
      
      const next = async (): Promise<void> => {
        await dispatch(index + 1);
      };

      let current = async () => {
        try {
          await handler.handle(event, envelope);
        } catch (error) {
          logger.error(`Event handler failed for ${event.eventType}`, { metadata: { error } });
        }
        await next();
      };
      
      for (let i = this.middlewares.length - 1; i >= 0; i--) {
        const middleware = this.middlewares[i];
        const nextMiddleware = current;
        current = async () => middleware.process(event, envelope, nextMiddleware);
      }

      try {
        await current();
      } catch (error) {
        logger.error(`Event middleware failed for ${event.eventType}`, { metadata: { error } });
      }
    };

    await dispatch(0);
  }
}
