import { BaseRepository } from "./base.repository";
import type { HouseDocument } from "@/documents/HouseDocument";
import type { IHouseRepository } from "@/interfaces/IHouseRepository";

export class HouseRepository extends BaseRepository<HouseDocument> implements IHouseRepository {
  constructor() {
    super("houses");
  }

  async getAll(tenantId: string) {
    const snapshot = await this.db.collection(this.collectionName).where("tenantId", "==", tenantId).where("deleted", "==", false).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HouseDocument & { id: string }));
  }
}
