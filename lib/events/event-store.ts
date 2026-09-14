import { DomainEvent, DomainEventMetadata, DomainEventEnvelope } from "./domain-events";
import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
import { EVENT_STATUS } from "@/types/event";

export interface EventStore {
  append(event: DomainEvent, metadata: DomainEventMetadata): Promise<string>;
  replay(tenantId: string, from?: Date, to?: Date): Promise<DomainEventEnvelope[]>;
  getByIdempotencyKey(key: string): Promise<boolean>;
  markAsProcessed(key: string): Promise<void>;
}

export class FirestoreEventStore implements EventStore {
  private eventsCollection = "events";
  private processedCollection = "processed_events";

  async append(event: DomainEvent, metadata: DomainEventMetadata): Promise<string> {
    const eventId = event.eventId || crypto.randomUUID();
    const docRef = adminDb.collection(this.eventsCollection).doc(eventId);
    const eventData = {
      ...event,
      eventId,
      eventName: `${event.eventType}.v1`,
      eventVersion: event.version || 1,
      eventSchemaVersion: 1,
      status: EVENT_STATUS.PENDING,
      attempts: 0,
      nextRetry: new Date(),
      retryHistory: [],
      occurredAt: dbTimestamp,
      createdAt: dbTimestamp,
      metadata: metadata || {},
    };
    await docRef.set(eventData);
    return eventId;
  }

  async replay(tenantId: string, from?: Date, to?: Date): Promise<DomainEventEnvelope[]> {
    let query = adminDb
      .collection(this.eventsCollection)
      .where("tenantId", "==", tenantId)
      .orderBy("occurredAt", "desc");

    if (from) query = query.where("occurredAt", ">=", from);
    if (to) query = query.where("occurredAt", "<=", to);

    const snapshot = await query.get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      const rawDate = data.occurredAt || data.createdAt;
      const timestamp = rawDate?.toDate ? rawDate.toDate() : rawDate ? new Date(rawDate) : new Date();
      return {
        event: data as DomainEvent,
        metadata: data.metadata || {},
        headers: {},
        timestamp,
        attempts: data.attempts ?? 0,
      } as DomainEventEnvelope;
    });
  }

  async getByIdempotencyKey(key: string): Promise<boolean> {
    const doc = await adminDb.collection(this.processedCollection).doc(key).get();
    return doc.exists;
  }

  async markAsProcessed(key: string): Promise<void> {
    await adminDb.collection(this.processedCollection).doc(key).set({
      processedAt: dbTimestamp,
    });
  }
}
