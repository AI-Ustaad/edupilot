import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
import { ITenantRepository } from "@/interfaces/ITenantRepository";
import { BaseRepository } from "./base.repository";

export interface Tenant {
  id?: string;
  name: string;
  domain?: string;
  plan?: string;
  status: "active" | "suspended" | "trialing";
  createdAt?: any;
  updatedAt?: any;
}

export class TenantRepository extends BaseRepository<Tenant> implements ITenantRepository {
  constructor() {
    super("tenants");
  }

  async findActive(): Promise<Tenant[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("status", "==", "active")
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tenant));
  }

  async findByPlan(planId: string): Promise<Tenant[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("plan", "==", planId)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tenant));
  }

  async listAll(): Promise<Tenant[]> {
    const snapshot = await this.db.collection(this.collectionName).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tenant));
  }

  async verifyTenantExists(tenantId: string): Promise<boolean> {
    const doc = await this.db.collection(this.collectionName).doc(tenantId).get();
    return doc.exists;
  }
}
