import { BaseRepository } from "./base.repository";
import { IMenuRepository } from "@/interfaces/IMenuRepository";

export class MenuRepository extends BaseRepository<any> implements IMenuRepository {
  constructor() {
    super("customMenus");
  }

  async findByTenant(tenantId: string): Promise<any[]> {
    const doc = await this.db.collection(this.collectionName).doc(tenantId).get();
    if (!doc.exists) return [];
    return (doc.data()?.items || []) as any[];
  }

  async save(tenantId: string, menuItems: any[]): Promise<void> {
    await this.db.collection(this.collectionName).doc(tenantId).set({
      items: menuItems,
      updatedAt: new Date(),
    }, { merge: true });
  }

  async getMenu(tenantId: string): Promise<any[]> {
    return this.findByTenant(tenantId);
  }

  async saveMenu(tenantId: string, menuItems: any[]): Promise<void> {
    return this.save(tenantId, menuItems);
  }
}
