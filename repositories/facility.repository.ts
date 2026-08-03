import { BaseRepository } from "./base.repository";
import type { FacilityDocument } from "@/documents/FacilityDocument";
import type { IFacilityRepository } from "@/interfaces/IFacilityRepository";

export class FacilityRepository extends BaseRepository<FacilityDocument> implements IFacilityRepository {
  constructor() {
    super("facilities");
  }

  async getAll(tenantId: string) {
    const snapshot = await this.db.collection(this.collectionName).where("tenantId", "==", tenantId).where("deleted", "==", false).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FacilityDocument & { id: string }));
  }
}
