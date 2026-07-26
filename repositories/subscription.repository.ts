import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
import { PLANS } from "@/lib/config/subscription-plans";
import { eventBus } from "@/lib/events/event-bus";
import { EVENTS } from "@/lib/events/event-types";
import { invalidateCache } from "@/lib/cache";
import { ISubscriptionRepository } from "@/interfaces/ISubscriptionRepository";
import { BaseRepository } from "./base.repository";

export interface Subscription {
  id?: string;
  tenantId: string;
  planId: string;
  status: "active" | "canceled" | "trialing" | "past_due";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt?: any;
  updatedAt?: any;
}

export class SubscriptionRepository extends BaseRepository<Subscription> implements ISubscriptionRepository {
  constructor() {
    super("subscriptions");
  }

  async findByTenant(tenantId: string): Promise<Subscription | null> {
    const doc = await this.db.collection(this.collectionName).doc(tenantId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Subscription;
  }

  async activate(tenantId: string, planId: string, userId?: string): Promise<void> {
    const subscription: Subscription = {
      tenantId,
      planId,
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    await this.db.collection(this.collectionName).doc(tenantId).set({
      ...subscription,
      updatedAt: dbTimestamp,
    }, { merge: true });

    await invalidateCache(`subscription:${tenantId}`);

    if (userId) {
      eventBus.publish(EVENTS.SUBSCRIPTION_ACTIVATED, { tenantId, planId, userId }, tenantId);
    }
  }

  async cancel(tenantId: string, userId?: string): Promise<void> {
    await this.db.collection(this.collectionName).doc(tenantId).set({
      planId: "free",
      status: "canceled",
      updatedAt: dbTimestamp,
    }, { merge: true });

    await invalidateCache(`subscription:${tenantId}`);

    if (userId) {
      eventBus.publish(EVENTS.SUBSCRIPTION_CANCELED, { tenantId, userId }, tenantId);
    }
  }

  async listAll(): Promise<Subscription[]> {
    const snapshot = await this.db.collection(this.collectionName).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subscription));
  }
}
