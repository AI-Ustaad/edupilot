import { adminDb } from "@/lib/firebase-admin";
import { IMenuRepository } from "@/interfaces/IMenuRepository";

export class MenuRepository implements IMenuRepository {
  async findByTenant(tenantId: string): Promise<any[]> {
    const doc = await adminDb.collection("customMenus").doc(tenantId).get();
    if (!doc.exists) return [];
    return (doc.data()?.items || []) as any[];
  }

  async save(tenantId: string, menuItems: any[]): Promise<void> {
    await adminDb.collection("customMenus").doc(tenantId).set({
      items: menuItems,
      updatedAt: new Date(),
    }, { merge: true });
  }

  async getMenu(tenantId: string): Promise<any[]> {
    return this.findByTenant(tenantId);
  }

  async saveMenu(tenantId: string, menuItems: any[]): Promise<void> {
    await this.save(tenantId, menuItems);
  }
}
