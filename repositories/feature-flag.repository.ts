import { BaseRepository } from "./base.repository";
import { IFeatureFlagRepository } from "@/interfaces/IFeatureFlagRepository";

export class FeatureFlagRepository extends BaseRepository<any> implements IFeatureFlagRepository {
  constructor() {
    super("tenantFeatures");
  }

  async findByTenant(tenantId: string): Promise<any> {
    const doc = await this.db.collection(this.collectionName).doc(tenantId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async setFeature(tenantId: string, feature: string, enabled: boolean): Promise<void> {
    const doc = await this.db.collection(this.collectionName).doc(tenantId).get();
    const current = doc.exists ? (doc.data()?.features || {}) : {};
    await this.db.collection(this.collectionName).doc(tenantId).set({
      features: { ...current, [feature]: enabled },
      updatedAt: new Date(),
    }, { merge: true });
  }

  async getAllFlags(tenantId: string): Promise<Record<string, boolean>> {
    const doc = await this.db.collection(this.collectionName).doc(tenantId).get();
    if (!doc.exists) return {};
    return (doc.data()?.features || {}) as Record<string, boolean>;
  }
}
