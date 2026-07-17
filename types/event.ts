import type { Timestamp } from "firebase-admin/firestore";
import type { EventType } from "@/lib/events/event-types";

export const EVENT_STATUS = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  FAILED: "Failed",
  DEAD_LETTER: "DeadLetter",
} as const;

export type EventStatus = typeof EVENT_STATUS[keyof typeof EVENT_STATUS];

export interface EventMetadata {
  traceId: string;
  correlationId: string;
  causationId?: string;
  requestId?: string;
  userId?: string;
  campusId?: string;
}

export interface DurableEvent {
  eventId: string;
  eventName: `${EventType}.v1`;
  eventType: EventType;
  eventVersion: 1;
  eventSchemaVersion: 1;
  aggregateType: string;
  aggregateId: string;
  tenantId: string;
  campusId?: string;
  payload: Record<string, unknown>;
  metadata: EventMetadata;
  traceId: string;
  correlationId: string;
  causationId?: string;
  userId?: string;
  createdAt?: Timestamp;
  status: EventStatus;
  attempts: number;
  nextRetry: Timestamp | Date;
  lastError?: string;
  retryHistory: Array<{ attempt: number; failedAt: Date; error: string; retryAt?: Date }>;
  processedAt?: Timestamp;
  processingNode?: string;
  processingLeaseUntil?: Timestamp | Date;
}

export interface PublishEventOptions {
  aggregateType?: string;
  aggregateId?: string;
  campusId?: string;
  userId?: string;
  traceId?: string;
  correlationId?: string;
  causationId?: string;
}
