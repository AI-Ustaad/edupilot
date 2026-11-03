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
  stripeCustomerId?: string;
  stripeSubscriptionId?: string | null;
  cancelAtPeriodEnd?: boolean;
  maxStudents?: number;
  maxStaff?: number;
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

  async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null> {
    if (!stripeSubscriptionId) return null;
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("stripeSubscriptionId", "==", stripeSubscriptionId)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Subscription;
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<Subscription | null> {
    if (!stripeCustomerId) return null;
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("stripeCustomerId", "==", stripeCustomerId)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Subscription;
  }

  async updateSubscription(tenantId: string, data: Partial<Subscription>): Promise<void> {
    await this.db.collection(this.collectionName).doc(tenantId).set(
      {
        tenantId,
        ...data,
        updatedAt: dbTimestamp,
      },
      { merge: true }
    );
    await invalidateCache(`subscription:${tenantId}`);
  }

  async activate(
    tenantId: string,
    planId: string,
    userId?: string,
    extraData: Partial<Subscription> = {}
  ): Promise<void> {
    const plan = PLANS[planId] || PLANS.free;
    const subscription: Subscription = {
      tenantId,
      planId,
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      maxStudents: plan.maxStudents,
      maxStaff: plan.maxStaff,
      cancelAtPeriodEnd: false,
      ...extraData,
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
    const freePlan = PLANS.free;
    await this.db.collection(this.collectionName).doc(tenantId).set({
      planId: "free",
      status: "canceled",
      stripeSubscriptionId: null,
      cancelAtPeriodEnd: false,
      maxStudents: freePlan.maxStudents,
      maxStaff: freePlan.maxStaff,
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
