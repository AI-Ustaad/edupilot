// repositories/menu.repository.ts
import { adminDb } from "@/lib/firebase-admin";

export class MenuRepository {
  private getRef(tenantId: string) {
    return adminDb.collection("customMenus").doc(tenantId);
  }

  async getMenu(tenantId: string): Promise<Record<string, any>> {
    const doc = await this.getRef(tenantId).get();
    return doc.exists ? (doc.data() as Record<string, any>) : {};
  }

  async saveMenu(tenantId: string, menu: Record<string, any>): Promise<void> {
    await this.getRef(tenantId).set(menu, { merge: true });
  }
}
