import { BaseRepository } from "./base.repository";
import type { BuildingDocument } from "@/documents/BuildingDocument";
import type { IBuildingRepository } from "@/interfaces/IBuildingRepository";

export class BuildingRepository extends BaseRepository<BuildingDocument> implements IBuildingRepository {
  constructor() {
    super("buildings");
  }

  async getAll(tenantId: string) {
    const snapshot = await this.db.collection(this.collectionName).where("tenantId", "==", tenantId).where("deleted", "==", false).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BuildingDocument & { id: string }));
  }
}
