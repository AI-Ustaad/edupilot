// lib/events/domain-events.ts
export interface DomainEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly aggregateId: string;
  readonly tenantId: string;
  readonly occurredAt: Date;
  readonly payload: Record<string, any>;
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly version: number;
}

export interface DomainEventMetadata {
  userId?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  traceId?: string;
  spanId?: string;
}

export interface DomainEventEnvelope {
  event: DomainEvent;
  metadata: DomainEventMetadata;
  headers: Record<string, string>;
  timestamp: Date;
  attempts: number;
  lastError?: string;
}

export interface EventHandler<T = any> {
  handle(event: T, envelope: DomainEventEnvelope): Promise<void>;
  canHandle(eventType: string): boolean;
}

export interface EventMiddleware {
  process(event: DomainEvent, envelope: DomainEventEnvelope, next: () => Promise<void>): Promise<void>;
}

export interface EventDispatcher {
  dispatch(event: DomainEvent, metadata?: DomainEventMetadata): Promise<void>;
  register(handler: EventHandler): void;
  use(middleware: EventMiddleware): void;
}

export interface EventStore {
  append(event: DomainEvent, metadata: DomainEventMetadata): Promise<string>;
  replay(tenantId: string, from?: Date, to?: Date): Promise<DomainEventEnvelope[]>;
  getByIdempotencyKey(key: string): Promise<boolean>;
  markAsProcessed(key: string): Promise<void>;
}
