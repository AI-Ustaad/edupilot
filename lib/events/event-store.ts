// lib/events/event-store.ts
import { DomainEvent, DomainEventMetadata, DomainEventEnvelope } from "./domain-events";
import { adminDb, dbTimestamp } from "@/lib/firebase-admin";

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
    const docRef = await adminDb.collection(this.eventsCollection).add({
      ...event,
      occurredAt: dbTimestamp,
      metadata,
    });
    return docRef.id;
  }

  async replay(tenantId: string, from?: Date, to?: Date): Promise<DomainEventEnvelope[]> {
    let query = adminDb
      .collection(this.eventsCollection)
      .where("tenantId", "==", tenantId)
      .orderBy("occurredAt", "desc");

    if (from) query = query.where("occurredAt", ">=", from);
    if (to) query = query.where("occurredAt", "<=", to);

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      event: doc.data() as DomainEvent,
      metadata: doc.data().metadata || {},
      headers: {},
      timestamp: doc.data().occurredAt?.toDate() || new Date(),
      attempts: 0,
    } as DomainEventEnvelope));
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
