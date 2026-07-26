// lib/events/event-bus.ts
import { DomainEvent, DomainEventEnvelope, DomainEventMetadata, EventHandler, EventMiddleware } from "./domain-events";
import { EventDispatcher } from "./event-dispatcher";
import { EventStore, FirestoreEventStore } from "./event-store";
import type { DurableEvent } from "@/types/event";

export class EventBus {
  private dispatcher: EventDispatcher;
  private eventStore: EventStore;
  private isInitialized = false;

  constructor() {
    this.dispatcher = new EventDispatcher();
    this.eventStore = new FirestoreEventStore();
    this.isInitialized = true;
  }

  initialize(eventStore: EventStore): void {
    this.eventStore = eventStore;
    this.isInitialized = true;
  }

  register(handler: EventHandler): void {
    this.dispatcher.register(handler);
  }

  use(middleware: EventMiddleware): void {
    this.dispatcher.use(middleware);
  }

  subscribe(eventType: string, callback: (payload: Record<string, any>) => Promise<void>): void {
    const handler: EventHandler = {
      canHandle: (type: string) => type === eventType,
      handle: async (_event: DomainEvent, envelope: DomainEventEnvelope) => {
        await callback(envelope.event.payload);
      },
    };
    this.dispatcher.register(handler);
  }

  async dispatchHandlers(eventType: string, payload: Record<string, any>, tenantId?: string): Promise<void> {
    const event: DomainEvent = {
      eventId: crypto.randomUUID(),
      eventType,
      aggregateId: payload.id || tenantId || "",
      tenantId: tenantId || "",
      occurredAt: new Date(),
      payload,
      correlationId: undefined,
      version: 1,
    };

    const envelope: DomainEventEnvelope = {
      event,
      metadata: {},
      headers: {},
      timestamp: new Date(),
      attempts: 0,
    };

    await this.dispatcher.dispatch(event, {});
  }

  async dispatch(eventType: string, payload: Record<string, any>, tenantId?: string): Promise<void> {
    return this.dispatchHandlers(eventType, payload, tenantId);
  }

  async dispatchEvent(event: DomainEvent | DurableEvent, metadata?: DomainEventMetadata): Promise<void> {
    const envelope: DomainEventEnvelope = {
      event: event as DomainEvent,
      metadata: metadata || {},
      headers: {},
      timestamp: new Date(),
      attempts: 0,
    };
    await this.dispatcher.dispatch(event as DomainEvent, metadata);
  }

  async publish(eventType: string, payload: Record<string, any>, tenantId: string, metadata?: DomainEventMetadata): Promise<void> {
    const event: DomainEvent = {
      eventId: crypto.randomUUID(),
      eventType,
      aggregateId: payload.id || tenantId,
      tenantId,
      occurredAt: new Date(),
      payload,
      correlationId: metadata?.traceId,
      version: 1,
    };

    const envelope: DomainEventEnvelope = {
      event,
      metadata: metadata || {},
      headers: {},
      timestamp: new Date(),
      attempts: 0,
    };

    if (this.isInitialized) {
      const idempotencyKey = `${event.eventType}:${event.aggregateId}:${event.occurredAt.getTime()}`;
      const alreadyProcessed = await this.eventStore.getByIdempotencyKey(idempotencyKey);
      
      if (!alreadyProcessed) {
        await this.eventStore.append(event, metadata || {});
        await this.eventStore.markAsProcessed(idempotencyKey);
      }
    }

    await this.dispatcher.dispatch(event, metadata);
  }
}

export const eventBus = new EventBus();
