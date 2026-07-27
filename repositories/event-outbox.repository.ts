import { randomUUID } from "crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { EVENTS, type EventType } from "@/lib/events/event-types";
import { EVENT_STATUS, type DurableEvent, type EventMetadata, type PublishEventOptions } from "@/types/event";
import type { IEventOutboxRepository } from "@/interfaces/IEventOutboxRepository";

const RETRY_DELAYS_MS = [60_000, 5 * 60_000, 15 * 60_000, 60 * 60_000, 24 * 60 * 60_000];
const MAX_ATTEMPTS = RETRY_DELAYS_MS.length;

function inferAggregate(eventType: EventType, payload: Record<string, unknown>) {
  const [aggregateType] = eventType.split(".");
  const aggregateId = Object.entries(payload).find(([key]) => key.endsWith("Id"))?.[1];
  return { aggregateType, aggregateId: typeof aggregateId === "string" ? aggregateId : "unknown" };
}

export class EventOutboxRepository implements IEventOutboxRepository {
  private readonly events = adminDb.collection("events");

  async enqueue(eventType: EventType, payload: Record<string, unknown>, options: PublishEventOptions = {}): Promise<string> {
    const tenantId = typeof payload.tenantId === "string" ? payload.tenantId : undefined;
    if (!tenantId) throw new Error(`Durable event ${eventType} requires a tenantId`);

    const eventId = randomUUID();
    const inferred = inferAggregate(eventType, payload);
    const userId = options.userId ?? (typeof payload.createdBy === "string" ? payload.createdBy : undefined);
    const correlationId = options.correlationId ?? (typeof payload.correlationId === "string" ? payload.correlationId : eventId);
    const traceId = options.traceId ?? (typeof payload.traceId === "string" ? payload.traceId : correlationId);
    const metadata: EventMetadata = {
      traceId,
      correlationId,
      causationId: options.causationId,
      requestId: typeof payload.requestId === "string" ? payload.requestId : undefined,
      userId,
      campusId: options.campusId ?? (typeof payload.campusId === "string" ? payload.campusId : undefined),
    };
    const event: Omit<DurableEvent, "createdAt"> = {
      eventId,
      eventName: `${eventType}.v1`,
      eventType,
      eventVersion: 1,
      eventSchemaVersion: 1,
      aggregateType: options.aggregateType ?? inferred.aggregateType,
      aggregateId: options.aggregateId ?? inferred.aggregateId,
      tenantId,
      campusId: metadata.campusId,
      payload,
      metadata,
      traceId,
      correlationId,
      causationId: metadata.causationId,
      userId,
      status: EVENT_STATUS.PENDING,
      attempts: 0,
      nextRetry: new Date(),
      retryHistory: [],
    };

    await this.events.doc(eventId).set({ ...event, createdAt: FieldValue.serverTimestamp() });
    return eventId;
  }

  async claimPending(limit: number, processingNode: string, leaseMs = 60_000): Promise<DurableEvent[]> {
    const now = new Date();
    const pending = await this.events
      .where("status", "==", EVENT_STATUS.PENDING)
      .where("nextRetry", "<=", now)
      .orderBy("nextRetry", "asc")
      .limit(limit)
      .get();

    // A worker may be interrupted after acquiring a lease. Reclaim only leases
    // that have expired; active workers are never stolen.
    const remaining = Math.max(limit - pending.size, 0);
    const expired = remaining > 0
      ? await this.events
        .where("status", "==", EVENT_STATUS.PROCESSING)
        .where("processingLeaseUntil", "<=", now)
        .orderBy("processingLeaseUntil", "asc")
        .limit(remaining)
        .get()
      : null;
    const candidates = [...pending.docs, ...(expired?.docs ?? [])];

    const claimed = await Promise.all(candidates.map(async (candidate) => adminDb.runTransaction(async (transaction) => {
      const current = await transaction.get(candidate.ref);
      const data = current.data() as DurableEvent | undefined;
      const lease = data?.processingLeaseUntil;
      const leaseExpired = lease && (lease instanceof Date ? lease : lease.toDate()) <= now;
      if (!data || (data.status !== EVENT_STATUS.PENDING && !(data.status === EVENT_STATUS.PROCESSING && leaseExpired))) return null;
      transaction.update(candidate.ref, {
        status: EVENT_STATUS.PROCESSING,
        attempts: (data.attempts ?? 0) + 1,
        processingNode,
        processingLeaseUntil: Timestamp.fromMillis(Date.now() + leaseMs),
      });
      return { ...data, attempts: (data.attempts ?? 0) + 1, status: EVENT_STATUS.PROCESSING, processingNode } as DurableEvent;
    })));

    return claimed.filter((event): event is DurableEvent => event !== null);
  }

  async complete(eventId: string, processingNode: string): Promise<void> {
    await this.events.doc(eventId).update({
      status: EVENT_STATUS.COMPLETED,
      processedAt: FieldValue.serverTimestamp(),
      processingNode,
      processingLeaseUntil: FieldValue.delete(),
      lastError: FieldValue.delete(),
    });
  }

  async fail(event: DurableEvent, processingNode: string, error: unknown): Promise<void> {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    const attempt = event.attempts;
    const ref = this.events.doc(event.eventId);
    if (attempt >= MAX_ATTEMPTS) {
      await adminDb.runTransaction(async (transaction) => {
        const current = await transaction.get(ref);
        if (!current.exists || current.data()?.status !== EVENT_STATUS.PROCESSING) return;
        const deadLetterRef = adminDb.collection("dead_letter_events").doc(event.eventId);
        transaction.set(deadLetterRef, {
          ...current.data(),
          status: EVENT_STATUS.DEAD_LETTER,
          subscriber: "event-worker",
          failureReason: message,
          failedAt: FieldValue.serverTimestamp(),
          processingNode,
        });
        transaction.update(ref, {
          status: EVENT_STATUS.DEAD_LETTER,
          lastError: message,
          processingLeaseUntil: FieldValue.delete(),
          processedAt: FieldValue.serverTimestamp(),
        });
      });
      return;
    }

    const retryAt = new Date(Date.now() + RETRY_DELAYS_MS[attempt - 1]);
    await ref.update({
      status: EVENT_STATUS.PENDING,
      nextRetry: retryAt,
      lastError: message,
      processingNode,
      processingLeaseUntil: FieldValue.delete(),
      retryHistory: FieldValue.arrayUnion({ attempt, failedAt: new Date(), error: message, retryAt }),
    });
  }

  async claimSubscriber(eventId: string, subscriberId: string): Promise<boolean> {
    const ref = adminDb.collection("processed_events").doc(`${eventId}_${subscriberId}`);
    return adminDb.runTransaction(async (transaction) => {
      const existing = await transaction.get(ref);
      if (existing.exists) return false;
      transaction.create(ref, { eventId, subscriberId, status: "Processing", createdAt: FieldValue.serverTimestamp() });
      return true;
    });
  }

  async completeSubscriber(eventId: string, subscriberId: string): Promise<void> {
    await adminDb.collection("processed_events").doc(`${eventId}_${subscriberId}`).update({
      status: "Completed",
      processedAt: FieldValue.serverTimestamp(),
    });
  }

  async releaseSubscriber(eventId: string, subscriberId: string): Promise<void> {
    await adminDb.collection("processed_events").doc(`${eventId}_${subscriberId}`).delete();
  }
}

export { MAX_ATTEMPTS, RETRY_DELAYS_MS };
