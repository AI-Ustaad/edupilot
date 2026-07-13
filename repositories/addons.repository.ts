// repositories/addons.repository.ts
import { adminDb } from "@/lib/firebase-admin";

export class AddonsRepository {
  private getRef(tenantId: string) {
    return adminDb.collection("addons").doc(tenantId);
  }

  async getAddons(tenantId: string): Promise<Record<string, any>> {
    const doc = await this.getRef(tenantId).get();
    return doc.exists ? (doc.data() as Record<string, any>) : {};
  }

  async saveAddons(tenantId: string, addons: Record<string, any>): Promise<void> {
    await this.getRef(tenantId).set(addons, { merge: true });
  }
}
