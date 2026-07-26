import { adminDb } from "@/lib/firebase-admin";
import { IAddonsRepository } from "@/interfaces/IAddonsRepository";

export class AddonsRepository implements IAddonsRepository {
  async findByTenant(tenantId: string): Promise<any | null> {
    const doc = await adminDb.collection("addons").doc(tenantId).get();
    if (!doc.exists) return null;
    return doc.data();
  }

  async save(tenantId: string, addons: any): Promise<void> {
    await adminDb.collection("addons").doc(tenantId).set({
      ...addons,
      updatedAt: new Date(),
    }, { merge: true });
  }

  async getAddons(tenantId: string): Promise<any | null> {
    return this.findByTenant(tenantId);
  }

  async saveAddons(tenantId: string, addons: any): Promise<void> {
    await this.save(tenantId, addons);
  }
}
