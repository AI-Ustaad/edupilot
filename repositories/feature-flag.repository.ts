import { adminDb } from "@/lib/firebase-admin";
import { IFeatureFlagRepository } from "@/interfaces/IFeatureFlagRepository";

export class FeatureFlagRepository implements IFeatureFlagRepository {
  private collection = "tenantFeatures";

  async findByTenant(tenantId: string): Promise<any> {
    const doc = await adminDb.collection(this.collection).doc(tenantId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async setFeature(tenantId: string, feature: string, enabled: boolean): Promise<void> {
    const doc = await adminDb.collection(this.collection).doc(tenantId).get();
    const current = doc.exists ? (doc.data()?.features || {}) : {};
    await adminDb.collection(this.collection).doc(tenantId).set({
      features: { ...current, [feature]: enabled },
      updatedAt: new Date(),
    }, { merge: true });
  }

  async getAllFlags(tenantId: string): Promise<Record<string, boolean>> {
    const doc = await adminDb.collection(this.collection).doc(tenantId).get();
    if (!doc.exists) return {};
    return (doc.data()?.features || {}) as Record<string, boolean>;
  }
}
