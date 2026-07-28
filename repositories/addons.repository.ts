import { BaseRepository } from "./base.repository";
import type { IAddonsRepository } from "@/interfaces/IAddonsRepository";

export class AddonsRepository extends BaseRepository<any> implements IAddonsRepository {
  constructor() {
    super("addons");
  }

  async findByTenant(tenantId: string): Promise<any | null> {
    const doc = await this.db.collection(this.collectionName).doc(tenantId).get();
    if (!doc.exists) return null;
    return doc.data();
  }

  async save(tenantId: string, addons: any): Promise<void> {
    await this.db.collection(this.collectionName).doc(tenantId).set({
      ...addons,
      updatedAt: new Date(),
    }, { merge: true });
  }

  async getAddons(tenantId: string): Promise<any | null> {
    return this.findByTenant(tenantId);
  }

  async saveAddons(tenantId: string, addons: any): Promise<void> {
    return this.save(tenantId, addons);
  }
}
