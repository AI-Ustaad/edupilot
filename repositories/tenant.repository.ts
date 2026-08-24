import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
import { ITenantRepository } from "@/interfaces/ITenantRepository";
import { BaseRepository } from "./base.repository";
import { logger } from "@/lib/logger/logger";

export interface Tenant {
  id?: string;
  name: string;
  domain?: string;
  plan?: string;
  ownerId?: string;
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

  /**
   * ✅ خودکار مرمت کے ساتھ ٹیننٹ کی موجودگی چیک کریں
   */
  async verifyTenantExists(tenantId: string): Promise<boolean> {
    const doc = await this.db.collection(this.collectionName).doc(tenantId).get();
    if (doc.exists) {
      return true;
    }

    // 🔁 اگر ماسٹر ڈاکیومنٹ نہیں ملا تو کانفیگریشن سے بحال کرنے کی کوشش
    try {
      const configDoc = await this.db
        .collection("tenants")
        .doc(tenantId)
        .collection("settings")
        .doc("config")
        .get();

      if (configDoc.exists) {
        const config = configDoc.data() as any;
        const name = config?.school?.name || "Untitled School";
        const type = config?.school?.type || "Private";
        const curriculum = config?.school?.curriculumId || "custom";
        const ownerId =
          config?.metadata?.configuredBy ||
          config?.version?.createdBy ||
          "system";

        await this.db.collection(this.collectionName).doc(tenantId).set({
          name,
          type,
          curriculum,
          ownerId,
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        logger.info("TENANT_AUTO_RESTORED", { tenantId, name });
        return true;
      }
    } catch (error) {
      logger.error("TENANT_AUTO_RESTORE_FAILED", {
        metadata: { tenantId, error: error instanceof Error ? error.message : String(error) },
      });
    }

    return false;
  }

  async restoreTenant(tenantId: string, data: Record<string, any>): Promise<void> {
    const tenantRef = this.db.collection(this.collectionName).doc(tenantId);
    const existing = await tenantRef.get();
    if (existing.exists) {
      throw new Error(`Tenant document ${tenantId} already exists and will not be overwritten`);
    }
    await tenantRef.set(data);
  }

  async verifyUserTenantAssociation(userId: string, tenantId: string): Promise<boolean> {
    const userDoc = await this.db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return false;
    }
    const data = userDoc.data();
    return data?.tenantId === tenantId;
  }
}
